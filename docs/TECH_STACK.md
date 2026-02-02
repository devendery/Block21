# Block21 Website — Tech Stack

This file summarizes the key technologies used in this repository and their **installed versions** (from `package-lock.json`), plus what each one is used for.

## Core Framework (Frontend)
- **Next.js** — 16.1.1  
  App Router UI + API routes under `app/**`.
- **React** — 19.2.3  
  UI framework.
- **React DOM** — 19.2.3  
  React renderer for the browser.
- **TypeScript** — 5.9.3  
  Static typing for the codebase.

## Styling / UI
- **Tailwind CSS** — 3.4.19  
  Utility-first styling across the UI.
- **PostCSS** — 8.5.6  
  CSS processing pipeline.
- **Autoprefixer** — 10.4.23  
  Vendor prefixing for CSS.
- **clsx** — 2.1.1  
  Conditional className composition.
- **tailwind-merge** — 2.6.0  
  Merges Tailwind class strings safely.
- **framer-motion** — 12.27.2  
  UI animations and transitions.
- **lucide-react** — 0.469.0  
  Icon library used in UI screens.
- **recharts** — 2.15.4  
  Charts for dashboards/stats.

## Web3 / Wallet / Chain
- **wagmi** — 2.19.5  
  React hooks for wallet connection and contract calls.
- **viem** — 2.44.4  
  EVM RPC + contract utilities (used by wagmi).
- **ethers** — 6.16.0  
  EVM library (used in some wallet flows).
- **@walletconnect/ethereum-provider** — 2.23.3  
  WalletConnect provider.

## Game Client + Multiplayer
- **Phaser** — 3.90.0  
  2D game engine used for the Snake client rendering.
- **Colyseus stack (multiplayer/state sync)**  
  - **colyseus** — 0.16.5 (server)  
  - **colyseus.js** — 0.16.22 (browser client)  
  - **@colyseus/core** — 0.16.24  
  - **@colyseus/ws-transport** — 0.16.5  
  - **@colyseus/schema** — 3.0.76  

## Backend / Servers
- **Node.js** — used (not pinned in this repo via `.nvmrc` or `package.json#engines`)  
  Runs Next.js, and custom servers under `server/**`.
- **Express** — 4.22.1  
  Used for custom server processes under `server/**`.
- **cors** — 2.8.5  
  CORS middleware for servers when needed.

## Database / Storage
- **Supabase JS client** — 2.90.1  
  Server routes use it to talk to Supabase Postgres.
- **redis** — 4.7.1  
  Server-side cache/storage (when Redis is configured).

## Auth / Security
- **jose** — 5.10.0  
  JWT signing and verification for cookie-based sessions.

## Networking / Realtime Utilities
- **axios** — 1.13.2  
  HTTP client.
- **socket.io-client** — 4.8.3  
  Socket.IO client (available for realtime features).
- **peerjs** — 1.5.5  
  WebRTC peer-to-peer helper (available in the repo).

## Scraping / SEO Helpers
- **cheerio** — 1.1.2  
  HTML parsing and scraping.
- **robots-parser** — 3.0.1  
  Parse/interpret `robots.txt`.

## Tooling
- **ESLint** — 9.39.2  
  Linting and code quality rules.
- **eslint-config-next** — 16.1.1  
  Next.js ESLint rules.
- **concurrently** — 9.1.2  
  Runs multiple commands together during development.

## Notes
- `package.json` often uses caret ranges (`^`). The versions above are the actual resolved versions currently installed/locked by `package-lock.json`.

