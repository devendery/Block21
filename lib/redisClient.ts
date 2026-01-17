import { createClient, RedisClientType } from "redis";

let client: RedisClientType | null = null;
let connecting: Promise<any> | null = null;

export async function getRedis() {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (client && client.isOpen) {
    return client;
  }

  if (!client) {
    client = createClient({ url });
    client.on("error", (err: unknown) => {
      console.error("Redis client error", err);
    });
  }

  if (!client.isOpen) {
    if (!connecting) {
      connecting = client
        .connect()
        .catch((err: unknown) => {
          console.error("Redis connect failed", err);
          client = null;
        })
        .finally(() => {
          connecting = null;
        });
    }
    await connecting;
  }

  return client && client.isOpen ? client : null;
}
