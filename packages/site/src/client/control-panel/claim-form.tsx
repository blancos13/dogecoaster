import { Button } from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import React, { useCallback, useState } from "react";
import { useContext } from "../modules/context";

interface ClaimFormProps {
    amount: BigNumber;
}

export const ClaimForm = ({ amount }: ClaimFormProps) => {
    const dogecoaster = useContext()?.dogecoaster;
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClick = useCallback(() => {
        void (async () => {
            if (dogecoaster == undefined) {
                return;
            }

            setIsClaiming(true);
            await dogecoaster.claim();
        })();
    }, [dogecoaster]);

    return (
        <div>
            <div>You won {formatEther(amount)} WEEE!</div>
            <Button onClick={handleClick} isLoading={isClaiming}>
                Claim your prize
            </Button>
        </div>
    );
};
