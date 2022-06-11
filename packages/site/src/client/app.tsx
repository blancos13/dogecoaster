import { Box, ChakraProvider, Flex } from "@chakra-ui/react";
import React, { useState } from "react";
import { Chat } from "./chat/chat";
import { Coaster } from "./coaster/coaster";
import { ControlPanel } from "./control-panel/control-panel";
import { isDev } from "./modules/constants";
import { DogecoasterContext } from "./modules/context";
import { Network, networks } from "./modules/environments";
import { globals } from "./modules/globals";
import { Stats } from "./stats/stats";

const getDefaultNetwork = () => {
    if (isDev) {
        const network = Object.entries(networks).find(([_, definition]) => typeof definition !== "undefined")?.[0] as
            | Network
            | undefined;
        if (network == undefined) {
            throw new Error("Could not select a network. No network definition could be found.");
        }

        return network;
    }

    if (globals.NETWORK == undefined) {
        throw new Error("Could not select a network. NETWORK value not set.");
    }

    if (networks[globals.NETWORK] == undefined) {
        throw new Error(
            `Could not select a network. NETWORK value "${globals.NETWORK}" does not correspond to a valid network definition.`,
        );
    }

    return globals.NETWORK;
};

const userId = crypto.randomUUID();

export const App = () => {
    const [network, setNetwork] = useState(() => getDefaultNetwork());
    const environment = networks[network]!;

    return (
        <ChakraProvider>
            <DogecoasterContext environment={environment}>
                <Flex height="100vh">
                    <Flex direction="column" flexBasis={0} flexGrow={1}>
                        <Box flexBasis={0} flexGrow={1}>
                            <Coaster environment={environment} />
                        </Box>
                        <Box flexBasis={0} flexGrow={0} minHeight={280}>
                            <ControlPanel environment={environment} onNetworkChange={setNetwork} />
                        </Box>
                    </Flex>
                    <Flex direction="column" flexBasis={0} flexGrow={1}>
                        <Box flexGrow={1}>
                            <Stats />
                        </Box>
                        <Box flexGrow={1}>
                            <Chat userId={userId} />
                        </Box>
                    </Flex>
                </Flex>
            </DogecoasterContext>
        </ChakraProvider>
    );
};
