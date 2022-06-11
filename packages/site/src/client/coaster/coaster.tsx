import { Box } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { combineLatest, debounceTime, distinctUntilChanged, from, Observable } from "rxjs";
import { useContext } from "../modules/context";
import { Environment } from "../modules/environments";
import { filterUndefined } from "../modules/rx-helpers";
import { CanvasRenderer } from "./canvas-renderer";
import { CoasterWorker } from "./coaster-worker";
import "./coaster.scss";

interface CoasterProps {
    environment: Environment;
    stubChain?: boolean;
}

interface Rect {
    width: number;
    height: number;
}

const resizeDebounceMs = 500;

const createResizeObservable = (element: HTMLElement) =>
    new Observable<Rect>(subscriber => {
        const observer = new ResizeObserver(x =>
            x.forEach(y =>
                subscriber.next({
                    width: Math.round(y.contentRect.width),
                    height: Math.round(y.contentRect.height),
                }),
            ),
        );
        observer.observe(element);
        return () => observer.disconnect();
    });

// TODO: use the page visibility API to stop/restart

export const Coaster = ({ environment, stubChain = false }: CoasterProps) => {
    const smartdoge = useContext()?.smartdoge;
    const dogecoaster = useContext()?.dogecoaster;
    const [box, setBox] = useState<HTMLDivElement>();
    const worker = useRef<CoasterWorker>();
    const [canvasRenderer, setCanvasRenderer] = useState<CanvasRenderer>();
    const [selectedAddress, setSelectedAddress] = useState<string>();
    const [canvas, setCanvas] = useState<HTMLCanvasElement>();

    useEffect(() => {
        if (smartdoge == undefined) {
            return undefined;
        }

        const subscription = smartdoge.onConnectedChanged.subscribe(() => {
            setSelectedAddress(window.ethereum.selectedAddress ?? undefined);
        });

        return () => subscription.unsubscribe();
    }, [smartdoge]);

    useEffect(() => {
        if (canvasRenderer == undefined) {
            return;
        }

        worker.current = new CoasterWorker();
        worker.current.onMessage.subscribe(canvasRenderer);
        return () => worker.current?.terminate();
    }, [canvasRenderer])

    useEffect(() => {
        if (box == undefined || selectedAddress == undefined || canvas == undefined || dogecoaster == undefined) {
            return;
        }

        const resize = createResizeObservable(box)
            .pipe(
                distinctUntilChanged((p, c) => p.width === c.width && p.height === c.height),
                debounceTime(resizeDebounceMs),
                filterUndefined(),
            );

        const currentRide = from(dogecoaster.getCurrentRide());

        const subscription = combineLatest([resize, currentRide])
            .subscribe(([{ width, height }, ride]) => {
                canvas.width = width;
                canvas.height = height;
                worker.current!.postResetMessage(environment, selectedAddress, height, width, ride, stubChain);
            });

        return () => subscription.unsubscribe();
    }, [box, selectedAddress]);

    const boxRef = useCallback((x: HTMLDivElement) => void setBox(x), []);
    const canvasRef = useCallback((x: HTMLCanvasElement) => {
        setCanvas(x);
        const context = x.getContext("2d", { alpha: false });
        setCanvasRenderer(new CanvasRenderer(context!));
    }, []);

    return (
        <Box width="100%" height="100%" ref={boxRef}>
            <canvas className="canvas" ref={canvasRef} />
        </Box>
    );
};
