# Block21 Snake Arena – Game Rules (Phase-2 Locked)

Purpose: Prevent devs from changing “feel” unintentionally.

This document defines the canonical gameplay rules. Any change requires explicit approval.
 
 --- 
 
 ## 1. Authority Model 
 - Server is authoritative. 
 - Client sends input only. 
 - Client never computes final position, collision, or death. 
 
 --- 
 
 ## 2. Movement 
 
 ### Tick 
 - Server tick rate: 20 ticks/sec 
 - Client render rate: 60 fps 
 
 ### Speed 
 - Base speed: 6.0 units/sec 
 - Max speed: 9.0 units/sec 
 - Acceleration: linear over 350ms 
 - Deceleration: linear over 200ms 
 
 ### Turning 
 - Max turn rate: 2.8 rad/sec 
 - Turning reduces effective speed by up to 18% 
 - No instant direction reversal 
 
 ### Boost (if enabled) 
 - Boost speed: +35% 
 - Boost drains mass at 1 unit/sec 
 - Boost disabled below minimum length 
 
 --- 
 
 ## 3. Growth 
 
 ### Food 
 - Common food: +1 mass 
 - Rare food: +3 mass 
 - Epic food: +7 mass 
 - Golden food: +15 mass 
 
 ### Length Formula 
 - Length = floor(mass * 0.85) 
 - Minimum length: 5 segments 
 
 --- 
 
 ## 4. Death Rules 
 
 ### Wall Collision 
 - Head touching wall = death 
 - Grace radius: 0.4 grid units 
 
 ### Snake Collision 
 - Head to any body = death 
 - Head-to-head: higher mass survives 
 - Equal mass: both die 
 
 ### Disconnect 
 - Disconnect = snake removed after 2 seconds 
 
 --- 
 
 ## 5. Camera Rules 
 
 - Zoom decreases as length increases 
 - Zoom range: 1.1 → 0.65 
 - Zoom smoothing: lerp 0.05/frame 
 - Camera follow smoothing: 0.08 
 
 --- 
 
 ## 6. Interpolation (Client Only) 
 
 - Position lerp factor: 0.18 
 - Angle rotation smoothing: 0.22 
 - History spacing: 5 frames 
 - Max render segments: 120 
 
 --- 
 
 ## 7. Rewards (Phase-2 Safe) 
 
 - Score = food collected + survival time 
 - Reward multiplier based on rank 
 - Rewards calculated server-side only 
 
 --- 
 
 ## 8. Forbidden Changes 
 
 - No client-side authority 
 - No React logic in GameRuntime 
 - No gameplay logic in UI layer 
 
 Violation = PR rejected.
