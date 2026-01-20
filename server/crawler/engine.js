const Fetcher = require('./fetcher');
const Processor = require('./processor');
const Storage = require('./storage');
const RequestQueue = require('./queue');
const RobotsManager = require('./robots');
const { URL } = require('url');

class CrawlerEngine {
    constructor(config = {}) {
        this.config = {
            maxDepth: 2,
            maxPages: 100,
            concurrency: 2,
            rateLimit: 1000, // ms between requests
            allowedDomains: [], // if empty, auto-detected from seed URLs
            userAgent: 'Block21Bot/1.0',
            ...config
        };

        this.fetcher = new Fetcher(config.fetcher);
        this.processor = new Processor(config.processor);
        this.storage = new Storage(config.storage);
        this.queue = new RequestQueue();
        this.robots = new RobotsManager();
        
        this.activeRequests = 0;
        this.pagesCrawled = 0;
        this.isPaused = false;
        this.isStopped = false;
    }

    async start(startUrls) {
        if (!Array.isArray(startUrls)) startUrls = [startUrls];
        
        for (const url of startUrls) {
            this.queue.add(url, 0);
            
            // Add domain to allowed list if empty
            if (this.config.allowedDomains.length === 0) {
                try {
                    const hostname = new URL(url).hostname;
                    this.config.allowedDomains.push(hostname);
                    console.log(`Auto-added allowed domain: ${hostname}`);
                } catch(e) {}
            }
        }

        console.log(`Starting crawl with ${startUrls.length} seeds. Max Pages: ${this.config.maxPages}, Max Depth: ${this.config.maxDepth}`);
        await this.loop();
    }

    async loop() {
        while (!this.isStopped && (this.queue.size > 0 || this.activeRequests > 0)) {
            if (this.isPaused) {
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            if (this.queue.size > 0 && this.activeRequests < this.config.concurrency && this.pagesCrawled < this.config.maxPages) {
                const item = this.queue.next();
                this.processUrl(item); // Start async processing
            } else {
                // Wait a bit if queue empty or max concurrency reached
                await new Promise(r => setTimeout(r, 100));
            }
            
            if (this.pagesCrawled >= this.config.maxPages && this.activeRequests === 0) {
                console.log('Max pages reached.');
                break;
            }
        }
        console.log('Crawl loop finished.');
    }

    async processUrl(item) {
        this.activeRequests++;
        const { url, depth } = item;
        
        try {
            // Check Robots.txt
            // We use a generic UA for robots check to be safe, or the configured one
            const allowed = await this.robots.isAllowed(url, this.config.userAgent);
            if (!allowed) {
                console.log(`Blocked by robots.txt: ${url}`);
                return;
            }

            // Rate Limit / Crawl Delay
            // Respect robots.txt crawl-delay if present and larger than config
            const robotDelay = (await this.robots.getCrawlDelay(url, this.config.userAgent)) * 1000;
            const delay = Math.max(this.config.rateLimit, robotDelay);
            
            // Simple global rate limiting for now (could be per-domain)
            // Since we process in parallel, this `await` only delays this specific "thread".
            // To truly limit global rate, we'd need a token bucket. 
            // For now, relying on concurrency limit + simple delay is "good enough" for prototype.
            // A better way: global sleep before fetching.
            await new Promise(r => setTimeout(r, delay));

            console.log(`Fetching: ${url} (Depth: ${depth})`);
            
            // Fetch
            const fetchResult = await this.fetcher.fetch(url);
            
            // Process
            const processedData = this.processor.process(fetchResult.data, url);
            
            if (processedData) {
                // Save
                await this.storage.save(processedData);
                this.pagesCrawled++;

                // Queue links
                if (depth < this.config.maxDepth && processedData.links && processedData.links.internal) {
                    let newLinksCount = 0;
                    for (const link of processedData.links.internal) {
                         if (this._isAllowedDomain(link)) {
                             if (this.queue.add(link, depth + 1)) {
                                 newLinksCount++;
                             }
                         }
                    }
                    // console.log(`  > Found ${processedData.links.internal.length} links, queued ${newLinksCount} new.`);
                }
            }

        } catch (error) {
            console.error(`Error processing ${url}: ${error.message}`);
        } finally {
            this.activeRequests--;
        }
    }

    _isAllowedDomain(url) {
        try {
            const hostname = new URL(url).hostname;
            // Allow if exact match or subdomain
            return this.config.allowedDomains.some(d => hostname === d || hostname.endsWith(`.${d}`));
        } catch (e) {
            return false;
        }
    }

    stop() {
        this.isStopped = true;
    }
}

module.exports = CrawlerEngine;
