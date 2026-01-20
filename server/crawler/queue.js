class RequestQueue {
    constructor() {
        this.queue = [];
        this.seen = new Set();
    }

    add(url, depth = 0) {
        // Normalize URL (remove trailing slash, etc)
        const normalizedUrl = url.replace(/\/$/, '');
        
        if (!this.seen.has(normalizedUrl)) {
            this.seen.add(normalizedUrl);
            this.queue.push({ url: normalizedUrl, depth });
            return true;
        }
        return false;
    }

    next() {
        return this.queue.shift();
    }

    get size() {
        return this.queue.length;
    }

    get totalSeen() {
        return this.seen.size;
    }
}

module.exports = RequestQueue;
