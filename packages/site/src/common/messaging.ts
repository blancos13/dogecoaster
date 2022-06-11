export interface PendingChatMessage {
    text: string;
    userId: string;
}

export interface ChatMessage extends PendingChatMessage {
    timestamp: number;
}

interface _SocketIOMessage<TType extends string, TPayload> {
    type: TType;
    payload: TPayload;
}

export const defaultSocketIOChannel = "message";

export type SocketIOMessage =
    | _SocketIOMessage<"pendingChat", PendingChatMessage>
    | _SocketIOMessage<"chat", ChatMessage>;

export const parseStreamingMessage = (messageJSON: string) => {
    let message: SocketIOMessage;
    try {
        message = JSON.parse(messageJSON) as SocketIOMessage;
    } catch (e) {
        console.error("Error parsing streaming message.", e);
        return;
    }

    if (typeof message.type !== "string") {
        console.error('Streaming message missing required field "type".');
    }

    return message;
};
