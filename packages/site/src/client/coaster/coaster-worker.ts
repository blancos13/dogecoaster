import { fromEvent, map } from "rxjs";
import type { ResetMessage } from "../coaster-worker";
import { TrackPointData } from "../coaster-worker/track-point-calculator";
import { Environment } from "../modules/environments";
import { Ride } from "../modules/readonly-dogecoaster-client";

export class CoasterWorker extends Worker {
    readonly onMessage = fromEvent<MessageEvent>(this, "message").pipe(
        map(x => x.data as TrackPointData),
    );

    constructor() {
        super("coaster-worker.js");
    }

    postResetMessage(
        environment: Environment,
        selectedAddress: string,
        height: number,
        width: number,
        currentRide: Ride | undefined,
        stubChain = false
    ) {
        const message: ResetMessage = {
            type: "reset",
            environment,
            height,
            width,
            stubChain,
            currentRide,
            selectedAddress,
        };

        console.log(message);

        this.postMessage(message);
    }
}