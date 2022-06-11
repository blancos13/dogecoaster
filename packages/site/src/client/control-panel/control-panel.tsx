import { Heading, Stack, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useContext } from "../modules/context";
import { Environment, Network } from "../modules/environments";
import { readyState, RideState } from "../modules/ride-service";
import { BoardForm } from "./board-form";
import { ClaimForm } from "./claim-form";
import { DevTools } from "./dev-tools";
import { MetamaskConnect } from "./metamask-connect";
import { RidingForm } from "./riding-form";
import { WeeeForm } from "./weee-form";

interface ControlPanelProps {
    environment: Environment;
    onNetworkChange: (value: Network) => void;
}

export const ControlPanel = ({ environment, onNetworkChange }: ControlPanelProps) => {
    const ctx = useContext();
    const smartdoge = ctx?.smartdoge;
    const rideService = ctx?.rideService;

    const [isConnected, setIsConnected] = useState(false);
    const [rideState, setRideState] = useState<RideState>(readyState);

    useEffect(() => {
        const subscription = smartdoge?.onConnectedChanged.subscribe((x) => {
            setIsConnected(x);
        });
        return () => subscription?.unsubscribe();
    }, [smartdoge]);

    useEffect(() => {
        if (rideService == undefined) {
            return;
        }

        const subscription = rideService.onRideStateUpdate.subscribe((x) => {
            console.log(x);
            setRideState(x);
        });
        return () => subscription.unsubscribe();
    }, [rideService]);

    let forms: JSX.Element;

    if (!isConnected) {
        forms = <MetamaskConnect />;
    } else {
        let stateForm: JSX.Element;
        switch (rideState?.state) {
            case "ready":
                stateForm = <BoardForm />;
                break;
            case "riding":
                stateForm = <RidingForm />;
                break;
            case "cashable":
                stateForm = <ClaimForm amount={rideState.finalValue} />;
                break;
            default:
                stateForm = <></>;
        }

        forms = (
            <>
                <WeeeForm />
                {stateForm}
            </>
        );
    }

    return (
        <Stack margin={4} spacing={3}>
            <Heading size="lg">Board the Dogecoaster</Heading>
            <Text fontStyle="italic" fontSize="md">
                Please keep your paws inside the vehicle at all times.
            </Text>
            <DevTools network={environment.network} onNetworkChange={onNetworkChange} />
            {forms}
        </Stack>
    );
};
