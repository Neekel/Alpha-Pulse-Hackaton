// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PredictionRegistry
 * @notice On-chain registry for verifiable AlphaPulse predictions
 * @dev Stores prediction hashes with timestamps for later verification
 */
contract PredictionRegistry is Ownable, ReentrancyGuard {
    
    // Prediction structure
    struct Prediction {
        bytes32 predictionHash;      // Hash of prediction details
        address predictor;           // Address that made prediction (bot wallet)
        uint256 timestamp;           // When prediction was made
        string anomalyType;          // WHALE_BUY, LIQUIDITY_EXIT, etc.
        string targetToken;          // Token symbol
        bool verified;               // Has been verified after 24h
        bool correct;                // Was prediction correct
        uint256 verifiedAt;          // When verification happened
        string metadata;             // JSON metadata
    }
    
    // Storage
    mapping(uint256 => Prediction) public predictions;
    uint256 public predictionCount;
    
    // Statistics
    uint256 public totalVerified;
    uint256 public totalCorrect;
    
    // Events
    event PredictionRegistered(
        uint256 indexed predictionId,
        bytes32 predictionHash,
        address indexed predictor,
        string anomalyType,
        string targetToken,
        uint256 timestamp
    );
    
    event PredictionVerified(
        uint256 indexed predictionId,
        bool correct,
        uint256 verifiedAt
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Register a new prediction on-chain
     * @param _predictionHash Hash of prediction details
     * @param _anomalyType Type of anomaly detected
     * @param _targetToken Token symbol
     * @param _metadata JSON metadata
     * @return predictionId The ID of registered prediction
     */
    function registerPrediction(
        bytes32 _predictionHash,
        string memory _anomalyType,
        string memory _targetToken,
        string memory _metadata
    ) external onlyOwner returns (uint256) {
        require(_predictionHash != bytes32(0), "Invalid hash");
        
        uint256 predictionId = predictionCount++;
        
        predictions[predictionId] = Prediction({
            predictionHash: _predictionHash,
            predictor: msg.sender,
            timestamp: block.timestamp,
            anomalyType: _anomalyType,
            targetToken: _targetToken,
            verified: false,
            correct: false,
            verifiedAt: 0,
            metadata: _metadata
        });
        
        emit PredictionRegistered(
            predictionId,
            _predictionHash,
            msg.sender,
            _anomalyType,
            _targetToken,
            block.timestamp
        );
        
        return predictionId;
    }
    
    /**
     * @notice Verify a prediction after 24 hours
     * @param _predictionId ID of prediction to verify
     * @param _correct Was the prediction correct
     */
    function verifyPrediction(
        uint256 _predictionId,
        bool _correct
    ) external onlyOwner {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        
        Prediction storage prediction = predictions[_predictionId];
        require(!prediction.verified, "Already verified");
        require(
            block.timestamp >= prediction.timestamp + 24 hours,
            "Must wait 24 hours"
        );
        
        prediction.verified = true;
        prediction.correct = _correct;
        prediction.verifiedAt = block.timestamp;
        
        totalVerified++;
        if (_correct) {
            totalCorrect++;
        }
        
        emit PredictionVerified(_predictionId, _correct, block.timestamp);
    }
    
    /**
     * @notice Get prediction details
     * @param _predictionId ID of prediction
     * @return Prediction struct
     */
    function getPrediction(uint256 _predictionId) 
        external 
        view 
        returns (Prediction memory) 
    {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        return predictions[_predictionId];
    }
    
    /**
     * @notice Get accuracy statistics
     * @return accuracy Percentage (0-10000 = 0-100.00%)
     * @return total Total verified predictions
     * @return correct Total correct predictions
     */
    function getAccuracy() 
        external 
        view 
        returns (uint256 accuracy, uint256 total, uint256 correct) 
    {
        total = totalVerified;
        correct = totalCorrect;
        
        if (total == 0) {
            accuracy = 0;
        } else {
            accuracy = (correct * 10000) / total;
        }
        
        return (accuracy, total, correct);
    }
    
    /**
     * @notice Get predictions by type
     * @param _anomalyType Type to filter by
     * @return predictionIds Array of prediction IDs
     */
    function getPredictionsByType(string memory _anomalyType) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory tempIds = new uint256[](predictionCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < predictionCount; i++) {
            if (
                keccak256(bytes(predictions[i].anomalyType)) == 
                keccak256(bytes(_anomalyType))
            ) {
                tempIds[count] = i;
                count++;
            }
        }
        
        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = tempIds[i];
        }
        
        return result;
    }
    
    /**
     * @notice Get recent predictions
     * @param _limit Maximum number to return
     * @return predictionIds Array of recent prediction IDs
     */
    function getRecentPredictions(uint256 _limit) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256 limit = _limit > predictionCount ? predictionCount : _limit;
        uint256[] memory result = new uint256[](limit);
        
        for (uint256 i = 0; i < limit; i++) {
            result[i] = predictionCount - 1 - i;
        }
        
        return result;
    }
    
    /**
     * @notice Check if prediction can be verified
     * @param _predictionId ID of prediction
     * @return canVerify True if 24h have passed
     */
    function canVerify(uint256 _predictionId) 
        external 
        view 
        returns (bool) 
    {
        require(_predictionId < predictionCount, "Invalid prediction ID");
        
        Prediction memory prediction = predictions[_predictionId];
        
        return !prediction.verified && 
               block.timestamp >= prediction.timestamp + 24 hours;
    }
}
