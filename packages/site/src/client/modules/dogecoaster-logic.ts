import { BigNumber } from "ethers";
import type { Ride } from "./readonly-dogecoaster-client";

// See getRandomNumber in the smart contract.
export const maxRideWindow = 255;

// See board blockCount require statement in the smart contract.
export const maxRideBlockCount = 100;

// TODO: This can be dynamically changed in the contract. Query this.
export const userEdge = 0;

const positivePayout = BigNumber.from(1200);
const negativePayout = BigNumber.from(800);
const payoutDivisor = BigNumber.from(1000);

export const isCashOutExpired = (ride: Ride, block: number) => {
    return block - ride.startBlock >= maxRideWindow;
};

// Note that hasRideFinished returns true when block is at earliest the last block in the ride, whereas in the smart contract
// we consider a ride complete if a block is at earliest the first block after the last block in the ride. This is because
// in the contract we can see a block that has not yet been mined, for which we cannot yet calculate a hash. In the client
// we only see a block after it has been mined, so upon seeing it we can claim the ride because the claim transaction will
// fall at earliest into the block after the end of the ride.

/** Returns true if the block is at earliest the last block in the ride */
export const hasRideFinished = (ride: Ride, block: number) => {
    return block >= ride.startBlock + ride.blockCount - 1;
};

export const isRideUndefined = (ride: Ride | undefined): ride is undefined => {
    return ride == undefined || ride.startBlock === 0;
};

export const isBlockPositivePayout = (hash: string) => {
    return BigInt(hash) % 2n === 1n;
};

export const applyPayoutCalculation = (previous: BigNumber, hash: string) => {
    const isPositive = isBlockPositivePayout(hash);
    const factor = isPositive ? positivePayout : negativePayout;
    return previous.mul(factor.add(userEdge)).div(payoutDivisor);
};
