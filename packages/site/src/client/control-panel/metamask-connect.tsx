import { Box, Button } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { useContext } from "../modules/context";

export function MetamaskConnect() {
    const smartdoge = useContext()?.smartdoge;

    const handleClick = useCallback(() => {
        void smartdoge?.ensureConnected();
    }, [smartdoge]);

    return (
        <Box>
            <Button onClick={handleClick}>Connect to Metamask!</Button>
        </Box>
    );
}
