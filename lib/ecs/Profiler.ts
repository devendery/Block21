// lib/ecs/Profiler.ts - OPTIMIZED VERSION 
export class Profiler { 
   private frameStartTime: number = 0; 
   private systemTimes: Map<string, number> = new Map(); 
   private systemAccumulators: Map<string, number[]> = new Map(); 
   private frameCount: number = 0; 
   private lastLogTime: number = 0; 
   
   // ⚠️ OPTIMIZATION: Sampling for expensive operations 
   private readonly SAMPLE_RATE = 0.1; // Sample 10% of frames 
   private readonly MAX_SAMPLES = 100; 
   
   // Performance thresholds 
   private readonly WARNING_THRESHOLD_MS = 16; // ~60fps budget 
   private readonly CRITICAL_THRESHOLD_MS = 33; // ~30fps budget 
   
   // Alerts 
   private warnings: Map<string, number> = new Map(); 
   private lastAlertTime: number = 0; 
   private readonly ALERT_COOLDOWN_MS = 10000; 
 
   startFrame(): void { 
     this.frameStartTime = performance.now(); 
     this.systemTimes.clear(); 
   }

   getFrameStartTime(): number {
     return this.frameStartTime;
   } 
 
   start(systemName: string): void { 
     this.systemTimes.set(systemName, performance.now()); 
   } 
 
   end(systemName: string): void { 
     const startTime = this.systemTimes.get(systemName); 
     if (startTime) { 
       const duration = performance.now() - startTime; 
       
       // ⚠️ OPTIMIZATION: Only sample a subset of frames 
       if (Math.random() < this.SAMPLE_RATE) { 
         let samples = this.systemAccumulators.get(systemName); 
         if (!samples) { 
           samples = []; 
           this.systemAccumulators.set(systemName, samples); 
         } 
         
         samples.push(duration); 
         if (samples.length > this.MAX_SAMPLES) { 
           samples.shift(); 
         } 
       } 
       
       // Check for performance issues 
       this.checkPerformance(systemName, duration); 
     } 
   } 
 
   endFrame(): void { 
     this.frameCount++; 
     const frameTime = performance.now() - this.frameStartTime; 
     
     // Log performance every 5 seconds 
     const now = performance.now(); 
     if (now - this.lastLogTime > 5000) { 
       this.logPerformance(); 
       this.lastLogTime = now; 
     } 
     
     // Check overall frame time 
     if (frameTime > this.CRITICAL_THRESHOLD_MS) { 
       console.warn(`Critical frame time: ${frameTime.toFixed(2)}ms`); 
     } 
   } 
 
   private checkPerformance(systemName: string, duration: number): void { 
     const now = performance.now(); 
     
     if (duration > this.CRITICAL_THRESHOLD_MS) { 
       const lastAlert = this.warnings.get(systemName) || 0; 
       if (now - lastAlert > this.ALERT_COOLDOWN_MS) { 
         console.warn(`Critical system performance: ${systemName} took ${duration.toFixed(2)}ms`); 
         this.warnings.set(systemName, now); 
       } 
     } else if (duration > this.WARNING_THRESHOLD_MS) { 
       const lastAlert = this.warnings.get(systemName) || 0; 
       if (now - lastAlert > this.ALERT_COOLDOWN_MS * 2) { 
         console.warn(`Warning system performance: ${systemName} took ${duration.toFixed(2)}ms`); 
         this.warnings.set(systemName, now); 
       } 
     } 
   } 
 
   private logPerformance(): void { 
     if (this.systemAccumulators.size === 0) return; 
     
     console.group('ECS Performance Report'); 
     console.log("Frames processed: " + this.frameCount); 
     
     let totalAvg = 0; 
     let systemCount = 0; 
     
     // ES5 compatible Map iteration
     const systemNames = Array.from(this.systemAccumulators.keys());
     for (let i = 0; i < systemNames.length; i++) {
       const systemName = systemNames[i];
       const samples = this.systemAccumulators.get(systemName);
       if (!samples || samples.length === 0) continue; 
       
       const avg = samples.reduce(function(a, b) { return a + b; }, 0) / samples.length; 
       const max = Math.max.apply(Math, samples); 
       const min = Math.min.apply(Math, samples); 
       
       totalAvg += avg; 
       systemCount++; 
       
       // Color code based on performance 
       let color = '#00ff00'; // Good 
       if (avg > this.WARNING_THRESHOLD_MS) color = '#ffff00'; // Warning 
       if (avg > this.CRITICAL_THRESHOLD_MS) color = '#ff0000'; // Critical 
       
       console.log( 
         "%c" + systemName.padEnd(15) + ": " + avg.toFixed(2) + "ms (min: " + min.toFixed(2) + ", max: " + max.toFixed(2) + ")", 
         "color: " + color 
       ); 
     } 
     
     if (systemCount > 0) { 
       const overallAvg = totalAvg / systemCount; 
       console.log(`Overall average: ${overallAvg.toFixed(2)}ms per system`); 
     } 
     
     console.groupEnd(); 
   } 
 
   getSystemTimes(): Map<string, number[]> { 
     return new Map(this.systemAccumulators.entries()); 
   } 
 
   getSystemStats(systemName: string): { avg: number; min: number; max: number; samples: number } | null { 
     const samples = this.systemAccumulators.get(systemName); 
     if (!samples || samples.length === 0) return null; 
     
     const avg = samples.reduce((a, b) => a + b, 0) / samples.length; 
     const max = Math.max(...samples); 
     const min = Math.min(...samples); 
     
     return { avg, min, max, samples: samples.length }; 
   } 
 
   reset(): void { 
     this.systemAccumulators.clear(); 
     this.frameCount = 0; 
     this.warnings.clear(); 
     console.log('Profiler reset'); 
   } 
 
   // Export performance data for external monitoring 
   exportData(): any { 
     const data: any = { 
       frameCount: this.frameCount, 
       systems: {} 
     }; 
     
     // ES5 compatible Map iteration
     const systemNames = Array.from(this.systemAccumulators.keys());
     for (let i = 0; i < systemNames.length; i++) {
       const systemName = systemNames[i];
       const samples = this.systemAccumulators.get(systemName);
       if (!samples || samples.length === 0) continue; 
       
       const avg = samples.reduce(function(a, b) { return a + b; }, 0) / samples.length; 
       const max = Math.max.apply(Math, samples); 
       const min = Math.min.apply(Math, samples); 
       
       data.systems[systemName] = { 
         averageMs: avg, 
         maxMs: max, 
         minMs: min, 
         sampleCount: samples.length 
       }; 
     } 
     
     return data; 
   } 
 } 
 
// Global profiler instance for backward compatibility
export const globalProfiler = new Profiler();