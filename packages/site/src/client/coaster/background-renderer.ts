export class BackgroundRenderer {
    private readonly backgroundImage: HTMLImageElement;
    private readonly frameMs = 30;
    private backgroundSliceWidth = 1000;
    private isImageLoaded = false;
    private backgroundImageHeight = 450;
    private backgroundImageWidth = 1200;

    public constructor(src: string, private readonly ctx: CanvasRenderingContext2D) {
        this.backgroundImage = new Image();
        this.backgroundImage.src = src;
        this.backgroundImage.addEventListener("load", () => {
            this.isImageLoaded = true;
        });
    }

    public render(timestamp: number) {
        if (!this.isImageLoaded) {
            return;
        }

        // 1. Decide on an interval in ms.
        // 2. Take the time in ms.
        // 3. Subtract (time % <interval>). The time is now divisible by <interval>.
        // 4. Divide the result by <interval>. This will return a number that ticks up once every <interval>.
        // 5. Modulus the result by the number of frames to get a frame index.
        const firstSegmentOffset =
            ((timestamp - (timestamp % this.frameMs)) / this.frameMs) % this.backgroundImageWidth;

        const firstSegmentWidth = Math.min(this.backgroundSliceWidth, this.backgroundImageWidth - firstSegmentOffset);
        const firstSegmentCanvasWidth = Math.round(
            (firstSegmentWidth / this.backgroundSliceWidth) * this.ctx.canvas.width,
        );
        const secondSegmentWidth = this.backgroundSliceWidth - firstSegmentWidth;
        const secondSegmentCanvasWidth = this.ctx.canvas.width - firstSegmentCanvasWidth;

        this.ctx.drawImage(
            this.backgroundImage,
            firstSegmentOffset,
            0,
            firstSegmentWidth,
            this.backgroundImageHeight,
            0,
            0,
            firstSegmentCanvasWidth,
            this.ctx.canvas.height,
        );

        if (secondSegmentWidth !== 0) {
            this.ctx.drawImage(
                this.backgroundImage,
                0,
                0,
                secondSegmentWidth,
                this.backgroundImageHeight,
                firstSegmentCanvasWidth,
                0,
                secondSegmentCanvasWidth,
                this.ctx.canvas.height,
            );
        }
    }
}
