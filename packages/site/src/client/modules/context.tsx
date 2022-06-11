import { Web3Provider } from "@ethersproject/providers";
import React, { PropsWithChildren, useContext as useReactContext, useEffect, useState } from "react";
import { DogecoasterClient } from "./dogecoaster-client";
import { Environment } from "./environments";
import { RideService } from "./ride-service";
import { SmartdogeClient } from "./smartdoge-client";
import { WeeeClient } from "./weee-client";

interface DogecoasterContext {
    readonly smartdoge: SmartdogeClient;
    readonly dogecoaster: DogecoasterClient;
    readonly weee: WeeeClient;
    readonly rideService: RideService;
}

interface DogecoasterContextProps {
    environment: Environment;
}

export const reactContext = React.createContext<DogecoasterContext | undefined>(undefined);

export const useContext = () => useReactContext(reactContext);

export const DogecoasterContext = ({ children, environment }: PropsWithChildren<DogecoasterContextProps>) => {
    const [contextValue, setContextValue] = useState<DogecoasterContext>();

    useEffect(() => {
        const provider = new Web3Provider(window.ethereum);
        const smartdoge = new SmartdogeClient(environment);
        const dogecoaster = new DogecoasterClient(environment, smartdoge, provider);
        const weee = new WeeeClient(environment, smartdoge, provider);
        const rideService = new RideService(dogecoaster, smartdoge);
        const contextValue = { dogecoaster, smartdoge, weee, rideService };
        setContextValue(contextValue);
        return () => {
            smartdoge.dispose();
        };
    }, [environment]);

    if (contextValue == undefined) {
        return <></>;
    }

    return <reactContext.Provider value={contextValue}>{children}</reactContext.Provider>;
};
