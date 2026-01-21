import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { Send, Loader2, Bot } from 'lucide-react'
import { api } from '../../../../convex/_generated/api'

interface ChatInputProps {
  visitorName: string
  onSendToAi: (message: string) => void
  isAiLoading: boolean
}

export default function ChatInput({
  visitorName,
  onSendToAi,
  isAiLoading,
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const sendMessage = useMutation(api.messages.send)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed) return

      // Check if message mentions AI
      const mentionsAi =
        trimmed.toLowerCase().includes('@ai') ||
        trimmed.toLowerCase().startsWith('ai ')

      // Save message to Convex (for everyone to see)
      await sendMessage({
        senderName: visitorName,
        content: trimmed,
        isAi: false,
      })

      // If mentions AI, also send to AI endpoint
      if (mentionsAi) {
        onSendToAi(trimmed)
      }

      setInput('')
    },
    [input, visitorName, sendMessage, onSendToAi]
  )

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
          {input.toLowerCase().includes('@ai') && (
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
  )
}
