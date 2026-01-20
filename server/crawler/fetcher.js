const axios = require('axios');

const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
];

class Fetcher {
    constructor(config = {}) {
        this.timeout = config.timeout || 10000;
        this.retries = config.retries || 3;
        this.retryDelay = config.retryDelay || 1000;
        this.headers = config.headers || {};
    }

    _getRandomUserAgent() {
        return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    }

    async fetch(url, options = {}) {
        const retries = options.retries || this.retries;
        let attempt = 0;
        let lastError;

        while (attempt <= retries) {
            try {
                const headers = {
                    'User-Agent': this._getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    ...this.headers,
                    ...options.headers
                };

                const response = await axios.get(url, {
                    timeout: this.timeout,
                    headers: headers,
                    validateStatus: function (status) {
                        return status >= 200 && status < 300; // default
                    },
                    ...options.axiosConfig
                });

                return {
                    url: response.config.url,
                    status: response.status,
                    headers: response.headers,
                    data: response.data,
                    timing: {
                        startTime: Date.now(), // Rough timing, axios has interceptors for precise timing but this is simple
                    }
                };

            } catch (error) {
                lastError = error;
                attempt++;
                
                // Don't retry on 404
                if (error.response && error.response.status === 404) {
                    throw new Error(`Failed to fetch ${url}: 404 Not Found`);
                }

                if (attempt <= retries) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log(`Retrying ${url} (Attempt ${attempt + 1}/${retries + 1}) in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts: ${lastError.message}`);
    }
}

module.exports = Fetcher;
