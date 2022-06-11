import { filter, from, merge, Observable, OperatorFunction, takeUntil } from "rxjs";

export const filterUndefined = <T>() => filter(x => x != undefined) as OperatorFunction<T | undefined, T>;

export const createKickstartedObservable = <T>(observable: Observable<T>, getInitialValue: () => Promise<T>) => {
    return merge(observable, from(getInitialValue()).pipe(takeUntil(observable)));
};

export const mapWithPrevious = <TValue, TState>(mapper: (previous: TState | undefined, value: TValue) => TState) => {
    let previous: TState | undefined;
    return (current: TValue) => {
        const next = mapper(previous, current);
        previous = next;
        return next;
    };
};
