import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import type { UIMessage } from "@/lib/useDinnerChat";
import type { UserLocation } from "@/lib/location";

interface ChatPanelProps {
  messages: UIMessage[];
  isLoading: boolean;
  isStreaming?: boolean;
  threadId: string | null | undefined;
  senderName: string;
  userLocation: UserLocation;
}

export default function ChatPanel({
  messages,
  isLoading,
  isStreaming,
  threadId,
  senderName,
  userLocation,
}: ChatPanelProps) {
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
      <ChatInput
        threadId={threadId}
        senderName={senderName}
        userLocation={userLocation}
        isAiLoading={isLoading || isStreaming}
      />
    </div>
  );
}

export { MessageList, ChatInput };
