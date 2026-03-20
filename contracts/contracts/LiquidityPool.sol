// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAdvancedMintableToken is IERC20 {
    function mint(address to, uint256 amount) external;
}

contract LiquidityPool is Ownable {
    IAdvancedMintableToken public immutable token;
    uint256 public rewardRateBps;
    uint256 public totalStaked;

    mapping(address => uint256) public stakeOf;

    event Deposited(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    event RewardRateUpdated(uint256 newRateBps, uint256 timestamp);

    constructor(address tokenAddress, address poolOwner, uint256 initialRewardRateBps) Ownable(poolOwner) {
        require(tokenAddress != address(0), "token=0");
        require(initialRewardRateBps <= 10_000, "invalid rate");

        token = IAdvancedMintableToken(tokenAddress);
        rewardRateBps = initialRewardRateBps;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "amount=0");

        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "transferFrom failed");

        stakeOf[msg.sender] += amount;
        totalStaked += amount;

        emit Deposited(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "amount=0");
        require(stakeOf[msg.sender] >= amount, "insufficient stake");

        stakeOf[msg.sender] -= amount;
        totalStaked -= amount;

        uint256 reward = (amount * rewardRateBps) / 10_000;
        if (reward > 0) {
            token.mint(msg.sender, reward);
        }

        bool success = token.transfer(msg.sender, amount);
        require(success, "transfer failed");

        emit Withdrawn(msg.sender, amount, reward, block.timestamp);
    }

    function setRewardRateBps(uint256 newRateBps) external onlyOwner {
        require(newRateBps <= 10_000, "invalid rate");
        rewardRateBps = newRateBps;
        emit RewardRateUpdated(newRateBps, block.timestamp);
    }
}
