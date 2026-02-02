import { Player } from "../../shared/schemas/GameState";

interface PlayerSaveData {
  id: string;
  name: string;
  highScore: number;
  totalMass: number;
  skins: number[];
  playTime: number;
  lastPlayed: number;
  createdAt: number;
}

export class PersistenceSystem {
  private playerData: Map<string, PlayerSaveData> = new Map();
  private saveInterval: NodeJS.Timeout | null = null;
  private readonly SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  
  constructor() {
    this.startAutoSave();
    this.startCleanup();
    this.loadAllData();
  }
  
  // Start automatic saving
  private startAutoSave() {
    this.saveInterval = setInterval(() => {
      this.saveAllPlayers();
      console.log(`Auto-saved ${this.playerData.size} players`);
    }, this.SAVE_INTERVAL);
  }
  
  // Start cleanup of old data
  private startCleanup() {
    setInterval(() => {
      this.cleanupOldData();
    }, this.CLEANUP_INTERVAL);
  }
  
  // Save player progress
  savePlayer(player: Player) {
    const saveData: PlayerSaveData = {
      id: player.id,
      name: player.name,
      highScore: Math.max(player.score, this.getHighScore(player.id) || 0),
      totalMass: (this.getTotalMass(player.id) || 0) + player.mass,
      skins: this.getUnlockedSkins(player.id) || [0], // Default skin
      playTime: (this.getPlayTime(player.id) || 0) + 1, // Increment play sessions
      lastPlayed: Date.now(),
      createdAt: this.getCreatedAt(player.id) || Date.now()
    };
    
    this.playerData.set(player.id, saveData);
  }
  
  // Save all players
  saveAllPlayers() {
    // In production, save to database
    // For now, save to memory
    const saveTime = Date.now();
    const saveData = {
      timestamp: saveTime,
      players: Array.from(this.playerData.entries())
    };
    void saveData;
  }
  
  // Load player data
  loadPlayer(playerId: string): PlayerSaveData | null {
    // Try memory first
    if (this.playerData.has(playerId)) {
      return this.playerData.get(playerId)!;
    }
    
    // Try server/database (simulated)
    const serverData = this.loadFromServer(playerId);
    if (serverData) {
      this.playerData.set(playerId, serverData);
      return serverData;
    }
    
    return null;
  }
  
  // Load all data on startup
  private loadAllData() {
  }
  
  // Get player high score
  getHighScore(playerId: string): number {
    const data = this.loadPlayer(playerId);
    return data?.highScore || 0;
  }
  
  // Get total accumulated mass
  getTotalMass(playerId: string): number {
    const data = this.loadPlayer(playerId);
    return data?.totalMass || 0;
  }
  
  // Get unlocked skins
  getUnlockedSkins(playerId: string): number[] {
    const data = this.loadPlayer(playerId);
    return data?.skins || [0];
  }
  
  // Get play time (in sessions)
  getPlayTime(playerId: string): number {
    const data = this.loadPlayer(playerId);
    return data?.playTime || 0;
  }
  
  // Get creation timestamp
  getCreatedAt(playerId: string): number {
    const data = this.loadPlayer(playerId);
    return data?.createdAt || Date.now();
  }
  
  // Unlock a skin for player
  unlockSkin(playerId: string, skinId: number) {
    const data = this.loadPlayer(playerId);
    if (data) {
      if (!data.skins.includes(skinId)) {
        data.skins.push(skinId);
        this.playerData.set(playerId, data);
      }
    }
  }
  
  // Cleanup old data (players inactive for 30 days)
  private cleanupOldData() {
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    
    let removed = 0;
    for (const [playerId, data] of this.playerData.entries()) {
      if (now - data.lastPlayed > THIRTY_DAYS) {
        // Archive or delete old player data
        this.playerData.delete(playerId);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`Cleaned up ${removed} inactive players`);
    }
  }
  
  // Simulated server load (replace with actual API call)
  private loadFromServer(playerId: string): PlayerSaveData | null {
    // In production, this would be a database query
    return null;
  }
  
  // Simulated server save (replace with actual API call)
  private saveToServer(data: any): void {
    // In production, send to your backend API
    // Example: fetch('/api/players/save', { method: 'POST', body: JSON.stringify(data) });
  }
  
  // Get leaderboard
  getLeaderboard(limit: number = 100): PlayerSaveData[] {
    return Array.from(this.playerData.values())
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, limit);
  }
  
  // Graceful shutdown
  shutdown() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    // Final save
    this.saveAllPlayers();
    console.log('Persistence system shut down gracefully');
  }
}
