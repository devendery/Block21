import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const B21_CONTRACT_ADDRESS = "0x9e885a4b54a04c8311e8c480f89c0e92cc0a1db2";
export const OWNER_WALLET_ADDRESS = "0x3e71f6AaDF8D6c79F7dac9F11AAB9Bfe4beA8233"; // User provided
export const CHAIN_ID = 137; // Polygon Mainnet
export const CHAIN_NAME = "Polygon Mainnet";
export const RPC_URL = "https://polygon-rpc.com";
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7NldvRZqhwIXsGEU86rDLjfKaZZGeptqFFGYceqbgcw47q7sTBG5M3OL9Q07gqS0jZw/exec";
