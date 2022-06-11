import { TypedEventFilter } from "@dogecoaster/contracts/typechain/common";
import { JsonRpcProvider, Log } from "@ethersproject/providers";
import { BytesLike, Contract, utils } from "ethers";
import { hexZeroPad } from "ethers/lib/utils";
import { Observable } from "rxjs";
import { ContractDefinition } from "./smart-contract-types";

type EventKey<T extends ContractDefinition> = Exclude<keyof T["filters"], `${string})`> & string;
type FilterFunctionType<TContract extends ContractDefinition, TFilters extends EventKey<TContract>> = ReturnType<
    TContract["filters"][TFilters]
>;

type EventFilterParam<T> = T extends TypedEventFilter<unknown, infer TLog> ? TLog : never;
type EventLogType<TContract extends ContractDefinition, TFilters extends EventKey<TContract>> = EventFilterParam<
    FilterFunctionType<TContract, TFilters>
>;

type EventArgs<TContract extends ContractDefinition, TEvent extends EventKey<TContract>> = Parameters<
    TContract["filters"][TEvent]
>;

const dearrayify = <T>(value: T & unknown[]): T => {
    return Object.entries(value).reduce((o, [key, value]) => {
        if (isNaN(parseInt(key))) {
            o[key] = value;
        }

        return o;
    }, {} as Record<string, any>) as T;
};

export class SmartContractEventObservableFactory<TContract extends ContractDefinition> {
    private readonly contract: Contract;

    constructor(
        address: string,
        abi: string,
        protected readonly provider: JsonRpcProvider,
    ) {
        this.contract = new Contract(address, abi, this.provider.getSigner());
    }

    createEventObservable<TName extends EventKey<TContract>, TArgs extends EventArgs<TContract, TName>>(
        eventName: TName,
        ...filterArgs: TArgs
    ): Observable<EventLogType<TContract, typeof eventName>> {
        const events = this.contract.interface.events;
        const topic = Object.entries(events).find(([, { name }]) => name === eventName)?.[0];
        if (topic == undefined) {
            throw new Error(`Could not retrieve event topic ${eventName}`);
        }

        const paddedFilterArgs = filterArgs.map((x) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            typeof x === "string" || (Array.isArray(x) && x.length > 0 && typeof x[0] === "number")
                ? hexZeroPad(x as BytesLike, 32)
                : x,
        ) as TArgs;

        const filter = {
            address: this.contract.address,
            topics: [utils.id(topic), ...paddedFilterArgs],
        };

        return new Observable<EventLogType<TContract, typeof eventName>>((subscriber) => {
            const listener = (log: Log) => {
                const parsed = this.contract.interface.parseLog(log);
                const resultArray = parsed.args as EventLogType<TContract, typeof eventName> & unknown[];
                const result = dearrayify<EventLogType<TContract, typeof eventName>>(resultArray);
                void subscriber.next(result);
            };
            this.provider.on(filter, listener);
            return () => this.provider.off(filter, listener);
        });
    };
}