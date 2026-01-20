const CrawlerEngine = require('./engine');

class CrawlerService {
    constructor() {
        this.engine = null;
    }

    async startCrawl(url, options = {}) {
        console.log(`Starting crawler service for ${url}`);
        this.engine = new CrawlerEngine(options);
        await this.engine.start(url);
        return {
            pages: this.engine.pagesCrawled,
            totalSeen: this.engine.queue.totalSeen
        };
    }

    stop() {
        if (this.engine) {
            this.engine.stop();
        }
    }
}

// Simple CLI usage if run directly
if (require.main === module) {
    const url = process.argv[2];
    if (!url) {
        console.log('Usage: node server/crawler/index.js <url>');
        process.exit(1);
    }
    
    const service = new CrawlerService();
    service.startCrawl(url, { maxPages: 20, maxDepth: 2 })
        .then(stats => console.log('Done:', stats))
        .catch(err => console.error(err));
}

module.exports = CrawlerService;
