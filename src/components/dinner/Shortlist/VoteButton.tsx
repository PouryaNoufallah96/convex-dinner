import { ThumbsUp } from 'lucide-react'

interface VoteButtonProps {
  voteCount: number
  hasVoted: boolean
  voters: string[]
  onToggle: () => void
  disabled?: boolean
}

export default function VoteButton({
  voteCount,
  hasVoted,
  voters,
  onToggle,
  disabled,
}: VoteButtonProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          hasVoted
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <ThumbsUp
          className={`w-4 h-4 transition-transform ${
            hasVoted ? 'fill-current' : 'group-hover:scale-110'
          }`}
        />
        <span className="font-semibold">{voteCount}</span>
      </button>
      {voters.length > 0 && (
        <div className="text-xs text-gray-500 text-center max-w-full truncate">
          {voters.slice(0, 3).join(', ')}
          {voters.length > 3 && ` +${voters.length - 3}`}
        </div>
      )}
    </div>
  )
}
