import { useState, useEffect } from 'react'
import { User, ArrowRight, X } from 'lucide-react'
import { setVisitorName, getVisitorId } from '@/lib/visitor'

interface LoginDialogProps {
  open: boolean
  onSuccess: (name: string) => void
  onClose?: () => void
  showCloseButton?: boolean
}

export default function LoginDialog({ open, onSuccess, onClose, showCloseButton = false }: LoginDialogProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setError('')
    }
  }, [open])

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

    // Save name and call success callback
    setVisitorName(trimmed)
    onSuccess(trimmed)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 shadow-2xl">
            {showCloseButton && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            
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
      </div>
    </div>
  )
}
