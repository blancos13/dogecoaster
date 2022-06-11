// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IWeeeToken.sol";

contract Dogecoaster is Ownable {
    struct Ride {
        uint256 startBlock;
        uint8 blockCount;
        uint256 value;
        uint256 cashOutAt;
        bool claimed;
    }

    event NewRide(address indexed user, uint256 startBlock, uint8 blockCount, uint256 value, uint256 cashOutAt);
    event Claimed(address indexed user, uint256 payout);

    uint256 constant edgeDivisionFactor = 1000;
    uint256 constant winFactor = 1200;
    uint256 constant loseFactor = 800;
    uint256 constant edgeLimit = 1000; // 10%

    // Can only get the hash of "one of the 256 most recent blocks". Unclear if the current block is included in that
    // count so we use 255 for safety.
    uint256 constant maxRideWindow = 255;
    uint256 constant maxRideBlockCount = 100;

    // userEdge is the opposite of a house edge for casino.  Users are expected to win on average if this is positive.
    uint256 public userEdge = 0;

    IWeeeToken public WeeeToken;

    mapping(address => Ride) private _rides;

    constructor(address weeeAddress) {
        WeeeToken = IWeeeToken(weeeAddress);
    }

    function board(
        uint256 value,
        uint8 blockCount,
        uint256 cashOutAt
    ) public {
        require(blockCount >= 1, "Must board for at least one block");
        require(blockCount <= maxRideBlockCount, "Ride length exceeded maximum block count.");

        Ride storage ride = _rides[msg.sender];

        // require(
        //     ride.startBlock == 0 || ride.claimed || block.number - ride.startBlock >= (maxRideWindow + 1),
        //     "You must claim your previous ride WEEE first"
        // );

        WeeeToken.burnWeee(msg.sender, value);

        uint256 startBlock = block.number + 1;

        _rides[msg.sender] = Ride(startBlock, blockCount, value, cashOutAt, false);

        emit NewRide(msg.sender, startBlock, blockCount, value, cashOutAt);
    }

    function getRandomNumber(uint256 blockNum) private view returns (uint256) {
        bytes32 hashBytes = blockhash(blockNum);
        uint256 hash = uint256(hashBytes);

        // https://docs.soliditylang.org/en/v0.8.14/units-and-global-variables.html#block-and-transaction-properties
        require(hash != 0, "blockNum outside blockhash range.");

        return hash % 2; // returns either 1 or 0... also returns 0 if it's an invalid block (old or future)
    }

    function getRide() external view returns (Ride memory) {
        return _rides[msg.sender];
    }

    function claim() public {
        Ride storage ride = _rides[msg.sender];

        require(!ride.claimed, "You must ride the Dogecoaster before you can claim");

        // >= because if we start at 100 and go for 3 we can claim at 103 as blocks from 100-102 will have been minted.
        require(block.number >= ride.startBlock + ride.blockCount, "Not yet claimable");
        require(block.number - ride.startBlock < maxRideWindow, "Ride is too old to be claimed.");

        uint256 payout = ride.value;
        for (uint256 i = ride.startBlock; i < ride.startBlock + ride.blockCount; ) {
            uint256 randomNum = getRandomNumber(i);
            if (randomNum == 1) {
                payout = (payout * (winFactor + userEdge)) / edgeDivisionFactor;
            } else {
                payout = (payout * (loseFactor + userEdge)) / edgeDivisionFactor;
            }

            if (ride.cashOutAt != 0 && payout >= ride.cashOutAt) {
                break;
            }

            unchecked {
                i++;
            }
        }

        _rides[msg.sender].claimed = true;

        WeeeToken.claimWeee(msg.sender, payout);

        emit Claimed(msg.sender, payout);
    }

    function setUserEdge(uint256 edge) public onlyOwner {
        require(edge < edgeLimit, "User edge is beyond permitted limit");
        userEdge = edge;
    }
}
