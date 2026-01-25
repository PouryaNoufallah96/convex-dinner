import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { UIMessage } from "@/lib/useDinnerChat";

interface MessageListProps {
  messages: UIMessage[];
  isLoading?: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract text content from a UIMessage
  const getMessageContent = (message: UIMessage): string => {
    // UIMessage has a text property that contains the full text
    if (message.text) {
      return message.text;
    }

    // Fallback: extract from parts
    const textParts: string[] = [];
    for (const part of message.parts || []) {
      if (part.type === "text" && "text" in part) {
        textParts.push(part.text);
      }
    }
    return textParts.join("\n\n");
  };

  // Extract sender name from the message content
  // Messages are saved as "[SenderName]: content"
  const parseSenderAndContent = (
    message: UIMessage
  ): { senderName: string; content: string; isAi: boolean } => {
    const fullContent = getMessageContent(message);
    const isAi = message.role === "assistant";

    // For assistant messages, use AI Assistant as sender
    if (isAi) {
      return {
        senderName: message.agentName || "AI Assistant",
        content: fullContent,
        isAi: true,
      };
    }

    // For user messages, try to extract [SenderName]: pattern
    const match = fullContent.match(/^\[([^\]]+)\]:\s*(.*)$/s);
    if (match) {
      return {
        senderName: match[1],
        content: match[2],
        isAi: false,
      };
    }

    // Fallback
    return {
      senderName: "User",
      content: fullContent,
      isAi: false,
    };
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">No messages yet</p>
          <p className="text-gray-500 text-sm">
            Type a message or mention{" "}
            <span className="text-amber-500">@ai</span> to get restaurant
            recommendations!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-2 p-4 scroll-smooth"
    >
      {messages.map((message) => {
        const { senderName, content, isAi } = parseSenderAndContent(message);

        // Skip empty messages
        if (!content.trim()) return null;

        return (
          <MessageBubble
            key={message.key}
            senderName={senderName}
            content={content}
            isAi={isAi}
            timestamp={message._creationTime}
          />
        );
      })}
    </div>
  );
}
