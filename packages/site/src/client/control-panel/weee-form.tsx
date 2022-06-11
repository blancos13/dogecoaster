import { Button, Stack } from "@chakra-ui/react";
import { formatEther } from "ethers/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useContext } from "../modules/context";

interface WeeeFormProps {}

const weeePurchaseTimeout = 30000;

export const WeeeForm = ({}: WeeeFormProps) => {
    const weee = useContext()?.weee;
    const [balance, setBalance] = useState("");
    const [isBuyingWeee, setIsBuyingWeee] = useState(false);
    const resetIsBuyingWeeeTimer = useRef<number>();

    useEffect(() => {
        const subscription = weee?.onBalance.subscribe(x => {
            clearTimeout(resetIsBuyingWeeeTimer.current);
            resetIsBuyingWeeeTimer.current = undefined;
            setIsBuyingWeee(false);
            setBalance(formatEther(x));
        });

        return () => subscription?.unsubscribe();
    }, [weee]);

    const handleClick = useCallback(() => {
        void (async () => {
            if (weee == undefined) {
                return;
            }

            let didCatch = false;
            setIsBuyingWeee(true);
            try {
                await weee.buy(1);
            } catch (e) {
                didCatch = true;
                setIsBuyingWeee(false);
            }

            if (!didCatch) {
                resetIsBuyingWeeeTimer.current = window.setTimeout(() => {
                    setIsBuyingWeee(false);
                    resetIsBuyingWeeeTimer.current = undefined;
                }, weeePurchaseTimeout);
            }
        })();
    }, [weee]);

    if (weee == undefined) {
        return <></>;
    }

    return (
        <Stack direction="row" alignItems="center">
            <div>You have {balance} WEEE</div>
            <Button onClick={handleClick} disabled={isBuyingWeee} isLoading={isBuyingWeee}>
                Buy 1 WEEE for 1 SDOGE
            </Button>
        </Stack>
    );
};
