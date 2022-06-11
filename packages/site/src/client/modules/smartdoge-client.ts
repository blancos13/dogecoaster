/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Web3Provider } from "@ethersproject/providers";
import { BehaviorSubject } from "rxjs";
import { Environment } from "./environments";
import { ReadonlySmartdogeClient } from "./readonly-smartdoge-client";

export class SmartdogeClient extends ReadonlySmartdogeClient<Web3Provider> {
    readonly onConnectedChanged = new BehaviorSubject<boolean>(window.ethereum.selectedAddress != undefined);

    constructor(environment: Environment) {
        super(environment, new Web3Provider(window.ethereum));
    }

    dispose() {
        super.dispose();
        this.onConnectedChanged.complete();
    }

    async ensureConnected() {
        if (this.onConnectedChanged.value) {
            return;
        }

        await this.provider.send("eth_requestAccounts", []);
        this.onConnectedChanged.next(true);
    }

    async getAddress() {
        await this.ensureConnected();
        return await this.provider.getSigner().getAddress();
    }
}
