import { filter, Observable, Subscriber } from "rxjs";
import { io } from "socket.io-client";
import { defaultSocketIOChannel, parseStreamingMessage, SocketIOMessage } from "../../common/messaging";

export class SocketIOObservable extends Observable<SocketIOMessage> {
    public static createSocketIOFilterOperator = <
        TType extends SocketIOMessage["type"],
        TReturn extends Extract<SocketIOMessage, { type: TType }>,
        >(
            type: TType,
    ) => {
        return filter((x: SocketIOMessage): x is TReturn => x.type === type);
    };

    private socket = io("localhost:3000");
    private subscriber: Subscriber<SocketIOMessage> | undefined;

    constructor() {
        super(subscriber => (this.subscriber = subscriber));
        this.socket.on(defaultSocketIOChannel, x => this.handleMessage(x));
    }

    connect() {
        this.socket.connect();
    }

    send<TType extends SocketIOMessage["type"], TPayload extends Extract<SocketIOMessage, { type: TType }>["payload"]>(
        type: TType,
        payload: TPayload,
    ) {
        this.socket.send(JSON.stringify({ type, payload }));
    }

    private handleMessage(messageJSON: unknown | undefined) {
        if (this.subscriber == undefined) {
            return;
        }

        if (typeof messageJSON !== "string") {
            console.error("Received streaming message of type other than string.");
            return;
        }

        const message = parseStreamingMessage(messageJSON);
        if (message != undefined) {
            this.subscriber.next(message);
        }
    }
}
