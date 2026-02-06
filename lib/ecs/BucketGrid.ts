// lib/ecs/BucketGrid.ts - OPTIMIZED VERSION 
import { Vector2 } from '../../shared/types/Vector2'; 

export const CELL_SIZE = 400;

export function rebuildBuckets(): void {
}

export function adaptGrid(_slow: boolean): void {
}

export class BucketGrid<T extends { position: Vector2; radius: number }> { 
  private cellSize: number; 
  private cells: Map<string, Set<T>>; 
  
  // ⚠️ OPTIMIZATION: Cache cell keys and bounds 
  private cellKeyCache: Map<number, Map<number, string>>; 
  private readonly CACHE_SIZE = 1000; 
  private cacheHits = 0; 
  private cacheMisses = 0; 
  
  // ⚠️ OPTIMIZATION: Track dirty cells to avoid full clears 
  private dirtyCells: Set<string> = new Set(); 
  private lastFullClear = 0; 
  private readonly FULL_CLEAR_INTERVAL = 60; // Frames 

  constructor(cellSize: number) { 
    this.cellSize = cellSize; 
    this.cells = new Map(); 
    this.cellKeyCache = new Map(); 
  } 

  // ⚠️ OPTIMIZATION: Cached cell key calculation 
  private getCellKey(x: number, y: number): string { 
    const cellX = Math.floor(x / this.cellSize); 
    const cellY = Math.floor(y / this.cellSize); 
    
    // Check cache first 
    let yMap = this.cellKeyCache.get(cellX); 
    if (yMap) { 
      const cached = yMap.get(cellY); 
      if (cached) { 
        this.cacheHits++; 
        return cached; 
      } 
    } else { 
      yMap = new Map(); 
      this.cellKeyCache.set(cellX, yMap); 
    } 
    
    // Cache miss, calculate and store 
    this.cacheMisses++; 
    const key = `${cellX},${cellY}`; 
    yMap.set(cellY, key); 
    
    // Limit cache size 
    if (this.cellKeyCache.size > this.CACHE_SIZE) { 
      const firstKey = this.cellKeyCache.keys().next().value; 
      if (firstKey !== undefined) { 
        this.cellKeyCache.delete(firstKey); 
      } 
    } 
    
    return key; 
  } 

  clear(): void { 
    // ⚠️ OPTIMIZATION: Only clear dirty cells most of the time 
    const now = performance.now(); 
    if (now - this.lastFullClear < 1000 / 30 * this.FULL_CLEAR_INTERVAL) { 
      // Clear only dirty cells 
      this.dirtyCells.forEach(cellKey => { 
        const cell = this.cells.get(cellKey); 
        if (cell) { 
          cell.clear(); 
        } 
      }); 
      this.dirtyCells.clear(); 
    } else { 
      // Periodic full clear 
      this.cells.clear(); 
      this.lastFullClear = now; 
    } 
  } 

  insert(item: T): void { 
    const key = this.getCellKey(item.position.x, item.position.y); 
    
    let cell = this.cells.get(key); 
    if (!cell) { 
      cell = new Set(); 
      this.cells.set(key, cell); 
    } 
    
    cell.add(item); 
    this.dirtyCells.add(key); 
  } 

  remove(item: T): void { 
    const key = this.getCellKey(item.position.x, item.position.y); 
    const cell = this.cells.get(key); 
    if (cell) { 
      cell.delete(item); 
      this.dirtyCells.add(key); 
    } 
  } 

  // ⚠️ OPTIMIZATION: Batch insert for better performance 
  insertBatch(items: T[]): void { 
    const batchMap = new Map<string, T[]>(); 
    
    // Group items by cell 
    for (const item of items) { 
      const key = this.getCellKey(item.position.x, item.position.y); 
      if (!batchMap.has(key)) { 
        batchMap.set(key, []); 
      } 
      batchMap.get(key)!.push(item); 
    } 
    
    // Insert batches 
    batchMap.forEach((batchItems, key) => { 
      let cell = this.cells.get(key); 
      if (!cell) { 
        cell = new Set(); 
        this.cells.set(key, cell); 
      } 
      
      for (let i = 0; i < batchItems.length; i++) { 
        cell.add(batchItems[i]); 
      } 
      this.dirtyCells.add(key); 
    }); 
  } 

