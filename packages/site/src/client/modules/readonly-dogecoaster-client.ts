/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Dogecoaster } from "@dogecoaster/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import { filter, map, Observable, shareReplay } from "rxjs";
import { Environment } from "./environments";
import { SmartContractEventObservableFactory } from "./smart-contract-event-observable-factory";

export interface Ride {
    startBlock: number;
    blockCount: number;
    value: BigNumber;
    cashOutAt: BigNumber;
    claimed: boolean;
}

export interface Claim {
    user: string;
    payout: BigNumber;
}

export class ReadonlyDogecoasterClient {
    readonly onNewRide;
    readonly onClaimed;
    private readonly observableFactory;

    constructor(
        environment: Environment,
        private readonly getSelectedAddress: () => string | undefined | null,
        provider: JsonRpcProvider
    ) {
        this.observableFactory = new SmartContractEventObservableFactory<Dogecoaster>(
            environment.dogecoasterAddress,
            environment.dogecoasterAbi,
            provider,
        );

        this.onNewRide = this.createOnNewRide();
        this.onClaimed = this.createOnClaimed();
    }

    private createOnNewRide() {
        const onNewRide = this.observableFactory.createEventObservable("NewRide", this.getSelectedAddress()).pipe(
            map(
                (x): Ride => ({
                    blockCount: x.blockCount,
                    cashOutAt: x.cashOutAt,
                    startBlock: x.startBlock.toNumber(),
                    claimed: false,
                    value: x.value,
                }),
            ),
        );

        return onNewRide.pipe(
            filter((x) => !x.claimed && x.startBlock != 0),
            shareReplay(1),
        );
    }

    private createOnClaimed(): Observable<Claim> {
        return this.observableFactory.createEventObservable("Claimed", this.getSelectedAddress());
    }
}
