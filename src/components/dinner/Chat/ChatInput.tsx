import { useState, useCallback } from "react";
import { Send, Loader2, Bot } from "lucide-react";

interface ChatInputProps {
  visitorName: string;
  onSendToAi: (message: string) => void;
  isAiLoading?: boolean;
}

export default function ChatInput({
  visitorName: _visitorName,
  onSendToAi,
  isAiLoading = false,
}: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed) return;

      // All messages go through the Convex Agent action
      // The action will save the message to the thread
      // If @ai is mentioned, it will also trigger AI response
      onSendToAi(trimmed);

      setInput("");
    },
    [input, onSendToAi]
  );

  const mentionsAi =
    input.toLowerCase().includes("@ai") ||
    input.toLowerCase().startsWith("ai ");

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... (use @ai for recommendations)"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
            disabled={isAiLoading}
          />
          {mentionsAi && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Bot className="w-4 h-4 text-amber-500" />
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isAiLoading}
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-white p-3 rounded-lg transition-colors"
        >
          {isAiLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Mention <span className="text-amber-500">@ai</span> to search for
        restaurants and get recommendations
      </p>
    </form>
  );
}
