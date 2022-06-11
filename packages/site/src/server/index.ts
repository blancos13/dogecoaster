import cors from "@koa/cors";
import { createServer } from "http";
import Koa from "koa";
import { Server } from "socket.io";
import { ChatMessage, defaultSocketIOChannel, parseStreamingMessage, SocketIOMessage } from "../common/messaging";

const app = new Koa();

app.use(cors());

app.use(ctx => {
    ctx.body = "Hello world";
});

const httpServer = createServer(app.callback());

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:9000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", socket => {
    socket.on(defaultSocketIOChannel, (messageJSON: string) => {
        const message = parseStreamingMessage(messageJSON);
        if (message == undefined) {
            return;
        }

        const outboundPayload: ChatMessage = { ...message.payload, timestamp: new Date().valueOf() };
        const outbound: SocketIOMessage = { type: "chat", payload: outboundPayload };
        switch (message.type) {
            case "pendingChat":
                io.emit(defaultSocketIOChannel, JSON.stringify(outbound));
                break;
        }
    });
});

httpServer.listen(3000);
console.log("Server running on port 3000");
