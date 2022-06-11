import { Network } from "./environments";

declare const LOCALNET_NODES: string[] | undefined;
declare const LOCALNET_WEEE_ABI: string | undefined;
declare const LOCALNET_WEEE_ADDRESS: string | undefined;
declare const LOCALNET_DOGECOASTER_ABI: string | undefined;
declare const LOCALNET_DOGECOASTER_ADDRESS: string | undefined;

declare const TESTNET_NODES: string[] | undefined;
declare const TESTNET_WEEE_ABI: string | undefined;
declare const TESTNET_WEEE_ADDRESS: string | undefined;
declare const TESTNET_DOGECOASTER_ABI: string | undefined;
declare const TESTNET_DOGECOASTER_ADDRESS: string | undefined;

declare const MAINNET_NODES: string[] | undefined;
declare const MAINNET_WEEE_ABI: string | undefined;
declare const MAINNET_WEEE_ADDRESS: string | undefined;
declare const MAINNET_DOGECOASTER_ABI: string | undefined;
declare const MAINNET_DOGECOASTER_ADDRESS: string | undefined;

declare const NETWORK: Network | undefined;

export const globals = {
    NETWORK: typeof NETWORK !== "undefined" ? NETWORK : undefined,

    LOCALNET_NODES: typeof LOCALNET_NODES !== "undefined" ? LOCALNET_NODES : undefined,
    LOCALNET_WEEE_ABI: typeof LOCALNET_WEEE_ABI !== "undefined" ? LOCALNET_WEEE_ABI : undefined,
    LOCALNET_WEEE_ADDRESS: typeof LOCALNET_WEEE_ADDRESS !== "undefined" ? LOCALNET_WEEE_ADDRESS : undefined,
    LOCALNET_DOGECOASTER_ABI: typeof LOCALNET_DOGECOASTER_ABI !== "undefined" ? LOCALNET_DOGECOASTER_ABI : undefined,
    LOCALNET_DOGECOASTER_ADDRESS:
        typeof LOCALNET_DOGECOASTER_ADDRESS !== "undefined" ? LOCALNET_DOGECOASTER_ADDRESS : undefined,

    TESTNET_NODES: typeof TESTNET_NODES !== "undefined" ? TESTNET_NODES : undefined,
    TESTNET_WEEE_ABI: typeof TESTNET_WEEE_ABI !== "undefined" ? TESTNET_WEEE_ABI : undefined,
    TESTNET_WEEE_ADDRESS: typeof TESTNET_WEEE_ADDRESS !== "undefined" ? TESTNET_WEEE_ADDRESS : undefined,
    TESTNET_DOGECOASTER_ABI: typeof TESTNET_DOGECOASTER_ABI !== "undefined" ? TESTNET_DOGECOASTER_ABI : undefined,
    TESTNET_DOGECOASTER_ADDRESS:
        typeof TESTNET_DOGECOASTER_ADDRESS !== "undefined" ? TESTNET_DOGECOASTER_ADDRESS : undefined,

    MAINNET_NODES: typeof MAINNET_NODES !== "undefined" ? MAINNET_NODES : undefined,
    MAINNET_WEEE_ABI: typeof MAINNET_WEEE_ABI !== "undefined" ? MAINNET_WEEE_ABI : undefined,
    MAINNET_WEEE_ADDRESS: typeof MAINNET_WEEE_ADDRESS !== "undefined" ? MAINNET_WEEE_ADDRESS : undefined,
    MAINNET_DOGECOASTER_ABI: typeof MAINNET_DOGECOASTER_ABI !== "undefined" ? MAINNET_DOGECOASTER_ABI : undefined,
    MAINNET_DOGECOASTER_ADDRESS:
        typeof MAINNET_DOGECOASTER_ADDRESS !== "undefined" ? MAINNET_DOGECOASTER_ADDRESS : undefined,
};
