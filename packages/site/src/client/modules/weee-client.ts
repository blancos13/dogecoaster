/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Weee } from "@dogecoaster/contracts";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther } from "ethers/lib/utils";
import { concatMap, merge, shareReplay } from "rxjs";
import { Environment } from "./environments";
import { createKickstartedObservable } from "./rx-helpers";
import { SmartContractCaller } from "./smart-contract-caller";
import { SmartContractEventObservableFactory } from "./smart-contract-event-observable-factory";
import { SmartdogeClient } from "./smartdoge-client";

export class WeeeClient {
    readonly onBalance;
    private readonly observableFactory;
    private readonly contractCaller;

    constructor(environment: Environment, private readonly smartdogeClient: SmartdogeClient, provider: Web3Provider) {
        this.observableFactory = new SmartContractEventObservableFactory(
            environment.weeAddress,
            environment.weeAbi,
            provider,
        );

        this.contractCaller = new SmartContractCaller<Weee>(environment.weeAddress, environment.weeAbi, smartdogeClient, provider);
        this.onBalance = this.createOnBalance();
    }

    async buy(sdogeQty: number) {
        if (window.ethereum.selectedAddress == undefined) {
            console.error("Cannot buy WEEE. ethereum.selectedAddress is undefined.");
            return;
        }

        const tx = await this.contractCaller.call("buyWeee", {
            from: window.ethereum.selectedAddress,
            value: parseEther(sdogeQty.toString()),
        });

        await tx.wait();
    }

    private async getBalance() {
        const address = await this.smartdogeClient.getAddress();
        const result = await this.contractCaller.call("balanceOf", address);
        return result;
    }

    private createOnBalance() {
        const onBalance = merge(
            this.observableFactory.createEventObservable("Transfer"),
            this.smartdogeClient.onConnectedChanged
        ).pipe(
            concatMap(() => this.getBalance()),
            shareReplay(1),
        );
        return createKickstartedObservable(onBalance, () => this.getBalance());
    }
}
