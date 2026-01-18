// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TournamentContract is Ownable, ReentrancyGuard {
    IERC20 public b21Token;
    
    struct Tournament {
        uint256 tournamentId;
        uint256 entryFee;
        uint256 prizePool;
        uint256 maxPlayers;
        uint256 currentPlayers;
        bool isActive;
        bool isFinished;
        address[] players;
        mapping(address => bool) hasJoined;
        mapping(address => uint256) scores;
        address winner;
        address secondPlace;
        address thirdPlace;
    }
    
    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCounter;
    
    // Prize distribution (in basis points: 10000 = 100%)
    uint256 public constant WINNER_SHARE = 5000; // 50%
    uint256 public constant SECOND_SHARE = 3000; // 30%
    uint256 public constant THIRD_SHARE = 2000; // 20%
    
    event TournamentCreated(uint256 indexed tournamentId, uint256 entryFee, uint256 maxPlayers);
    event PlayerJoined(uint256 indexed tournamentId, address indexed player);
    event TournamentStarted(uint256 indexed tournamentId);
    event TournamentFinished(uint256 indexed tournamentId, address winner, address second, address third);
    event PrizeDistributed(uint256 indexed tournamentId, address indexed recipient, uint256 amount);
    
    constructor(address _b21Token) Ownable(msg.sender) {
        b21Token = IERC20(_b21Token);
    }
    
    function createTournament(
        uint256 _entryFee,
        uint256 _maxPlayers
    ) external onlyOwner returns (uint256) {
        tournamentCounter++;
        uint256 tournamentId = tournamentCounter;
        
        Tournament storage tournament = tournaments[tournamentId];
        tournament.tournamentId = tournamentId;
        tournament.entryFee = _entryFee;
        tournament.maxPlayers = _maxPlayers;
        tournament.isActive = true;
        
        emit TournamentCreated(tournamentId, _entryFee, _maxPlayers);
        return tournamentId;
    }
    
    function joinTournament(uint256 _tournamentId) external nonReentrant {
        Tournament storage tournament = tournaments[_tournamentId];
        
        require(tournament.isActive, "Tournament not active");
        require(!tournament.isFinished, "Tournament finished");
        require(!tournament.hasJoined[msg.sender], "Already joined");
        require(tournament.currentPlayers < tournament.maxPlayers, "Tournament full");
        
        // Transfer entry fee
        require(
            b21Token.transferFrom(msg.sender, address(this), tournament.entryFee),
            "Transfer failed"
        );
        
        tournament.players.push(msg.sender);
        tournament.hasJoined[msg.sender] = true;
        tournament.currentPlayers++;
        tournament.prizePool += tournament.entryFee;
        
        emit PlayerJoined(_tournamentId, msg.sender);
    }
    
    function startTournament(uint256 _tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.isActive, "Tournament not active");
        require(!tournament.isFinished, "Tournament finished");
        require(tournament.currentPlayers >= 2, "Need at least 2 players");
        
        emit TournamentStarted(_tournamentId);
    }
    
    function finishTournament(
        uint256 _tournamentId,
        address _winner,
        address _secondPlace,
        address _thirdPlace
    ) external onlyOwner {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.isActive, "Tournament not active");
        require(!tournament.isFinished, "Tournament already finished");
        
        tournament.isFinished = true;
        tournament.winner = _winner;
        tournament.secondPlace = _secondPlace;
        tournament.thirdPlace = _thirdPlace;
        
        // Distribute prizes
        if (tournament.prizePool > 0) {
            uint256 winnerPrize = (tournament.prizePool * WINNER_SHARE) / 10000;
            uint256 secondPrize = (tournament.prizePool * SECOND_SHARE) / 10000;
            uint256 thirdPrize = (tournament.prizePool * THIRD_SHARE) / 10000;
            
            if (_winner != address(0) && winnerPrize > 0) {
                b21Token.transfer(_winner, winnerPrize);
                emit PrizeDistributed(_tournamentId, _winner, winnerPrize);
            }
            
            if (_secondPlace != address(0) && secondPrize > 0) {
                b21Token.transfer(_secondPlace, secondPrize);
                emit PrizeDistributed(_tournamentId, _secondPlace, secondPrize);
            }
            
            if (_thirdPlace != address(0) && thirdPrize > 0) {
                b21Token.transfer(_thirdPlace, thirdPrize);
                emit PrizeDistributed(_tournamentId, _thirdPlace, thirdPrize);
            }
        }
        
        emit TournamentFinished(_tournamentId, _winner, _secondPlace, _thirdPlace);
    }
    
    function updateScore(
        uint256 _tournamentId,
        address _player,
        uint256 _score
    ) external onlyOwner {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.hasJoined[_player], "Player not in tournament");
        tournament.scores[_player] = _score;
    }
    
    function getTournamentInfo(uint256 _tournamentId) external view returns (
        uint256 entryFee,
        uint256 prizePool,
        uint256 maxPlayers,
        uint256 currentPlayers,
        bool isActive,
        bool isFinished,
        address[] memory players
    ) {
        Tournament storage tournament = tournaments[_tournamentId];
        return (
            tournament.entryFee,
            tournament.prizePool,
            tournament.maxPlayers,
            tournament.currentPlayers,
            tournament.isActive,
            tournament.isFinished,
            tournament.players
        );
    }
    
    function getPlayerScore(uint256 _tournamentId, address _player) external view returns (uint256) {
        return tournaments[_tournamentId].scores[_player];
    }
}
