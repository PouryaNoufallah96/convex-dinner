import MessageList from './MessageList'
import ChatInput from './ChatInput'
import type { DinnerChatMessages } from '@/lib/dinner-chat-hook'

interface ChatPanelProps {
  visitorName: string
  onSendToAi: (message: string) => void
  isAiLoading: boolean
  aiMessages?: DinnerChatMessages
}

export default function ChatPanel({
  visitorName,
  onSendToAi,
  isAiLoading,
  aiMessages,
}: ChatPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-800">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Group Chat</h2>
        <p className="text-sm text-gray-400">
          Chat with friends and @ai to find restaurants
        </p>
      </div>
      <MessageList aiMessages={aiMessages} />
      <ChatInput
        visitorName={visitorName}
        onSendToAi={onSendToAi}
        isAiLoading={isAiLoading}
      />
    </div>
  )
}

export { MessageList, ChatInput }
