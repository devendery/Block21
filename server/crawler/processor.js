const cheerio = require('cheerio');
const { URL } = require('url');

class Processor {
    constructor(config = {}) {
        this.extractText = config.extractText !== false;
        this.extractMetadata = config.extractMetadata !== false;
        this.extractLinks = config.extractLinks !== false;
    }

    process(html, baseUrl) {
        if (!html) return null;

        const $ = cheerio.load(html);
        const result = {
            url: baseUrl,
            timestamp: new Date().toISOString()
        };

        // Extract Metadata
        if (this.extractMetadata) {
            result.metadata = {
                title: $('title').text().trim() || '',
                description: $('meta[name="description"]').attr('content') || 
                             $('meta[property="og:description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                ogTitle: $('meta[property="og:title"]').attr('content') || '',
                ogImage: $('meta[property="og:image"]').attr('content') || '',
                favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || ''
            };

            // Resolve favicon URL
            if (result.metadata.favicon && baseUrl) {
                try {
                    result.metadata.favicon = new URL(result.metadata.favicon, baseUrl).href;
                } catch (e) {
                    // Ignore invalid URL
                }
            }
        }

        // Extract Text Content
        if (this.extractText) {
            // Clone body to avoid modifying the original for other extractions if needed
            const $body = $('body').clone();
            
            // Remove non-content elements
            $body.find('script, style, noscript, iframe, svg, header, footer, nav').remove();
            
            result.content = {
                text: $body.text().replace(/\s+/g, ' ').trim(),
                htmlLength: html.length
            };
        }

        // Extract Links
        if (this.extractLinks) {
            const links = new Set();
            const externalLinks = new Set();
            
            $('a').each((i, elem) => {
                const href = $(elem).attr('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                    try {
                        const absoluteUrl = new URL(href, baseUrl).href;
                        const baseHostname = new URL(baseUrl).hostname;
                        const linkHostname = new URL(absoluteUrl).hostname;

                        if (linkHostname === baseHostname || linkHostname.endsWith(`.${baseHostname}`)) {
                            links.add(absoluteUrl);
                        } else {
                            externalLinks.add(absoluteUrl);
                        }
                    } catch (e) {
                        // Invalid URL
                    }
                }
            });

            result.links = {
                internal: Array.from(links),
                external: Array.from(externalLinks)
            };
        }

        return result;
    }
}

module.exports = Processor;
