import { TypedEventFilter } from "@dogecoaster/contracts/typechain/common";

export interface ContractDefinition {
    filters: Record<string, (...args: any[]) => TypedEventFilter<unknown, unknown>>;
    functions: Record<string, (...args: any[]) => any>;
}