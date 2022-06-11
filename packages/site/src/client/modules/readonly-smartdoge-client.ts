/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { JsonRpcProvider } from "@ethersproject/providers";
import { interval, mergeMap, shareReplay } from "rxjs";
import { Environment } from "./environments";
import { filterUndefined } from "./rx-helpers";

export class ReadonlySmartdogeClient<T extends JsonRpcProvider = JsonRpcProvider> {
    readonly onBlock = this.createOnBlock();

    constructor(protected readonly environment: Environment, protected readonly provider: T) { }

    dispose() {
        this.provider.removeAllListeners();
    }

    async getBlock(number: number) {
        return await this.provider.getBlock(number);
    }

    private createOnBlock() {
        // Listening to the provider "block" event isn't reliable from a timing perspective.
        let current: number | undefined;
        return interval(1000).pipe(
            mergeMap(async () => {
                const toGet = current ?? "latest";
                const block = await this.provider.getBlock(toGet);
                if (block != undefined) {
                    // Important to do it this way because just incrementing can cause unexpected behaviour when the coaster
                    // is a background tab. Requesting the next block can result in the previous being returned.
                    current = block.number + 1;
                }

                return block;
            }),
            filterUndefined(),
            shareReplay(1),
        );
    }
}
