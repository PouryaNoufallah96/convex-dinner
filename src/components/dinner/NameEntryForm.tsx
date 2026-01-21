import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { User, ArrowRight } from 'lucide-react'
import { setVisitorName, getVisitorId } from '@/lib/visitor'

export default function NameEntryForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()

    if (!trimmed) {
      setError('Please enter your name')
      return
    }

    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters')
      return
    }

    if (trimmed.length > 20) {
      setError('Name must be 20 characters or less')
      return
    }

    // Ensure visitor ID exists
    getVisitorId()

    // Save name and navigate to chat
    setVisitorName(trimmed)
    navigate({ to: '/chat' })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
        <div className="flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mx-auto mb-6">
          <User className="w-8 h-8 text-amber-500" />
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Join the Chat
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Enter your display name to join the group
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="Enter your name..."
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent"
              autoFocus
              autoComplete="off"
            />
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Join Chat
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  )
}
