import type { BlockPoint, Point, TrackPointData } from "../coaster-worker/track-point-calculator";

const coasterPercentFromLeft = 0.8;
const coasterWidthPx = 60;
const coasterHeightPx = 60;
const postSpacingPx = 40;
const positiveStokeStyle = "green";
const negativeStrokeStyle = "red";
const neutralStrokeStyle = "black";

interface SegmentStyle {
    x: number;
    strokeStyle: string;
}

const calculateSegmentStyles = (points: BlockPoint[]) => {
    return points.map<SegmentStyle>(x => {
        const strokeStyle = x.isInRide ? x.isGreaterThanLast ? positiveStokeStyle : negativeStrokeStyle : neutralStrokeStyle;
        return { x: x.x, minX: 0, strokeStyle };
    })
}

export class CoasterRenderer {
    private readonly backgroundImage: HTMLImageElement;
    private firstPostReferencePointX: number | undefined;
    private firstPostReferencePointOffset = 5; // The first post can flash due to a rounding error if it's at the exact beginning.

    constructor(coasterSrc: string, private readonly ctx: CanvasRenderingContext2D) {
        this.backgroundImage = new Image();
        this.backgroundImage.src = coasterSrc;
    }

    public render({ blockPoints, curvePoints }: TrackPointData) {
        const segmentStyles = calculateSegmentStyles(blockPoints);
        this.renderTrackPosts(blockPoints, curvePoints);
        this.renderTrack(curvePoints, segmentStyles);
        this.renderCoaster(curvePoints);
    }

    private renderTrackPoints(blockPoints: readonly BlockPoint[]) {
        for (const blockPoint of blockPoints) {
            this.ctx.fillStyle = blockPoint.isGreaterThanLast ? "green" : "red";
            this.ctx.fillRect(blockPoint.x, blockPoint.y - 3, 6, 6);
        }
    }

    private renderTrack(curvePoints: readonly Point[], segmentStyles: SegmentStyle[]) {
        if (curvePoints.length === 0) {
            return;
        }

        let segmentStyleI = 0;
        let lastStrokeStyle: string | undefined;
        const getStrokeStyle = (currentX: number) => {
            const currentSegmentStyle = segmentStyles[segmentStyleI];
            if (currentSegmentStyle == undefined) {
                return neutralStrokeStyle;
            }

            const nextSegmentStyle = segmentStyles[segmentStyleI + 1];
            if (nextSegmentStyle == undefined || currentX > nextSegmentStyle.x) {
                return currentSegmentStyle.strokeStyle;
            } else {
                segmentStyleI++;
                return nextSegmentStyle.strokeStyle;
            }
        }

        this.ctx.save();
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();

        this.ctx.moveTo(Math.round(curvePoints[0].x), Math.round(curvePoints[0].y));
        for (let i = 1; i < curvePoints.length; i++) {
            const current = curvePoints[i];
            const style = getStrokeStyle(current.x);
            if (style != lastStrokeStyle) {
                if (lastStrokeStyle != undefined) {
                    this.ctx.stroke();
                    this.ctx.beginPath();
                }

                this.ctx.strokeStyle = lastStrokeStyle = style;
            }

            this.ctx.lineTo(current.x, current.y);
        }

        this.ctx.stroke();
        this.ctx.restore();
    }

    private renderCoaster(points: readonly Point[]) {
        const trackPosition = this.getCoasterTrackPosition(points);
        if (trackPosition == undefined) {
            return;
        }

        const coasterCenterHeight = coasterHeightPx / 2;
        const perpendicularSlope = -1 / trackPosition.slope;
        const perpendicularAngle = Math.atan(perpendicularSlope);
        const deltaX = coasterCenterHeight * Math.cos(perpendicularAngle);
        const deltaY = coasterCenterHeight * Math.sin(perpendicularAngle);
        const slopeSign = Math.sign(trackPosition.slope);
        const coasterCenterX = this.getCoasterTrackX() + deltaX * slopeSign;
        const coasterCenterY = trackPosition.y + deltaY * slopeSign;

        this.ctx.save();
        this.ctx.translate(coasterCenterX, coasterCenterY);
        this.ctx.rotate(Math.atan(trackPosition.slope));
        this.ctx.translate(-coasterCenterX, -coasterCenterY);
        this.ctx.drawImage(
            this.backgroundImage,
            coasterCenterX - coasterWidthPx / 2,
            coasterCenterY - coasterCenterHeight,
            coasterWidthPx,
            coasterHeightPx,
        );
        this.ctx.restore();
    }

    private getCoasterTrackPosition(points: readonly Point[]) {
        // Coaster line is rendered from right to left.
        const coasterTrackX = this.getCoasterTrackX();
        for (let i = 1; i < points.length; i++) {
            const start = points[i];
            if (start.x < coasterTrackX) {
                const end = points[i - 1];
                const slope = (end.y - start.y) / (end.x - start.x);
                const segmentDeltaX = coasterTrackX - start.x;
                const y = start.y + slope * segmentDeltaX;
                return { slope, y };
            }
        }
    }

    private renderTrackPosts(blockPoints: readonly BlockPoint[], trackCurve: readonly Point[]) {
        this.ctx.save();
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        // Coaster line is rendered from right to left.
        if (blockPoints.length < 2) {
            return;
        }

        this.firstPostReferencePointX ??= blockPoints[0].x;
        const isNewPoint = blockPoints[0].x > this.firstPostReferencePointX;

        // Needs to be set to the current value of the oldest point in all cases.
        this.firstPostReferencePointX = blockPoints[isNewPoint ? 1 : 0].x;

        let current = this.firstPostReferencePointX + this.firstPostReferencePointOffset;
        if (isNewPoint) {
            // A new point has been added. Update the post references relative to the new point.
            const distanceToNextFirst = blockPoints[0].x - current;

            // Travel a multiple of the post distance past the next point.
            const newFirstPostShift = Math.ceil(distanceToNextFirst / postSpacingPx) * postSpacingPx;
            current += newFirstPostShift;
            this.firstPostReferencePointOffset = current - blockPoints[0].x;
            this.firstPostReferencePointX = blockPoints[0].x;
        }

        current -= Math.ceil((current - this.ctx.canvas.width) / postSpacingPx) * postSpacingPx;

        // https://stackoverflow.com/questions/4938346/canvas-width-and-height-in-html5#comment16500199_11083198
        current = Math.round(current) - 0.5;
        outer: for (let i = 1; i < trackCurve.length; i++) {
            const start = trackCurve[i];
            const end = trackCurve[i - 1];
            while (start.x <= current && end.x >= current) {
                const slope = (end.y - start.y) / (end.x - start.x);
                const segmentDeltaX = current - start.x;
                const y = start.y + slope * segmentDeltaX;
                this.ctx.moveTo(current, y);
                this.ctx.lineTo(current, this.ctx.canvas.height);
                current -= postSpacingPx;
                if (current < 0) {
                    break outer;
                }
            }
        }

        this.ctx.stroke();
        this.ctx.restore();
        return;
    }

    private getCoasterTrackX() {
        return this.ctx.canvas.width * coasterPercentFromLeft;
    }
}
