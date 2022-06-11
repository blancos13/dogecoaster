import { Observable } from "rxjs";
import { blockIntervalMs, maxBlocksInMemory } from "./constants";
import { ReadonlySmartdogeClient } from "./readonly-smartdoge-client";

export interface CoasterBlock {
    number: number;
    hash: string;
    timestamp: number;
    appTimestamp: number;
}

export type Chain = Observable<CoasterBlock>;

const blockIntervalS = Math.round(blockIntervalMs / 1000);

const getPreLoadedCoasterBlocks = (
    first: number,
    last: number,
    followingBlockAppTimestamp: number,
    blockchain: ReadonlySmartdogeClient,
) => {
    return new Observable<CoasterBlock>(subscriber => {
        void (async () => {
            let i = first + 1;
            for (; i <= last; i += 2) {
                const block = await blockchain.getBlock(i);
                const previousTimestampS = block.timestamp - blockIntervalS;

                // Spoof the app timestamp.
                const appTimestamp = followingBlockAppTimestamp - (last - block.number + 1) * blockIntervalMs;

                // Infer the previous block's value to reduce network calls.
                subscriber.next({
                    appTimestamp: appTimestamp - blockIntervalMs,
                    hash: block.parentHash,
                    number: block.number - 1,
                    timestamp: previousTimestampS,
                });

                subscriber.next({
                    appTimestamp,
                    hash: block.hash,
                    number: block.number,
                    timestamp: block.timestamp,
                });
            }

            if (i < last) {
                const block = await blockchain.getBlock(last);
                subscriber.next({
                    appTimestamp: followingBlockAppTimestamp - blockIntervalMs,
                    hash: block.hash,
                    number: block.number,
                    timestamp: block.timestamp,
                });
            }

            subscriber.complete();
        })();
    });
};

export const createChain = (smartdoge: ReadonlySmartdogeClient) => {
    return new Observable<CoasterBlock>(subscriber => {
        let buffer: CoasterBlock[] | undefined = [];
        const subscription = smartdoge.onBlock.subscribe(chainBlock => {
            const coasterBlock: CoasterBlock = {
                appTimestamp: performance.now(),
                hash: chainBlock.hash,
                number: chainBlock.number,
                timestamp: chainBlock.timestamp,
            };

            if (buffer == undefined) {
                subscriber.next(coasterBlock);
            } else {
                buffer.push(coasterBlock);
                if (buffer.length === 1) {
                    const last = Math.max(1, chainBlock.number - 1);
                    const first = Math.max(1, last - maxBlocksInMemory + 1);
                    getPreLoadedCoasterBlocks(first, last, coasterBlock.appTimestamp, smartdoge).subscribe({
                        next: x => subscriber.next(x),
                        complete: () => {
                            for (const block of buffer!) {
                                subscriber.next(block);
                            }

                            buffer = undefined;
                        },
                    });
                }
            }
        });

        return () => void subscription.unsubscribe();
    });
};
