const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Storage {
    constructor(config = {}) {
        this.outputDir = config.outputDir || path.join(process.cwd(), 'crawled_data');
        this.format = config.format || 'json';
        
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    _getFilename(url) {
        // Create a safe filename from URL
        const hash = crypto.createHash('md5').update(url).digest('hex');
        const safeUrl = url.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
        return `${safeUrl}_${hash}.${this.format}`;
    }

    async save(data) {
        try {
            const filename = this._getFilename(data.url);
            const filepath = path.join(this.outputDir, filename);
            
            await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2));
            return filepath;
        } catch (error) {
            console.error(`Error saving data for ${data.url}:`, error);
            throw error;
        }
    }

    async index() {
        // Return list of crawled files
        return fs.promises.readdir(this.outputDir);
    }
}

module.exports = Storage;
