🐍 B21 / WORMS SNAKE ARENA V2 
 COMPLETE TECH, STRUCTURE & PHASE EXECUTION PLAN 
 Document Role:  Engineering Canon 
 Audience:  You, Trae, future devs 
 Rule:  Follow top → bottom. Never skip phases. 
 1️⃣ CORE PRODUCT DEFINITION (NON-NEGOTIABLE) 
 Game Type 
 Real-time multiplayer Snake / Worms-style arena 
 Head-fixed camera 
 Endless + match-based modes 
 Server authoritative 
 Modes (ONLY THESE 3) 
 Arena (Endless) 
 Friends (Private Rooms) 
 Tournament (Server-run) 
 Absolute Invariants 
 One canvas per session 
 Head always centered 
 Same snake design for player + bots 
 Bots always present 
 2️⃣ TECHNOLOGY STACK (LOCK THIS) 
 Frontend (Client) 
 Next.js 
 UI, routing, overlays 
 Phaser 
 Game rendering 
 Input handling 
 Camera math (head-fixed) 
 WebSocket 
 Real-time updates from server 
 Backend (Game Server) 
 Node.js 
 Colyseus 
 Room lifecycle 
 State sync 
 Multiplayer authority 
 Single physics loop 
 Shared by all modes 
 Optional / Later 
 Redis (room discovery / tournaments) 
 PostgreSQL / Mongo (stats, leaderboards) 
 CDN (assets, skins) 
 3️⃣ HIGH-LEVEL ARCHITECTURE 
 [ Client (Next + Phaser) ] 
         | 
         |  input only (angle, boost) 
         v 
 [ Game Server (Colyseus) ] 
         | 
         |  world snapshots 
         v 
 [ Client Renderer ] 
 
 Authority Boundary 
 Server = Truth 
 Client = Presentation 
 If logic affects outcome → server 
 If logic affects feel → client 
 4️⃣ PROJECT STRUCTURE (RECOMMENDED) 
 Client 
 /client 
  ├─ /ui 
  │   ├─ overlays 
  │   ├─ menus 
  │   └─ hud 
  ├─ /game 
  │   ├─ canvas-manager 
  │   ├─ snake-renderer 
  │   ├─ camera 
  │   ├─ interpolation 
  │   └─ effects 
  └─ /network 
      └─ socket-client 
 
 Server 
 /server 
  ├─ /rooms 
  │   ├─ ArenaRoom 
  │   ├─ FriendsRoom 
  │   └─ TournamentRoom 
  ├─ /world 
  │   ├─ physics 
  │   ├─ collisions 
  │   ├─ food 
  │   └─ growth 
  ├─ /entities 
  │   ├─ Snake 
  │   ├─ Bot 
  │   └─ Food 
  └─ /bots 
      ├─ vision 
      ├─ decision 
      └─ personality 
 
 5️⃣ WORLD & CAMERA MODEL 
 World 
 Infinite continuous 2D plane 
 All entities exist in world coordinates 
 Server never knows screen size 
 Camera 
 Head-fixed (always center) 
 No follow 
 No lag 
 No smoothing 
 World scrolls underneath 
 Camera bugs = STOP EVERYTHING 
 6️⃣ SNAKE DESIGN & MOVEMENT MODEL 
 Visual Design (FINAL) 
 Circular segments 
 Slight overlap 
 Rounded head 
 Eyes + mouth 
 Skin = color only 
 Movement Rules 
 Constant forward speed 
 Turn via angle delta 
 Speed scales with length 
 Deterministic per server tick 
 Body Following 
 Historical head positions 
 Fixed segment spacing 
 No physics forces 
 No springs / verlet 
 7️⃣ COLLISION & GAME LAW 
 Collision Rules 
 Wall → death 
 Own body → death 
 Other body → death 
 Head vs head: 
 Bigger wins 
 Equal → both die 
 Death Result 
 Snake explodes into food 
 Food inherits world positions 
 No exceptions per mode. 
 8️⃣ FOOD & GROWTH SYSTEM 
 Food has fixed size & value 
 Growth stored in buffer 
 Segment added only after threshold 
 No instant jumps 
 This ensures smooth progression. 
 9️⃣ BOT SYSTEM (CORE FEATURE) 
 Bot Principles 
 Same rules as players 
 Limited vision radius 
 Imperfect decisions 
 No hidden info 
 Decision Layers (in order) 
 Survival 
 Obstacle avoidance 
 Food opportunity 
 Personality noise 
 Bots must: 
 Die sometimes 
 Make mistakes 
 Feel human 
 🔟 BOT POPULATION CONTROL 
 Rule 
 bots = target_population − human_players 
 
 Server enforces target 
 Bots spawn/despawn seamlessly 
 Client has zero control 
 This applies to all modes . 
 1️⃣1️⃣ ROOM & MODE BEHAVIOR 
 Arena 
 Endless 
 Join/leave anytime 
 No end state 
 Infinite world illusion 
 Friends 
 Manual room creation 
 Shareable room ID 
 Host controls settings 
 Ends when condition met 
 Tournament 
 Server-created rooms 
 Multiple rounds 
 Advancement logic 
 Ends with winner 
 1️⃣2️⃣ ROOM STATE MACHINE 
 Waiting → Running → Ended 
 
 Arena skips Ended 
 Friends & Tournament use all states 
 1️⃣3️⃣ NETWORK CONTRACT 
 Client → Server 
 Direction / angle 
 Boost intent 
 Server → Client 
 World snapshots 
 Player states 
 Mode metadata 
 No client authority. Ever. 
 1️⃣4️⃣ CANVAS & SESSION RULE 
 One canvas per game session 
 Canvas mounts once 
 Destroyed only on exit 
 UI transitions via overlays 
 Never remount mid-game. 
 1️⃣5️⃣ PHASED EXECUTION PLAN (LOCKED) 
 🔹 Phase 0 — Freeze & Reset 
 Phase-1 read-only 
 New namespace 
 Write invariants 
 🔹 Phase 1 — Foundation 
 Server tick loop 
 Deterministic movement 
 Camera & world scroll 
 🔹 Phase 2 — Snake Feel 
 Final visuals 
 Segment overlap tuning 
 Head polish 
 🔹 Phase 3 — Core Gameplay 
 Food spawning 
 Growth buffer 
 Death & explosion 
 🔹 Phase 4 — Bots 
 Population control 
 Vision & avoidance 
 Personality tuning 
 🔹 Phase 5 — Modes 
 Arena 
 Friends 
 Tournament 
 🔹 Phase 6 — Polish 
 UI/UX 
 Performance 
 Sound 
 FX 
 🚫 Never reorder phases. 
 1️⃣6️⃣ STOP RULES (ENFORCEMENT) 
 Immediately STOP if: 
 Camera breaks 
 Snake feel is wrong 
 Determinism breaks 
 Server/client authority mixes 
 Fix first. Continue later. 
