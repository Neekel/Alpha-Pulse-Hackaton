// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AnomalyRewards
 * @notice Reward users who follow correct AlphaPulse signals
 * @dev Users can stake on predictions and earn rewards if correct
 */
contract AnomalyRewards is Ownable, ReentrancyGuard {
    
    // Minimum stake amount
    uint256 public constant MIN_STAKE = 0.01 ether;
    
    // Prediction structure
    struct Signal {
        uint256 predictionId;        // Reference to PredictionRegistry
        string anomalyType;          // Type of anomaly
        string targetToken;          // Token symbol
        uint256 createdAt;           // When signal was created
        uint256 totalStaked;         // Total MNT staked
        uint256 stakerCount;         // Number of stakers
        bool resolved;               // Has been resolved
        bool correct;                // Was prediction correct
        uint256 resolvedAt;          // When resolved
    }
    
    // User stake on a signal
    struct Stake {
        uint256 amount;              // Amount staked
        bool claimed;                // Has claimed rewards
    }
    
    // Storage
    mapping(uint256 => Signal) public signals;
    mapping(uint256 => mapping(address => Stake)) public stakes;
    uint256 public signalCount;
    
    // Statistics
    uint256 public totalStaked;
    uint256 public totalRewardsPaid;
    
    // Events
    event SignalCreated(
        uint256 indexed signalId,
        uint256 indexed predictionId,
        string anomalyType,
        string targetToken,
        uint256 timestamp
    );
    
    event Staked(
        uint256 indexed signalId,
        address indexed user,
        uint256 amount,
        uint256 timestamp
    );
    
    event SignalResolved(
        uint256 indexed signalId,
        bool correct,
        uint256 totalStaked,
        uint256 timestamp
    );
    
    event RewardClaimed(
        uint256 indexed signalId,
        address indexed user,
        uint256 reward,
        uint256 timestamp
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Create a new signal for users to stake on
     * @param _predictionId Reference to PredictionRegistry
     * @param _anomalyType Type of anomaly
     * @param _targetToken Token symbol
     * @return signalId The ID of created signal
     */
    function createSignal(
        uint256 _predictionId,
        string memory _anomalyType,
        string memory _targetToken
    ) external onlyOwner returns (uint256) {
        uint256 signalId = signalCount++;
        
        signals[signalId] = Signal({
            predictionId: _predictionId,
            anomalyType: _anomalyType,
            targetToken: _targetToken,
            createdAt: block.timestamp,
            totalStaked: 0,
            stakerCount: 0,
            resolved: false,
            correct: false,
            resolvedAt: 0
        });
        
        emit SignalCreated(
            signalId,
            _predictionId,
            _anomalyType,
            _targetToken,
            block.timestamp
        );
        
        return signalId;
    }
    
    /**
     * @notice Stake MNT on a signal
     * @param _signalId ID of signal to stake on
     */
    function stake(uint256 _signalId) external payable nonReentrant {
        require(_signalId < signalCount, "Invalid signal ID");
        require(msg.value >= MIN_STAKE, "Stake too low");
        
        Signal storage signal = signals[_signalId];
        require(!signal.resolved, "Signal already resolved");
        require(
            block.timestamp < signal.createdAt + 24 hours,
            "Staking period ended"
        );
        
        Stake storage userStake = stakes[_signalId][msg.sender];
        
        if (userStake.amount == 0) {
            signal.stakerCount++;
        }
        
        userStake.amount += msg.value;
        signal.totalStaked += msg.value;
        totalStaked += msg.value;
        
        emit Staked(_signalId, msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Resolve a signal after verification
     * @param _signalId ID of signal to resolve
     * @param _correct Was the prediction correct
     */
    function resolveSignal(
        uint256 _signalId,
        bool _correct
    ) external onlyOwner {
        require(_signalId < signalCount, "Invalid signal ID");
        
        Signal storage signal = signals[_signalId];
        require(!signal.resolved, "Already resolved");
        require(
            block.timestamp >= signal.createdAt + 24 hours,
            "Must wait 24 hours"
        );
        
        signal.resolved = true;
        signal.correct = _correct;
        signal.resolvedAt = block.timestamp;
        
        emit SignalResolved(
            _signalId,
            _correct,
            signal.totalStaked,
            block.timestamp
        );
    }
    
    /**
     * @notice Claim rewards for a correct prediction
     * @param _signalId ID of signal to claim from
     */
    function claimReward(uint256 _signalId) external nonReentrant {
        require(_signalId < signalCount, "Invalid signal ID");
        
        Signal storage signal = signals[_signalId];
        require(signal.resolved, "Not resolved yet");
        
        Stake storage userStake = stakes[_signalId][msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(!userStake.claimed, "Already claimed");
        
        userStake.claimed = true;
        
        uint256 reward;
        
        if (signal.correct) {
            // Correct prediction: get stake back + 10% bonus
            reward = userStake.amount + (userStake.amount * 10) / 100;
        } else {
            // Incorrect prediction: lose stake
            reward = 0;
        }
        
        if (reward > 0) {
            totalRewardsPaid += reward;
            (bool success, ) = msg.sender.call{value: reward}("");
            require(success, "Transfer failed");
            
            emit RewardClaimed(_signalId, msg.sender, reward, block.timestamp);
        }
    }
    
    /**
     * @notice Get signal details
     * @param _signalId ID of signal
     * @return Signal struct
     */
    function getSignal(uint256 _signalId) 
        external 
        view 
        returns (Signal memory) 
    {
        require(_signalId < signalCount, "Invalid signal ID");
        return signals[_signalId];
    }
    
    /**
     * @notice Get user's stake on a signal
     * @param _signalId ID of signal
     * @param _user User address
     * @return Stake struct
     */
    function getUserStake(uint256 _signalId, address _user) 
        external 
        view 
        returns (Stake memory) 
    {
        return stakes[_signalId][_user];
    }
    
    /**
     * @notice Get claimable reward for user
     * @param _signalId ID of signal
     * @param _user User address
     * @return reward Amount claimable
     */
    function getClaimableReward(uint256 _signalId, address _user) 
        external 
        view 
        returns (uint256) 
    {
        require(_signalId < signalCount, "Invalid signal ID");
        
        Signal memory signal = signals[_signalId];
        Stake memory userStake = stakes[_signalId][_user];
        
        if (!signal.resolved || userStake.claimed || userStake.amount == 0) {
            return 0;
        }
        
        if (signal.correct) {
            return userStake.amount + (userStake.amount * 10) / 100;
        }
        
        return 0;
    }
    
    /**
     * @notice Owner can withdraw unclaimed funds after 30 days
     * @param _signalId ID of signal
     */
    function withdrawUnclaimed(uint256 _signalId) external onlyOwner {
        require(_signalId < signalCount, "Invalid signal ID");
        
        Signal memory signal = signals[_signalId];
        require(signal.resolved, "Not resolved");
        require(
            block.timestamp >= signal.resolvedAt + 30 days,
            "Must wait 30 days"
        );
        
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = owner().call{value: balance}("");
            require(success, "Transfer failed");
        }
    }
    
    /**
     * @notice Receive MNT
     */
    receive() external payable {}
}
