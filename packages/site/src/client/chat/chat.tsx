import { Flex, Heading } from "@chakra-ui/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { map } from "rxjs";
import { ChatMessage } from "../../common/messaging";
import { SocketIOObservable } from "../modules/socket-io-observable";
import { ChatMessages } from "./chat-messages";
import { InputRow } from "./input-row";

interface ChatProps {
    userId: string;
}

export const Chat = ({ userId }: ChatProps) => {
    const socketIO = useRef<SocketIOObservable>();
    const [messages, setMessages] = useState<readonly ChatMessage[]>([]);

    const handleChatMessage = useCallback((message: ChatMessage) => {
        setMessages(messages => [...messages, message]);
    }, []);

    useEffect(() => {
        socketIO.current = new SocketIOObservable();
        socketIO.current
            .pipe(
                SocketIOObservable.createSocketIOFilterOperator("chat"),
                map(x => x.payload),
            )
            .subscribe(handleChatMessage);
    }, [handleChatMessage]);

    const handleSubmit = useCallback(
        (messageText: string) => {
            if (socketIO.current == undefined) {
                return;
            }

            socketIO.current.send("pendingChat", {
                text: messageText,
                userId,
            });
        },
        [userId],
    );

    return (
        <Flex direction="column" height="100%" padding={4}>
            <Heading size="lg">Trollbox</Heading>
            <ChatMessages messages={messages} userId={userId} />
            <InputRow onSubmit={handleSubmit} />
        </Flex>
    );
};
