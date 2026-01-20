const robotsParser = require('robots-parser');
const axios = require('axios');
const { URL } = require('url');

class RobotsManager {
    constructor() {
        this.cache = new Map(); // domain -> parser instance
    }

    async getRobot(url) {
        try {
            const u = new URL(url);
            const origin = u.origin;
            
            if (this.cache.has(origin)) {
                return this.cache.get(origin);
            }

            const robotsUrl = `${origin}/robots.txt`;
            // console.log(`Checking robots.txt: ${robotsUrl}`);
            
            try {
                const response = await axios.get(robotsUrl, { 
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Block21Bot/1.0' // Use a generic UA for checking robots.txt
                    }
                });
                const robot = robotsParser(robotsUrl, response.data);
                this.cache.set(origin, robot);
                return robot;
            } catch (e) {
                // If robots.txt doesn't exist or fails, assume full access
                // console.log(`No robots.txt found for ${origin}, allowing all.`);
                const robot = robotsParser(robotsUrl, '');
                this.cache.set(origin, robot);
                return robot;
            }
        } catch (e) {
            console.error('Invalid URL in RobotsManager:', url);
            return null;
        }
    }

    async isAllowed(url, userAgent) {
        const robot = await this.getRobot(url);
        if (!robot) return false;
        return robot.isAllowed(url, userAgent);
    }

    async getCrawlDelay(url, userAgent) {
        const robot = await this.getRobot(url);
        if (!robot) return 0;
        return robot.getCrawlDelay(userAgent) || 0;
    }
}

module.exports = RobotsManager;
