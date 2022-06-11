// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWeeeToken.sol";

contract BustaDoge is Ownable {
    struct Ride {
        uint256 rideBlock;
        uint256 amount;
        uint256 multiplierNumerator;
        bool unclaimed;
    }

    mapping(address => Ride) private _rides;

    event NewRide(address _user, uint256 _rideBlock, uint256 _amount, uint256 multiplierNumerator);
    event Claimed(address _user, uint256 _rideMultiplierNumerator, uint256 _blockMultiplierNumerator, uint256 _payout);

    // userEdge is the opposite of a house edge for casino.  Users are expected to win on average if this is positive.
    uint256 public userEdge = 0;

    uint256 multiplierDenominator = 1e6;

    uint256 maxMultiplier = 100000000; // 100 million x
    uint256 maxMultiplierNumerator = maxMultiplier * multiplierDenominator;

    IWeeeToken public WeeeToken;

    constructor(address weeeAddress) {
        WeeeToken = IWeeeToken(weeeAddress);
    }

    function board(uint256 amount, uint256 multiplierNumerator) public {
        require(multiplierNumerator <= maxMultiplierNumerator, "100 million x is the max multiplier");

        Ride storage ride = _rides[msg.sender];

        require(ride.unclaimed != true, "You must claim your previous ride WEEE first");

        WeeeToken.burnWeee(msg.sender, amount);

        uint256 rideBlock = block.number + 2 + (block.number % 2); // allow a user to board every other block

        _rides[msg.sender] = Ride(rideBlock, amount, multiplierNumerator, true);

        emit NewRide(msg.sender, rideBlock, amount, multiplierNumerator);
    }

    function getRandomNumber(uint256 blockNum) public view returns (uint256) {
        return uint256(blockhash(blockNum)) % maxMultiplier; // returns 0 to maxMultiplier-1.  Can be forced 0 by the user by waiting for 256 blocks.
    }

    function claim() public {
        Ride storage ride = _rides[msg.sender];

        require(ride.unclaimed == true, "You must ride the Dogecoaster before you can claim");
        require(block.number > ride.rideBlock, "Not yet claimable");

        uint256 randomNum = getRandomNumber(ride.rideBlock);

        uint256 blockMultiplierNumerator = maxMultiplierNumerator / (maxMultiplier - randomNum);

        uint256 payout = 0;

        if (blockMultiplierNumerator >= ride.multiplierNumerator) {
            payout = (ride.amount * ride.multiplierNumerator) / multiplierDenominator;
            WeeeToken.claimWeee(msg.sender, payout);
        }

        _rides[msg.sender].unclaimed = false;

        emit Claimed(msg.sender, ride.multiplierNumerator, blockMultiplierNumerator, payout);
    }

    function setUserEdge(uint256 edge) public onlyOwner {
        require(edge < 1000, "User edge is beyond permitted limit"); // 1000 is 10% edge
        userEdge = edge;
    }
}
