import { ethers } from "ethers";

export type RewardPayload = {
  rewardId: string;
  recipient: string;
  amount: string;
  game: string;
  issuedAt: number;
  expiresAt: number;
};

export async function signRewardPayload(payload: RewardPayload) {
  const pk = process.env.REWARD_SIGNER_PRIVATE_KEY;
  if (!pk) {
    throw new Error("Missing REWARD_SIGNER_PRIVATE_KEY");
  }

  const wallet = new ethers.Wallet(pk);
  const message = JSON.stringify(payload);
  const signature = await wallet.signMessage(message);
  return { message, signature, signerAddress: await wallet.getAddress() };
}

