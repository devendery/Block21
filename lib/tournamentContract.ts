// Smart contract integration for tournaments
import { ethers } from 'ethers';

const TOURNAMENT_CONTRACT_ABI = [
  "function joinTournament(uint256 _tournamentId) external",
  "function finishTournament(uint256 _tournamentId, address _winner, address _secondPlace, address _thirdPlace) external",
  "function getTournamentInfo(uint256 _tournamentId) external view returns (uint256 entryFee, uint256 prizePool, uint256 maxPlayers, uint256 currentPlayers, bool isActive, bool isFinished, address[] memory players)",
  "function getPlayerScore(uint256 _tournamentId, address _player) external view returns (uint256)",
  "event TournamentCreated(uint256 indexed tournamentId, uint256 entryFee, uint256 maxPlayers)",
  "event PlayerJoined(uint256 indexed tournamentId, address indexed player)",
  "event TournamentFinished(uint256 indexed tournamentId, address winner, address second, address third)",
  "event PrizeDistributed(uint256 indexed tournamentId, address indexed recipient, uint256 amount)",
];

export async function joinTournament(
  tournamentId: number,
  entryFee: string,
  contractAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return { success: false, error: 'MetaMask not found' };
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, TOURNAMENT_CONTRACT_ABI, signer);

    // Approve token spending first
    const b21TokenAddress = process.env.NEXT_PUBLIC_B21_TOKEN_ADDRESS;
    if (!b21TokenAddress) {
      return { success: false, error: 'Token address not configured' };
    }

    const tokenAbi = [
      "function approve(address spender, uint256 amount) external returns (bool)",
    ];
    const tokenContract = new ethers.Contract(b21TokenAddress, tokenAbi, signer);
    const entryFeeWei = ethers.parseUnits(entryFee, 8); // B21 has 8 decimals

    const approveTx = await tokenContract.approve(contractAddress, entryFeeWei);
    await approveTx.wait();

    // Join tournament
    const tx = await contract.joinTournament(tournamentId);
    const receipt = await tx.wait();

    return { success: true, txHash: receipt.hash };
  } catch (error: any) {
    console.error('Join tournament error:', error);
    return { success: false, error: error.message || 'Transaction failed' };
  }
}

export async function getTournamentInfo(
  tournamentId: number,
  contractAddress: string
): Promise<any> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, TOURNAMENT_CONTRACT_ABI, provider);
    const info = await contract.getTournamentInfo(tournamentId);
    
    return {
      entryFee: info.entryFee.toString(),
      prizePool: info.prizePool.toString(),
      maxPlayers: info.maxPlayers.toString(),
      currentPlayers: info.currentPlayers.toString(),
      isActive: info.isActive,
      isFinished: info.isFinished,
      players: info.players,
    };
  } catch (error) {
    console.error('Get tournament info error:', error);
    return null;
  }
}
