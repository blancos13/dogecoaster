import React, { UIEvent, useCallback, useRef } from "react";
import { ChatMessage } from "../../common/messaging";
import "./chat-messages.scss";
import { Message } from "./message";

interface ChatMessagesProps {
    messages: readonly ChatMessage[];
    userId: string;
}

export function ChatMessages({ messages, userId }: ChatMessagesProps) {
    const lastMessagesLength = useRef(0);
    const mutationObserver = useRef<MutationObserver>();
    const autoscroll = useRef(true);

    const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
        const { currentTarget } = e;
        autoscroll.current = currentTarget.scrollTop + currentTarget.clientHeight >= currentTarget.scrollHeight;
    }, []);

    const rootDivRef = useCallback((node: HTMLDivElement) => {
        mutationObserver.current ??= new MutationObserver(() => {
            if (autoscroll.current && node.children.length > 0) {
                node.children[node.children.length - 1].scrollIntoView();
            }
        });

        if (node == undefined) {
            return;
        }

        mutationObserver.current.disconnect();
        mutationObserver.current.observe(node, { childList: true });
    }, []);

    if (messages.length > lastMessagesLength.current) {
        lastMessagesLength.current = messages.length;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            // you're at the bottom of the page
        }
    }

    const messageElements = messages.map((x, i) => <Message external={x.userId !== userId} key={i} message={x} />);

    return (
        <div className="chat-messages-root" onScroll={handleScroll} ref={rootDivRef}>
            {messageElements}
        </div>
    );
}
