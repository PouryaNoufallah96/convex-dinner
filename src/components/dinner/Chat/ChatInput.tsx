import { Send, Loader2, Bot } from "lucide-react";
import { useChatInput } from "@/lib/useChatInput";
import { useAIStatus } from "@/stores";

export default function ChatInput() {
  const { input, setInput, handleSubmit, mentionsAi, canSend } = useChatInput();
  const { isAiLoading } = useAIStatus();

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
          disabled={!canSend || isAiLoading}
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
