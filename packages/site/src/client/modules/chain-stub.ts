import { concat, generate, interval, map } from "rxjs";
import { blockIntervalMs, maxBlocksInMemory } from "../modules/constants";
import type { Chain, CoasterBlock } from "./chain";

const createBlock = (number: number, timestamp: number, appTimestamp: number): CoasterBlock => {
    const hash = `0x${crypto.randomUUID().replaceAll("-", "")}`;
    return { number, hash, timestamp, appTimestamp };
};

export const createChainStub = (): Chain => {
    let number = 1;
    const now = new Date().valueOf();
    const appNow = performance.now();

    const initial = generate({
        initialState: 1,
        condition: i => i <= maxBlocksInMemory,
        iterate: i => i + 1,
        resultSelector: (i: number) => {
            const offset = (maxBlocksInMemory - i) * blockIntervalMs;
            const timestamp = Math.round((now - offset) / 1000);
            const appTimestamp = appNow - offset;
            return createBlock(number++, timestamp, appTimestamp);
        },
    });

    const periodic = interval(blockIntervalMs).pipe(
        map(x => createBlock(number + x, Math.round(new Date().valueOf() / 1000), performance.now())),
    );

    return concat(initial, periodic);
};
