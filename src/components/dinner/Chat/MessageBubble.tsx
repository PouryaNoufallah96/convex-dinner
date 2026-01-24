import { Bot, User } from "lucide-react";
import { Streamdown } from "streamdown";

interface MessageBubbleProps {
  senderName: string;
  content: string;
  isAi: boolean;
  timestamp?: number;
}

export default function MessageBubble({
  senderName,
  content,
  isAi,
  timestamp,
}: MessageBubbleProps) {
  const initials = isAi ? "AI" : senderName.slice(0, 2).toUpperCase();

  return (
    <div
      className={`flex gap-3 ${isAi ? "bg-amber-500/5" : ""} p-3 rounded-lg`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isAi
            ? "bg-linear-to-br from-amber-500 to-orange-600 text-white"
            : "bg-gray-700 text-gray-200"
        }`}
      >
        {isAi ? (
          <Bot className="w-4 h-4" />
        ) : (
          <span className="text-xs font-semibold">{initials}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className={`font-semibold text-sm ${
              isAi ? "text-amber-500" : "text-gray-200"
            }`}
          >
            {isAi ? "AI Assistant" : senderName}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-500">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="text-gray-300 text-sm prose prose-invert prose-sm max-w-none">
          {isAi ? <Streamdown>{content}</Streamdown> : content}
        </div>
      </div>
    </div>
  );
}
