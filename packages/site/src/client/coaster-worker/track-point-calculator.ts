import { blockIntervalMs, blocksOnscreen, maxBlocksInMemory, offscreenRenderBlocksPerSide } from "../modules/constants";
import { Ride } from "../modules/readonly-dogecoaster-client";
import { calculateCurvePoints } from "./curve-plotter";
import { CoasterRenderData, ValuedCoasterBlock } from "./track-point-data-observable";

export interface TrackRenderParams {
    screenWidth: number;
    trackOffsetY: number;
    trackHeight: number;
    rescaleDuration: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface BlockPoint extends Point {
    readonly value: number;
    readonly isGreaterThanLast: boolean;
    readonly isInRide: boolean;
}

export interface RideSegment {
    x: number;
    isPositive: boolean;
}

export interface TrackPointData {
    blockPoints: BlockPoint[];
    curvePoints: Point[];
    rides: Ride[];
}

const calculateYRange = (
    blocks: ValuedCoasterBlock[],
    rescaleInStart: number,
    rescaleInEnd: number,
    rescaleOutStart: number,
    rescaleOutEnd: number,
) => {
    let scaledMin = Number.MAX_SAFE_INTEGER;
    let scaledMax = Number.MIN_SAFE_INTEGER;
    for (const block of blocks) {
        const { appTimestamp, value } = block;
        if (appTimestamp < rescaleInEnd && appTimestamp >= rescaleOutStart) {
            scaledMin = Math.min(value, scaledMin);
            scaledMax = Math.max(value, scaledMax);
        }
    }

    let rescalingMin = Number.MAX_SAFE_INTEGER;
    let rescalingMax = Number.MIN_SAFE_INTEGER;
    for (const block of blocks) {
        let scaleFactor: number;
        const { appTimestamp, value } = block;
        if (appTimestamp < rescaleInStart && appTimestamp >= rescaleInEnd) {
            scaleFactor = (rescaleInStart - appTimestamp) / (rescaleInStart - rescaleInEnd);
        } else if (appTimestamp < rescaleOutStart && appTimestamp >= rescaleOutEnd) {
            scaleFactor = (rescaleOutEnd - appTimestamp) / (rescaleInEnd - rescaleInStart);
        } else {
            continue;
        }

        const scaled = getScaledValue(value, scaledMin, scaledMax, scaleFactor);
        rescalingMin = Math.min(scaled, rescalingMin);
        rescalingMax = Math.max(scaled, rescalingMax);
    }

    const min = Math.min(scaledMin, rescalingMin);
    const max = Math.max(scaledMax, rescalingMax);
    return { min, max };
};

const offscreenDurationBefore = offscreenRenderBlocksPerSide * blockIntervalMs;
const screenDuration = blocksOnscreen * blockIntervalMs;
const totalBlockDuration = maxBlocksInMemory * blockIntervalMs;

/** Takes a set of timestamped blocks with arbitrary values and places them onto a logical coordinate system. */
const calculatePoints = (
    blocks: ValuedCoasterBlock[],
    rides: Ride[],
    { screenWidth, trackOffsetY, trackHeight, rescaleDuration }: TrackRenderParams,
): TrackPointData => {
    // Calculate times for each horizontal segment of the UI. We start with now being at the furthest right and subtract,
    // going back in time for older UI elements until we reach the earliest/leftmost point that we care about.

    // The beginning of a time range is always exclusive, and the end inclusive. This is because we want screenEnd to mark
    // the earliest point that can be rendered on the screen, which is at x = 0. We also want screenStart to mark the earliest
    // point that comes before the screen, as rendering at the screen's rightmost edge renders offscreen.

    // Recall that older elements have smaller time values, so e.g. the screen window is <= screenStart && > screenEnd.

    const now = performance.now();
    const rescaleInStart = now;
    const rescaleInEnd = rescaleInStart - rescaleDuration;
    const screenStart = now - offscreenDurationBefore;
    const screenEnd = screenStart - screenDuration;
    const rescaleOutStart = now - totalBlockDuration + rescaleDuration;
    const rescaleOutEnd = rescaleOutStart - rescaleDuration;

    const { min, max } = calculateYRange(blocks, rescaleInStart, rescaleInEnd, rescaleOutStart, rescaleOutEnd);
    const yRange = max - min;
    const timePixelRatio = screenWidth / screenDuration;

    const rideBlocks = new Set(rides.flatMap(x => {
        const steps = [];
        for (let i = 0; i < x.blockCount; i++) {
            steps.push(x.startBlock + i);
        }

        return steps;
    }));

    const blockPoints: BlockPoint[] = [];
    for (let i = 0; i < blocks.length; i++) {
        const { appTimestamp, value, number } = blocks[i];
        const x = (appTimestamp - screenEnd) * timePixelRatio;

        // We don't render all points, as some are left offscreen to dampen zoom changes in the track point calculator.
        if (
            blockPoints.length > offscreenRenderBlocksPerSide &&
            blockPoints[blockPoints.length - offscreenRenderBlocksPerSide].x < 0
        ) {
            break;
        }

        // This puts max values at the top of the screen (closer to zero).
        const y = ((max - value) / yRange) * trackHeight + trackOffsetY;

        // previous is + 1 because the array is in reverse-chronological order
        const previous = blocks[i + 1];
        let isGreaterThanLast = previous != undefined && previous.value < value; // Value doesn't matter if no previous
        let isInRide = rideBlocks.has(number);
        blockPoints.push({ x, y, value, isGreaterThanLast, isInRide });
    }

    const curvePoints = calculateCurvePoints(blockPoints, 0.8, 128);
    return { blockPoints, rides, curvePoints };
};

const getScaledValue = (value: number, screenMin: number, screenMax: number, scaleFactor: number) => {
    if (value > screenMax) {
        return screenMax + (value - screenMax) * scaleFactor;
    } else if (value < screenMin) {
        return screenMin + (value - screenMin) * scaleFactor;
    }

    return screenMax; // This can be any value between screenMin and screenMax inclusive. It has no impact on the scaling.
};

export const createTrackPointCalculator = (params: TrackRenderParams) => {
    return ({ blocks, rides }: CoasterRenderData) => calculatePoints(blocks, rides, params);
};
