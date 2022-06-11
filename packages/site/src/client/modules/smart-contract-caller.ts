import { Web3Provider } from "@ethersproject/providers";
import { Contract } from "ethers";
import { ContractDefinition } from "./smart-contract-types";
import { SmartdogeClient } from "./smartdoge-client";

type Unpack<T> = T extends Promise<infer U> ? (U extends [infer V] ? V : U) : never;

export class SmartContractCaller<TContract extends ContractDefinition> {
    private readonly contract: Contract;

    constructor(
        address: string,
        abi: string,
        protected readonly smartdogeClient: SmartdogeClient,
        protected readonly provider: Web3Provider,
    ) {
        this.contract = new Contract(address, abi, this.provider.getSigner());
    }

    async call<TFunc extends keyof TContract["functions"]>(
        func: TFunc,
        ...params: Parameters<TContract["functions"][TFunc]>
    ) {
        await this.smartdogeClient.ensureConnected();

        /* eslint-disable @typescript-eslint/no-unsafe-member-access */
        /* eslint-disable @typescript-eslint/no-unsafe-assignment */
        /* eslint-disable @typescript-eslint/no-unsafe-call */
        const result = await (this.contract as any)[func](...params);
        /* eslint-enable @typescript-eslint/no-unsafe-member-access */
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
        /* eslint-enable @typescript-eslint/no-unsafe-call */

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result as Unpack<ReturnType<TContract["functions"][TFunc]>>;
    }
}