import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import type { Message } from "@/lib/chat";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-chat-user" : "bg-accent"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-chat-user-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-accent-foreground" />
        )}
      </div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-tr-sm"
            : "bg-chat-bot text-chat-bot-foreground rounded-tl-sm"
        }`}
      >
        <div className="prose prose-sm max-w-none [&_p]:m-0 [&_p:not(:last-child)]:mb-2">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
