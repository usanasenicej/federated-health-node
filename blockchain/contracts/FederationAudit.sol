// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FederationAudit {
    address public owner;

    struct RoundData {
        uint256 roundId;
        string modelHash;
        uint256 numClients;
        string metadata; // could contain accuracy or other non-sensitive metrics
        uint256 timestamp;
    }

    struct PredictionLog {
        string predictionId;
        string modelHashUsed;
        uint256 timestamp;
    }

    mapping(uint256 => RoundData) public rounds;
    uint256 public currentRound;

    PredictionLog[] public predictionLogs;

    event RoundLogged(uint256 indexed roundId, string modelHash, uint256 numClients);
    event PredictionLogged(string predictionId, string modelHashUsed);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    function logTrainingRound(string memory _modelHash, uint256 _numClients, string memory _metadata) public onlyOwner {
        currentRound++;
        rounds[currentRound] = RoundData(currentRound, _modelHash, _numClients, _metadata, block.timestamp);
        emit RoundLogged(currentRound, _modelHash, _numClients);
    }

    function logPrediction(string memory _predictionId, string memory _modelHashUsed) public {
        predictionLogs.push(PredictionLog(_predictionId, _modelHashUsed, block.timestamp));
        emit PredictionLogged(_predictionId, _modelHashUsed);
    }

    function getPredictionLogsCount() public view returns (uint256) {
        return predictionLogs.length;
    }

    function getPredictionLog(uint256 index) public view returns (string memory, string memory, uint256) {
        PredictionLog memory log = predictionLogs[index];
        return (log.predictionId, log.modelHashUsed, log.timestamp);
    }
}
