import classnames from "classnames";
import { format } from "date-fns";
import React from "react";
import { ChatMessage } from "../../common/messaging";
import "./message.scss";

interface MessageProps {
    message: ChatMessage;
    external: boolean;
}

export const Message = ({ external, message }: MessageProps) => {
    return (
        <div className={classnames("message-root", { external })}>
            <div>{format(message.timestamp, "p")}</div>
            <div>{message.text}</div>
        </div>
    );
};
