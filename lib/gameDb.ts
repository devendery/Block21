import fs from "node:fs";
import path from "node:path";
import { getRedis } from "./redisClient";

import { UserProfile } from "@/types/game";

export type Relationship = "none" | "pending" | "friends" | "blocked";

export type ChatMessage = {
  id: number;
  from: "you" | "friend";
  text: string;
  createdAt: string;
};

export type StoredChatState = {
  relationship: Relationship;
  messages: ChatMessage[];
  hasReported: boolean;
};

const DATA_FILE = path.join(process.cwd(), "game-chat.json");
const REDIS_KEY = "worms:chatState";

function readFromDisk(): StoredChatState | null {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredChatState;
    if (
      parsed &&
      typeof parsed.relationship === "string" &&
      Array.isArray(parsed.messages)
    ) {
      return parsed;
    }
  } catch {
  }
  return null;
}

function writeToDisk(state: StoredChatState) {
  const data = JSON.stringify(state);
  fs.writeFileSync(DATA_FILE, data, "utf8");
}

export async function loadChatState(): Promise<StoredChatState> {
  const redis = await getRedis();
  if (redis) {
    try {
      const raw = await redis.get(REDIS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredChatState;
        if (
          parsed &&
          typeof parsed.relationship === "string" &&
          Array.isArray(parsed.messages)
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Failed to load chat state from Redis", err);
    }
  }

  const stored = readFromDisk();
  if (stored) return stored;
  return {
    relationship: "none",
    messages: [],
    hasReported: false,
  };
}

export async function saveChatState(state: StoredChatState): Promise<void> {
  const redis = await getRedis();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, JSON.stringify(state));
      return;
    } catch (err) {
      console.error("Failed to save chat state to Redis", err);
    }
  }

  writeToDisk(state);
}

