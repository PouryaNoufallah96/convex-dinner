import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { useMessages, useAIStatus } from "@/stores";

export default function ChatPanel() {
  const messages = useMessages();
  const { isLoading, isStreaming } = useAIStatus();

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Group Chat</h2>
        <p className="text-sm text-gray-400">
          Chat with friends and @ai to find restaurants
        </p>
        {isStreaming && (
          <p className="text-xs text-amber-500 mt-1">AI is typing...</p>
        )}
      </div>
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput />
    </div>
  );
}

export { MessageList, ChatInput };
