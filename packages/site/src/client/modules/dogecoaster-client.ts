/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Dogecoaster } from "@dogecoaster/contracts";
import { Web3Provider } from "@ethersproject/providers";
import { parseEther } from "ethers/lib/utils";
import { Environment } from "./environments";
import { ReadonlyDogecoasterClient, Ride } from "./readonly-dogecoaster-client";
import { SmartContractCaller } from "./smart-contract-caller";
import { SmartdogeClient } from "./smartdoge-client";

export class DogecoasterClient extends ReadonlyDogecoasterClient {
    private readonly contractCaller: SmartContractCaller<Dogecoaster>;

    constructor(environment: Environment, smartdogeClient: SmartdogeClient, provider: Web3Provider) {
        super(environment, () => window.ethereum.selectedAddress, provider);
        this.contractCaller = new SmartContractCaller(
            environment.dogecoasterAddress,
            environment.dogecoasterAbi,
            smartdogeClient,
            provider,
        );
    }

    async board(amount: number, numBlocks: number) {
        if (window.ethereum.selectedAddress == undefined) {
            console.error("Cannot board Dogecoaster. ethereum.selectedAddress is undefined.");
            return;
        }

        const tx = await this.contractCaller.call("board", parseEther(amount.toString()), numBlocks, 0);
        await tx.wait();
    }

    async getCurrentRide(): Promise<Ride> {
        const ride = await this.contractCaller.call("getRide");
        return {
            blockCount: ride.blockCount,
            cashOutAt: ride.cashOutAt,
            startBlock: ride.startBlock.toNumber(),
            claimed: ride.claimed,
            value: ride.value,
        };
    }

    async claim() {
        const tx = await this.contractCaller.call("claim");
        await tx.wait();
    }
}
