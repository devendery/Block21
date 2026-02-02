// server/monitor.js
const fs = require('fs');
const path = require('path');

class GameMonitor {
  constructor() {
    this.metrics = {
      players: 0,
      memory: 0,
      cpu: 0,
      network: 0,
      collisions: 0,
      fps: 60
    };
    
    this.startMonitoring();
  }
  
  startMonitoring() {
    setInterval(() => {
      this.updateMetrics();
      this.checkThresholds();
      this.logMetrics();
    }, 5000); // Every 5 seconds
  }
  
  updateMetrics() {
    // Get current metrics from your game server
    // This would integrate with your actual game state
    this.metrics.memory = process.memoryUsage().heapUsed / 1024 / 1024;
    this.metrics.players = this.getPlayerCount(); // Implement this
  }
  
  checkThresholds() {
    const warnings = [];
    
    if (this.metrics.memory > 500) warnings.push('Memory > 500MB');
    if (this.metrics.players > 200) warnings.push('Players > 200');
    if (this.metrics.fps < 30) warnings.push('FPS < 30');
    
    if (warnings.length > 0) {
      console.warn(`⚠️  WARNINGS: ${warnings.join(', ')}`);
    }
  }
  
  logMetrics() {
    const logEntry = {
      timestamp: new Date().toISOString(),
      metrics: { ...this.metrics }
    };
    
    fs.appendFileSync(
      path.join(__dirname, 'metrics.log'),
      JSON.stringify(logEntry) + '\n'
    );
  }
}

module.exports = GameMonitor;