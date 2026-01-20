import { ethers } from "ethers";
import { signRewardPayload } from "@/lib/rewards/signer";

type SendRewardInput = {
  rewardId: string;
  recipient: string;
  amount: string;
  game: string;
};

type SendRewardResult = { txHash: string } | null;

const gameRewardAbi = [
  "function executeReward(address recipient,uint256 amount,uint64 expiresAt,bytes signature,string payload) external returns (bytes32)"
];

export async function maybeSendReward(input: SendRewardInput): Promise<SendRewardResult> {
  const contractAddress = process.env.GAME_REWARD_CONTRACT_ADDRESS;
  const rpcUrl = process.env.POLYGON_RPC_URL;
  const senderPk = process.env.REWARD_TX_PRIVATE_KEY;

  if (!contractAddress || !rpcUrl || !senderPk) {
    return null;
  }

  const issuedAt = Date.now();
  const expiresAt = issuedAt + 5 * 60 * 1000;
  const payload = {
    rewardId: input.rewardId,
    recipient: input.recipient,
    amount: input.amount,
    game: input.game,
    issuedAt,
    expiresAt,
  };

  const { message, signature } = await signRewardPayload(payload);

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(senderPk, provider);
  const contract = new ethers.Contract(contractAddress, gameRewardAbi, wallet);

  const tx = await contract.executeReward(
    input.recipient,
    ethers.parseUnits(input.amount, 18),
    Math.floor(expiresAt / 1000),
    signature,
    message
  );

  return { txHash: tx.hash as string };
}

