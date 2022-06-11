// https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas

import { Point } from "./track-point-calculator";

export const calculateCurvePoints = (points: readonly Point[], tension = 0.5, segmentCount = 16) => {
    const curvePoints = [];
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const last = i === 0 ? current : points[i - 1];
        const next = points[i + 1];
        const afterNext = i === points.length - 2 ? next : points[i + 2];

        // i = steps based on num. of segments
        for (let t = 0; t <= segmentCount; t++) {
            // calc tension vectors
            const t1x = (next.x - last.x) * tension;
            const t2x = (afterNext.x - current.x) * tension;

            const t1y = (next.y - last.y) * tension;
            const t2y = (afterNext.y - current.y) * tension;

            // calc step
            const st = t / segmentCount;

            // calc cardinals
            const c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
            const c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
            const c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
            const c4 = Math.pow(st, 3) - Math.pow(st, 2);

            // calc x and y cords with common control vectors
            const x = c1 * current.x + c2 * next.x + c3 * t1x + c4 * t2x;
            const y = c1 * current.y + c2 * next.y + c3 * t1y + c4 * t2y;

            curvePoints.push({ x, y });
        }
    }

    return curvePoints;
};
