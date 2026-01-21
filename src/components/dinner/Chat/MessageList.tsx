import { useEffect, useRef } from 'react'
import { useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import { api } from '../../../../convex/_generated/api'
import type { DinnerChatMessages } from '@/lib/dinner-chat-hook'

interface MessageListProps {
  aiMessages?: DinnerChatMessages
}

export default function MessageList({ aiMessages }: MessageListProps) {
  const convexMessages = useQuery(api.messages.list)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract ALL text content from AI message parts
  const getAiTextContent = (parts: DinnerChatMessages[number]['parts']): string => {
    const textParts: string[] = []
    for (const part of parts) {
      if (part.type === 'text' && part.content) {
        textParts.push(part.content)
      }
    }
    return textParts.join('\n\n')
  }

  // Combine Convex messages with streaming AI messages
  const allMessages = convexMessages ?? []
  
  // Get ALL AI assistant messages from the current session
  const aiAssistantMessages = aiMessages?.filter(
    (m) => m.role === 'assistant'
  ) ?? []

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [convexMessages, aiMessages])

  if (convexMessages === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  const hasMessages = allMessages.length > 0 || aiAssistantMessages.length > 0

  if (!hasMessages) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-2">No messages yet</p>
          <p className="text-gray-500 text-sm">
            Type a message or mention <span className="text-amber-500">@ai</span>{' '}
            to get restaurant recommendations!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto space-y-2 p-4 scroll-smooth"
    >
      {/* Render Convex messages */}
      {allMessages.map((message) => (
        <MessageBubble
          key={message._id}
          senderName={message.senderName}
          content={message.content}
          isAi={message.isAi}
          timestamp={message._creationTime}
        />
      ))}
      
      {/* Render streaming AI messages */}
      {aiAssistantMessages.map((msg, idx) => {
        const content = getAiTextContent(msg.parts)
        if (!content) return null
        return (
          <MessageBubble
            key={`ai-stream-${idx}`}
            senderName="AI Assistant"
            content={content}
            isAi={true}
          />
        )
      })}
    </div>
  )
}
