import { globals } from "./globals";
import { shuffleArrayInPlace } from "./helpers";

export enum Network {
    Localnet = "localnet",
    Testnet = "testnet",
    Mainnet = "mainnet",
}

export interface Environment {
    readonly network: Network;
    readonly nodes: readonly string[];
    readonly dogecoasterAbi: string;
    readonly dogecoasterAddress: string;
    readonly weeAbi: string;
    readonly weeAddress: string;
}

const shuffleNodes = (addresses: string[]): readonly string[] => shuffleArrayInPlace([...addresses]);

// The config script will only define the NODES variable if all other values are present.
const localnet: Environment | undefined =
    globals.LOCALNET_NODES != undefined
        ? {
              network: Network.Localnet,
              nodes: shuffleNodes(globals.LOCALNET_NODES),
              dogecoasterAbi: globals.LOCALNET_DOGECOASTER_ABI!,
              dogecoasterAddress: globals.LOCALNET_DOGECOASTER_ADDRESS!,
              weeAbi: globals.LOCALNET_WEEE_ABI!,
              weeAddress: globals.LOCALNET_WEEE_ADDRESS!,
          }
        : undefined;

const testnet: Environment | undefined =
    globals.TESTNET_NODES != undefined
        ? {
              network: Network.Testnet,
              nodes: shuffleNodes(globals.TESTNET_NODES),
              dogecoasterAbi: globals.TESTNET_DOGECOASTER_ABI!,
              dogecoasterAddress: globals.TESTNET_DOGECOASTER_ADDRESS!,
              weeAbi: globals.TESTNET_WEEE_ABI!,
              weeAddress: globals.TESTNET_WEEE_ADDRESS!,
          }
        : undefined;

const mainnet: Environment | undefined =
    globals.MAINNET_NODES != undefined
        ? {
              network: Network.Mainnet,
              nodes: shuffleNodes(globals.MAINNET_NODES),
              dogecoasterAbi: globals.MAINNET_DOGECOASTER_ABI!,
              dogecoasterAddress: globals.MAINNET_DOGECOASTER_ADDRESS!,
              weeAbi: globals.MAINNET_WEEE_ABI!,
              weeAddress: globals.MAINNET_WEEE_ADDRESS!,
          }
        : undefined;

export const networks = {
    [Network.Localnet]: localnet,
    [Network.Testnet]: testnet,
    [Network.Mainnet]: mainnet,
};
