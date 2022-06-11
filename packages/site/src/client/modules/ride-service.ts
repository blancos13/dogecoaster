import { Block } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { concatMap, from, merge, shareReplay } from "rxjs";
import { DogecoasterClient } from "./dogecoaster-client";
import { applyPayoutCalculation, hasRideFinished, isCashOutExpired, isRideUndefined } from "./dogecoaster-logic";
import { Claim, Ride } from "./readonly-dogecoaster-client";
import { filterUndefined } from "./rx-helpers";
import { SmartdogeClient } from "./smartdoge-client";

export interface ReadyRideState {
    readonly state: "ready";
}

export interface RidingRideState {
    readonly state: "riding";
    readonly ride: Ride;
    readonly blockValues: readonly BigNumber[];
}

export interface CashableRideState {
    readonly state: "cashable";
    readonly ride: Ride;
    readonly blockValues: readonly BigNumber[];
    readonly finalValue: BigNumber;
}

export type RideState = ReadyRideState | RidingRideState | CashableRideState;

const calculateBlockValue = (ride: Ride, block: Block, blockValues: readonly BigNumber[]) => {
    const previous = block.number === ride.startBlock ? ride.value : blockValues[block.number - ride.startBlock - 1];
    if (previous == undefined) {
        throw new Error("Cannot calculate intermediate value for ride. Previous intermediate value missing.");
    }

    return applyPayoutCalculation(previous, block.hash);
};

const isBlock = (value: Ride | Block | Claim): value is Block => {
    return typeof (value as Block).hash === "string";
};

const isRide = (value: Ride | Block | Claim): value is Ride => {
    return typeof (value as Ride).claimed === "boolean";
};

export const readyState: RideState = { state: "ready" };

export class RideService {
    readonly onRideStateUpdate = this.createOnRideStateUpdate();

    constructor(private readonly dogecoaster: DogecoasterClient, private readonly smartdoge: SmartdogeClient) { }

    private async updateBlockValues(ride: Ride, block: Block, blockValues: BigNumber[]) {
        const limit = Math.min(ride.blockCount, block.number - ride.startBlock + 1);
        for (let i = blockValues.length; i < limit; i++) {
            const blockNumber = ride.startBlock + i;
            const current = blockNumber === block.number ? block : await this.smartdoge.getBlock(blockNumber);
            blockValues[i] = calculateBlockValue(ride, current, blockValues);
        }
    }

    private createOnRideStateUpdate() {
        let block: Block | undefined;
        let ride: Ride | undefined;
        let state: RideState | undefined;

        const onRide = merge(this.dogecoaster.onNewRide, from(this.dogecoaster.getCurrentRide()));
        return merge(onRide, this.dogecoaster.onClaimed, this.smartdoge.onBlock).pipe(
            concatMap(async (value): Promise<RideState | undefined> => {
                const transitionToReadyState = () => {
                    ride = undefined;
                    return (state = readyState);
                };

                const transitionToRideState = async (ride: Ride, block: Block) => {
                    const blockValues: BigNumber[] = [];
                    await this.updateBlockValues(ride, block, blockValues);
                    return (state = {
                        state: "riding",
                        blockValues,
                        ride,
                    });
                };

                const transitionToCashableState = async (
                    ride: Ride,
                    block: Block,
                    blockValues: readonly BigNumber[],
                ) => {
                    if (blockValues.length < ride.blockCount) {
                        const copied = [...blockValues];
                        await this.updateBlockValues(ride, block, copied);
                        blockValues = copied;
                    }

                    return (state = {
                        state: "cashable",
                        blockValues,
                        finalValue: blockValues[blockValues.length - 1],
                        ride,
                    });
                };

                const calculateFreshState = async (ride: Ride, block: Block) => {
                    if (isRideUndefined(ride) || isCashOutExpired(ride, block.number)) {
                        return transitionToReadyState();
                    }

                    if (hasRideFinished(ride, block.number)) {
                        return await transitionToCashableState(ride, block, []);
                    }

                    return await transitionToRideState(ride, block);
                };

                if (isBlock(value)) {
                    block = value;
                    switch (state?.state) {
                        case "ready":
                            return undefined;
                        case "riding": {
                            ride = ride!; // Always defined if in the riding state.
                            if (hasRideFinished(ride, block.number)) {
                                return await transitionToCashableState(ride, block, state.blockValues);
                            }

                            const blockValues = [...state.blockValues];
                            await this.updateBlockValues(state.ride, value, blockValues);
                            return (state = {
                                ...state,
                                blockValues,
                            });
                        }
                        case "cashable":
                            return isCashOutExpired(state.ride, block.number) ? transitionToReadyState() : undefined;
                        default:
                            return ride == undefined
                                ? transitionToReadyState()
                                : await calculateFreshState(ride, block);
                    }
                } else if (isRide(value)) {
                    ride = value;
                    if (block == undefined) {
                        return undefined;
                    }

                    switch (state?.state) {
                        case "ready":
                            return await transitionToRideState(ride, block);
                        case "riding":
                            console.warn("Received new ride during riding state.");
                            return await transitionToRideState(ride, block);
                        case "cashable":
                            console.warn("Received new ride during cashable state.");
                            return await transitionToRideState(ride, block);
                        default:
                            return calculateFreshState(ride, block);
                    }
                } else {
                    switch (state?.state) {
                        case "ready":
                            console.warn("Received claim during ready state.");
                            break;
                        case "riding":
                            console.warn("Received claim during riding state.");
                            break;
                    }

                    // Can receive a claim in the cashable or indeterminate states.
                    return transitionToReadyState();
                }
            }),
            filterUndefined(),
            shareReplay(1),
        );
    }
}
