import { Observer } from "rxjs";
import type { TrackPointData } from "../coaster-worker/track-point-calculator";
import { BackgroundRenderer } from "./background-renderer";
import { CoasterRenderer } from "./coaster-renderer";

// TODO: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

export class CanvasRenderer implements Observer<TrackPointData> {
    private readonly backgroundRenderer: BackgroundRenderer;
    private readonly coasterRenderer: CoasterRenderer;

    constructor(private readonly ctx: CanvasRenderingContext2D) {
        this.backgroundRenderer = new BackgroundRenderer("/assets/background.png", ctx);
        this.coasterRenderer = new CoasterRenderer("/assets/doge-in-coaster.png", ctx);
    }

    next(trackPoints: TrackPointData) {
        this.clearCanvas();

        // TODO: Create a render context that is passed that includes the timestamp.
        this.backgroundRenderer.render(performance.now());
        this.coasterRenderer.render(trackPoints);
    }

    error(err: any) {
        throw err;
    }

    complete() {
        throw new Error("Track observable complete. This should never happen.");
    }

    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
