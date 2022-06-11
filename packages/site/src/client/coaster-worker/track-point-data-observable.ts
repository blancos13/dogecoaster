import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { combineLatest, finalize, interval, map, merge, of } from "rxjs";
import { CoasterBlock, createChain } from "../modules/chain";
import { createChainStub } from "../modules/chain-stub";
import { blockIntervalMs, maxBlocksInMemory } from "../modules/constants";
import { applyPayoutCalculation } from "../modules/dogecoaster-logic";
import type { Environment } from "../modules/environments";
import { ReadonlyDogecoasterClient, Ride } from "../modules/readonly-dogecoaster-client";
import { ReadonlySmartdogeClient } from "../modules/readonly-smartdoge-client";
import { createTrackPointCalculator, TrackRenderParams } from "./track-point-calculator";

export interface ValuedCoasterBlock extends CoasterBlock {
    value: number;
}

export interface CoasterRenderData {
    blocks: ValuedCoasterBlock[];
    rides: Ride[];
}

const targetFps = 60;
const inMemoryDurationMs = blockIntervalMs * maxBlocksInMemory;

const createBlockWindower = () => {
    const blocks: ValuedCoasterBlock[] = [];
    return (block: ValuedCoasterBlock | undefined) => {
        const now = performance.now();
        const oldestAllowableTimestamp = now - inMemoryDurationMs;
        while (blocks.length > 0) {
            const block = blocks[blocks.length - 1];
            if (block.appTimestamp < oldestAllowableTimestamp) {
                blocks.pop();
            } else {
                break;
            }
        }

        if (block != undefined) {
            blocks.unshift(block);
        }

        return blocks;
    };
};

const createValueAssigner = () => {
    let value = BigNumber.from(1_000_000_000_000);
    return (block: CoasterBlock | undefined): ValuedCoasterBlock | undefined => {
        if (block == undefined) {
            return undefined;
        }

        value = applyPayoutCalculation(value, block.hash);
        return { ...block, value: value.toNumber() };
    };
};

const createRenderDataMapper = () => {
    const rides: Ride[] = [];

    return ([blocks, ride]: [ValuedCoasterBlock[], Ride | undefined]) => {
        if (ride != undefined && rides[0] !== ride) {
            rides.push(ride);
        }

        while (true) {
            const oldestRide = rides[rides.length - 1];
            const oldestBlock = blocks[blocks.length - 1];
            if (oldestRide == undefined || oldestBlock == undefined) {
                break;
            }

            const oldestRideEndBlock = oldestRide.startBlock + oldestRide.blockCount - 1;
            if (oldestRideEndBlock >= oldestBlock.number) {
                break;
            }

            rides.pop();
        }

        return { blocks, rides };
    }
}

const createValueLineator = () => {
    let lastBlock: ValuedCoasterBlock | undefined;
    let lastLineatedValue = 1_000_000;

    return (block: ValuedCoasterBlock | undefined): ValuedCoasterBlock | undefined => {
        if (block == undefined) {
            return undefined;
        }

        if (lastBlock == undefined) {
            lastBlock = block;
            return { ...block, value: lastLineatedValue };
        }

        if (block.value < lastBlock.value) {
            lastBlock = block;
            return { ...block, value: --lastLineatedValue };
        }

        if (block.value > lastBlock.value) {
            lastBlock = block;
            return { ...block, value: ++lastLineatedValue };
        }

        return { ...block, value: lastLineatedValue };
    };
};

export const createTrackPointData = (
    environment: Environment,
    selectedAddress: string,
    height: number,
    width: number,
    stubChain = false
) => {
    const smartdoge = new ReadonlySmartdogeClient(environment, new JsonRpcProvider(environment.nodes[0]));
    const dogecoaster = new ReadonlyDogecoasterClient(environment, () => selectedAddress, new JsonRpcProvider(environment.nodes[0]));
    const chain = stubChain ? createChainStub() : createChain(smartdoge);
    const updateClock = interval(1000 / targetFps).pipe(map(() => undefined));

    const block = merge(chain, updateClock)
        .pipe(
            map(createValueAssigner()),
            map(createValueLineator()), // Comment this out to use true values instead of linear ones.
            map(createBlockWindower()),
        );

    const newRide = merge(of(undefined), dogecoaster.onNewRide);

    const trackParams: TrackRenderParams = {
        screenWidth: width,
        trackOffsetY: height * 0.4,
        trackHeight: height * 0.5,
        rescaleDuration: 1000,
    };

    return combineLatest([block, newRide]).pipe(
        finalize(() => {
            smartdoge.dispose();
        }),
        map(createRenderDataMapper()),
        map(createTrackPointCalculator(trackParams)),
    );
}