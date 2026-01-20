const http = require("node:http");
const express = require("express");
const cors = require("cors");
const { Server } = require("@colyseus/core");
const { WebSocketTransport } = require("@colyseus/ws-transport");
const { SnakeRoom } = require("./snake/SnakeRoom");
const { SnakeArenaRoom } = require("./snake/SnakeArenaRoom");
const { SnakePracticeRoom } = require("./snake/SnakePracticeRoom");

const port = process.env.PHASE1_SERVER_PORT ? Number(process.env.PHASE1_SERVER_PORT) : 2567;
const host = process.env.PHASE1_SERVER_HOST || "0.0.0.0";
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
server.on("error", (err) => {
  process.stderr.write(`Phase-1 server error: ${err && err.message ? err.message : String(err)}\n`);
});

process.on("unhandledRejection", (err) => {
  process.stderr.write(`Phase-1 unhandledRejection: ${err && err.message ? err.message : String(err)}\n`);
});

process.on("uncaughtException", (err) => {
  process.stderr.write(`Phase-1 uncaughtException: ${err && err.message ? err.message : String(err)}\n`);
});

const gameServer = new Server({
  transport: new WebSocketTransport({ server }),
});

gameServer.define("snake", SnakeRoom);
gameServer.define("snake_arena", SnakeArenaRoom);
gameServer.define("snake_practice", SnakePracticeRoom);

server.listen(port, host, () => {
  const webUrl = process.env.WEB_URL ? "set" : "unset";
  const secret = process.env.PHASE1_SERVER_SECRET ? "set" : "unset";
  process.stdout.write(`Phase-1 Colyseus server listening on ${host}:${port}\n`);
  process.stdout.write(`Phase-1 result reporting: WEB_URL=${webUrl} PHASE1_SERVER_SECRET=${secret}\n`);
});