export type WalletRecord = {
  id: string;
  address?: string;
  balance: number;
  currency: string;
  metadata?: Record<string, unknown>;
  transactions?: {
    id: string;
    type: string;
    amount: number;
    currency: string;
    timestamp: string;
  }[];
  linkedAccounts?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type WalletRecordEnvelope = {
  key: string;
  ttl: number | null;
  raw: string | null;
  record: WalletRecord | null;
  error?: string;
};

type WalletAuditIssueLevel = "error" | "warning" | "info";

export type WalletAuditIssue = {
  key: string;
  level: WalletAuditIssueLevel;
  message: string;
  field?: string;
};

export type WalletAuditReport = {
  totalKeys: number;
  validRecords: number;
  invalidRecords: number;
  issues: WalletAuditIssue[];
  records: WalletRecordEnvelope[];
};

export type ExternalWalletValidator = (record: WalletRecord) => Promise<WalletAuditIssue[]>;

export async function loadWalletRecordsFromRedis(
  pattern = "wallet:*"
): Promise<WalletRecordEnvelope[]> {
  const redis = await getRedis();
  if (!redis) return [];

  const envelopes: WalletRecordEnvelope[] = [];
  let cursor = 0;

  do {
    const scanResult = await redis.scan(cursor, { MATCH: pattern, COUNT: 100 });
    cursor = scanResult.cursor;

    for (const key of scanResult.keys) {
      const [raw, ttlValue] = await Promise.all([redis.get(key), redis.ttl(key)]);
      const ttl = ttlValue === -1 ? null : ttlValue;

      if (raw == null) {
        envelopes.push({
          key,
          ttl,
          raw: null,
          record: null,
          error: "missing_value",
        });
        continue;
      }

      try {
        const parsed = JSON.parse(raw) as WalletRecord;
        envelopes.push({
          key,
          ttl,
          raw,
          record: parsed,
        });
      } catch {
        envelopes.push({
          key,
          ttl,
          raw,
          record: null,
          error: "invalid_json",
        });
      }
    }
  } while (cursor !== 0);

  return envelopes;
}

function validateWalletRecordStructure(envelope: WalletRecordEnvelope): WalletAuditIssue[] {
  const issues: WalletAuditIssue[] = [];
  const { key, record, raw, error, ttl } = envelope;

  if (raw === null) {
    issues.push({
      key,
      level: "error",
      message: "Key has no stored value",
    });
    return issues;
  }

  if (error === "invalid_json") {
    issues.push({
      key,
      level: "error",
      message: "Value is not valid JSON",
    });
    return issues;
  }

  if (!record) {
    issues.push({
      key,
      level: "error",
      message: "Record is missing after parsing",
    });
    return issues;
  }

  if (typeof record.id !== "string" || record.id.trim().length === 0) {
    issues.push({
      key,
      level: "error",
      field: "id",
      message: "Record id is missing or not a non-empty string",
    });
  }

  if (typeof record.balance !== "number" || !Number.isFinite(record.balance)) {
    issues.push({
      key,
      level: "error",
      field: "balance",
      message: "Balance must be a finite number",
    });
  }

  if (typeof record.currency !== "string" || record.currency.trim().length === 0) {
    issues.push({
      key,
      level: "error",
      field: "currency",
      message: "Currency must be a non-empty string",
    });
  }

  if (record.transactions) {
    for (const tx of record.transactions) {
      if (!tx.id || typeof tx.id !== "string") {
        issues.push({
          key,
          level: "error",
          field: "transactions.id",
          message: "Transaction id is missing or invalid",
        });
        break;
      }
      if (typeof tx.amount !== "number" || !Number.isFinite(tx.amount)) {
        issues.push({
          key,
          level: "error",
          field: "transactions.amount",
          message: "Transaction amount must be a finite number",
        });
        break;
      }
      if (!tx.currency || typeof tx.currency !== "string") {
        issues.push({
          key,
          level: "error",
          field: "transactions.currency",
          message: "Transaction currency must be a string",
        });
        break;
      }
      if (!tx.timestamp || typeof tx.timestamp !== "string") {
        issues.push({
          key,
          level: "warning",
          field: "transactions.timestamp",
          message: "Transaction timestamp is missing or invalid",
        });
        break;
      }
    }
  }

  if (ttl !== null && ttl <= 0) {
    issues.push({
      key,
      level: "warning",
      message: "Key has non-positive TTL value",
    });
  }

  const sensitiveFields = ["privateKey", "mnemonic", "seed", "password"];
  for (const field of sensitiveFields) {
    if (field in (record as Record<string, unknown>)) {
      issues.push({
        key,
        level: "error",
        field,
        message: "Sensitive data field is stored in wallet record",
      });
    }
  }

  if (!record.metadata || !(record.metadata as Record<string, unknown>).encrypted) {
    issues.push({
      key,
      level: "info",
      message: "Record does not declare encryption metadata",
    });
  }

  return issues;
}

export async function auditWalletRecords(
  pattern = "wallet:*",
  externalValidator?: ExternalWalletValidator
): Promise<WalletAuditReport> {
  const envelopes = await loadWalletRecordsFromRedis(pattern);
  const issues: WalletAuditIssue[] = [];
  let validRecords = 0;
  let invalidRecords = 0;

  for (const envelope of envelopes) {
    const structuralIssues = validateWalletRecordStructure(envelope);
    if (structuralIssues.some((i) => i.level === "error")) {
      invalidRecords += 1;
    } else {
      validRecords += 1;
    }
    issues.push(...structuralIssues);

    if (externalValidator && envelope.record) {
      const externalIssues = await externalValidator(envelope.record);
      issues.push(...externalIssues);
      if (externalIssues.some((i) => i.level === "error")) {
        invalidRecords += 1;
        validRecords = Math.max(0, validRecords - 1);
      }
    }
  }

  return {
    totalKeys: envelopes.length,
    validRecords,
    invalidRecords,
    issues,
    records: envelopes,
  };
}

const PROFILE_PREFIX = "user:profile:";
const PROFILE_FILE = path.join(process.cwd(), "game-profiles.json");
const SNAKE_COSMETIC_PREFIX = "user:snakeCosmetic:";
const SNAKE_COSMETIC_FILE = path.join(process.cwd(), "snake-cosmetics.json");

type SnakeCosmetic = {
  skin: string;
  eyes: string;
  mouth: string;
  customPalette?: { primary: number; secondary: number } | null;
  updatedAt: number;
};

async function readProfilesFromDisk(): Promise<Record<string, UserProfile> | null> {
  try {
    const raw = await fs.promises.readFile(PROFILE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, UserProfile>;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return null;
}

async function writeProfilesToDisk(profiles: Record<string, UserProfile>): Promise<boolean> {
  try {
    await fs.promises.writeFile(PROFILE_FILE, JSON.stringify(profiles), "utf8");
    return true;
  } catch {
    return false;
  }
}

async function readSnakeCosmeticsFromDisk(): Promise<Record<string, SnakeCosmetic> | null> {
  try {
    const raw = await fs.promises.readFile(SNAKE_COSMETIC_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, SnakeCosmetic>;
    if (parsed && typeof parsed === "object") return parsed;
  } catch {
  }
  return null;
}

async function writeSnakeCosmeticsToDisk(cosmetics: Record<string, SnakeCosmetic>): Promise<boolean> {
  try {
    await fs.promises.writeFile(SNAKE_COSMETIC_FILE, JSON.stringify(cosmetics), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile | null> {
  const redis = await getRedis();
  const addr = walletAddress.toLowerCase();
  if (!redis) {
    const profiles = await readProfilesFromDisk();
    const p = profiles?.[addr];
    return p && typeof p === "object" ? p : null;
  }
  
  try {
    const key = `${PROFILE_PREFIX}${addr}`;
    const raw = await redis.get(key);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch (err) {
    console.error("Failed to load user profile", err);
  }
  return null;
}

export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  const redis = await getRedis();
  if (!redis) {
    const addr = profile.walletAddress.toLowerCase();
    const profiles = (await readProfilesFromDisk()) || {};
    profile.walletAddress = addr;
    profile.updatedAt = Date.now();
    profiles[addr] = profile;
    return writeProfilesToDisk(profiles);
  }
  
  try {
    const key = `${PROFILE_PREFIX}${profile.walletAddress.toLowerCase()}`;
    profile.updatedAt = Date.now();
    await redis.set(key, JSON.stringify(profile));
    return true;
  } catch (err) {
    console.error("Failed to save user profile", err);
    return false;
  }
}

export async function createDefaultProfile(walletAddress: string): Promise<UserProfile> {
  const profile: UserProfile = {
    walletAddress: walletAddress.toLowerCase(),
    username: "Player",
    avatar: 'default',
    level: 1,
    xp: 0,
    highScore: 0,
    gamesPlayed: 0,
    totalB21Earned: 0,
    unlockedSkins: ['classic'],
    activeSkin: 'classic',
    settings: {
      audio: true,
      mouseRing: true,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await saveUserProfile(profile);
  return profile;
}

export async function getSnakeCosmetic(walletAddress: string): Promise<Omit<SnakeCosmetic, "updatedAt"> | null> {
  const redis = await getRedis();
  const addr = walletAddress.toLowerCase();
  if (!redis) {
    const cosmetics = await readSnakeCosmeticsFromDisk();
    const c = cosmetics?.[addr];
    if (!c || typeof c !== "object") return null;
    return { skin: c.skin, eyes: c.eyes, mouth: c.mouth, customPalette: c.customPalette ?? null };
  }

  try {
    const key = `${SNAKE_COSMETIC_PREFIX}${addr}`;
    const raw = await redis.get(key);
    if (!raw) return null;
    const c = JSON.parse(raw) as SnakeCosmetic;
    if (!c || typeof c !== "object") return null;
    return { skin: c.skin, eyes: c.eyes, mouth: c.mouth, customPalette: c.customPalette ?? null };
  } catch (err) {
    console.error("Failed to load snake cosmetic", err);
    return null;
  }
}

export async function saveSnakeCosmetic(walletAddress: string, cosmetic: Omit<SnakeCosmetic, "updatedAt">): Promise<boolean> {
  const redis = await getRedis();
  const addr = walletAddress.toLowerCase();
  const payload: SnakeCosmetic = { ...cosmetic, updatedAt: Date.now() };

  if (!redis) {
    const cosmetics = (await readSnakeCosmeticsFromDisk()) || {};
    cosmetics[addr] = payload;
    return writeSnakeCosmeticsToDisk(cosmetics);
  }

  try {
    const key = `${SNAKE_COSMETIC_PREFIX}${addr}`;
    await redis.set(key, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.error("Failed to save snake cosmetic", err);
    return false;
  }
}

export async function deleteUserProfile(walletAddress: string): Promise<boolean> {
  const redis = await getRedis();
  const addr = walletAddress.toLowerCase();
  if (!redis) {
    const profiles = (await readProfilesFromDisk()) || {};
    if (!profiles[addr]) return true;
    delete profiles[addr];
    return writeProfilesToDisk(profiles);
  }

  try {
    const key = `${PROFILE_PREFIX}${addr}`;
    await redis.del(key);
    return true;
  } catch (err) {
    console.error("Failed to delete user profile", err);
    return false;
  }
}

export async function deleteSnakeCosmetic(walletAddress: string): Promise<boolean> {
  const redis = await getRedis();
  const addr = walletAddress.toLowerCase();
  if (!redis) {
    const cosmetics = (await readSnakeCosmeticsFromDisk()) || {};
    if (!cosmetics[addr]) return true;
    delete cosmetics[addr];
    return writeSnakeCosmeticsToDisk(cosmetics);
  }

  try {
    const key = `${SNAKE_COSMETIC_PREFIX}${addr}`;
    await redis.del(key);
    return true;
  } catch (err) {
    console.error("Failed to delete snake cosmetic", err);
    return false;
  }
}
