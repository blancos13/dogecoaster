import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React, { useCallback } from "react";
import { isDev } from "../modules/constants";
import { Network, networks } from "../modules/environments";

interface DevToolsProps {
    network: Network;
    onNetworkChange: (network: Network) => void;
}

export const DevTools = ({ network, onNetworkChange }: DevToolsProps) => {
    const handleNetworkChange = useCallback((x: Network) => void onNetworkChange(x), [onNetworkChange]);

    if (!isDev) {
        return <></>;
    }

    const networkRadios = Object.values(Network)
        .filter(x => typeof networks[x as Network] !== "undefined")
        .map(x => (
            <Radio key={x} value={x}>
                {x}
            </Radio>
        ));

    if (networkRadios.length === 1) {
        return <></>;
    }

    return (
        <div>
            <RadioGroup onChange={handleNetworkChange} value={network}>
                <Stack direction="row">{networkRadios}</Stack>
            </RadioGroup>
        </div>
    );
};
