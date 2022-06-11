import { fromEvent, map, Subscription } from "rxjs";
import { Environment } from "../modules/environments";
import type { Ride } from "../modules/readonly-dogecoaster-client";
import { createTrackPointData } from "./track-point-data-observable";

export interface ResetMessage {
    type: "reset";
    environment: Environment;
    stubChain?: boolean;
    height: number;
    width: number;
    currentRide: Ride | undefined;
    selectedAddress: string;
}

type CoasterWorkerMessage = ResetMessage

let subscription: Subscription | undefined;

fromEvent<MessageEvent>(self, "message").pipe(map(x => x.data as CoasterWorkerMessage)).subscribe(x => {
    switch (x.type) {
        case "reset":
            subscription?.unsubscribe();
            subscription = createTrackPointData(x.environment, x.selectedAddress, x.height, x.width, x.stubChain)
                .subscribe(x => {
                    postMessage(x);
                });
            break;
    }
});