  // ⚠️ OPTIMIZATION: Optimized query with early exits 
  query(position: Vector2, radius: number): T[] { 
    const result: T[] = []; 
    
    // Calculate search bounds in cell coordinates 
    const minX = Math.floor((position.x - radius) / this.cellSize); 
    const maxX = Math.floor((position.x + radius) / this.cellSize); 
    const minY = Math.floor((position.y - radius) / this.cellSize); 
    const maxY = Math.floor((position.y + radius) / this.cellSize); 
    
    const radiusSquared = radius * radius; 
    
    for (let cellX = minX; cellX <= maxX; cellX++) { 
      for (let cellY = minY; cellY <= maxY; cellY++) { 
        const key = this.getCellKey(cellX * this.cellSize, cellY * this.cellSize); 
        const cell = this.cells.get(key); 
        
        if (!cell) continue; 
        
        // ⚠️ OPTIMIZATION: Early distance check for cell 
        const cellCenterX = (cellX + 0.5) * this.cellSize; 
        const cellCenterY = (cellY + 0.5) * this.cellSize; 
        const dx = cellCenterX - position.x; 
        const dy = cellCenterY - position.y; 
        const cellDistanceSquared = dx * dx + dy * dy; 
        
        // If cell is far away, skip checking individual items 
        const maxCellDistance = radius + this.cellSize * 0.5 * Math.SQRT2; 
        if (cellDistanceSquared > maxCellDistance * maxCellDistance) { 
          continue; 
        } 
        
        // Check items in cell 
        cell.forEach(item => { 
          const dx = item.position.x - position.x; 
          const dy = item.position.y - position.y; 
          const distanceSquared = dx * dx + dy * dy; 
          
          if (distanceSquared <= radiusSquared) { 
            result.push(item); 
          } 
        }); 
      } 
    } 
    
    return result; 
  }

  // ⚠️ OPTIMIZATION: Fast proximity check without building result array 
  hasNearby(position: Vector2, radius: number): boolean { 
    const minX = Math.floor((position.x - radius) / this.cellSize); 
    const maxX = Math.floor((position.x + radius) / this.cellSize); 
    const minY = Math.floor((position.y - radius) / this.cellSize); 
    const maxY = Math.floor((position.y + radius) / this.cellSize); 
    
    const radiusSquared = radius * radius; 
    
    for (let cellX = minX; cellX <= maxX; cellX++) { 
      for (let cellY = minY; cellY <= maxY; cellY++) { 
        const key = this.getCellKey(cellX * this.cellSize, cellY * this.cellSize); 
        const cell = this.cells.get(key); 
        
        if (!cell) continue; 
        
        // Fast cell distance check 
        const cellCenterX = (cellX + 0.5) * this.cellSize; 
        const cellCenterY = (cellY + 0.5) * this.cellSize; 
        const dx = cellCenterX - position.x; 
        const dy = cellCenterY - position.y; 
        const cellDistanceSquared = dx * dx + dy * dy; 
        
        const maxCellDistance = radius + this.cellSize * 0.5 * Math.SQRT2; 
        if (cellDistanceSquared > maxCellDistance * maxCellDistance) { 
          continue; 
        } 
        
        // Check first item that's close enough 
        let found = false;
        cell.forEach(item => { 
          if (found) return;
          const dx = item.position.x - position.x; 
          const dy = item.position.y - position.y; 
          const distanceSquared = dx * dx + dy * dy; 
          
          if (distanceSquared <= radiusSquared) { 
            found = true;
          } 
        });
        if (found) return true; 
      } 
    } 
    
    return false; 
  } 

  // Get performance statistics 
  getStats(): { cacheHits: number; cacheMisses: number; cellCount: number; hitRate: number } { 
    const total = this.cacheHits + this.cacheMisses; 
    return { 
      cacheHits: this.cacheHits, 
      cacheMisses: this.cacheMisses, 
      cellCount: this.cells.size, 
      hitRate: total > 0 ? this.cacheHits / total : 0 
    }; 
  } 

  // Reset cache (call when cell size changes) 
  resetCache(): void { 
    this.cellKeyCache.clear(); 
    this.cacheHits = 0; 
    this.cacheMisses = 0; 
  }

  // Backward compatibility with old grid system
  static createDefaultGrid(): BucketGrid<any> {
    return new BucketGrid(400);
  }
}
