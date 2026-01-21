import { Star, DollarSign, MapPin, Trash2 } from 'lucide-react'
import VoteButton from './VoteButton'

interface RestaurantCardProps {
  placeId: string
  name: string
  address: string
  cuisine?: string | null
  rating?: number | null
  priceLevel?: number | null
  voteCount: number
  voters: string[]
  hasVoted: boolean
  isHighlighted?: boolean
  onVote: () => void
  onRemove: () => void
  onClick?: () => void
}

export default function RestaurantCard({
  name,
  address,
  cuisine,
  rating,
  priceLevel,
  voteCount,
  voters,
  hasVoted,
  isHighlighted,
  onVote,
  onRemove,
  onClick,
}: RestaurantCardProps) {
  // Render price level as dollar signs
  const renderPriceLevel = (level: number | null | undefined) => {
    if (level === null || level === undefined) return null
    return (
      <span className="text-green-500">
        {'$'.repeat(Math.max(1, level))}
        <span className="text-gray-600">{'$'.repeat(Math.max(0, 4 - level))}</span>
      </span>
    )
  }

  return (
    <div
      className={`bg-gray-800 rounded-lg p-3 border transition-all cursor-pointer hover:border-amber-500/50 ${
        isHighlighted
          ? 'border-amber-500 ring-1 ring-amber-500/30'
          : 'border-gray-700'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Left: Restaurant info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{name}</h3>
            {cuisine && (
              <span className="shrink-0 px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                {cuisine}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            {rating && (
              <div className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            {priceLevel !== null && priceLevel !== undefined && (
              <span>{renderPriceLevel(priceLevel)}</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        </div>

        {/* Right: Vote button + remove */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <VoteButton
            voteCount={voteCount}
            hasVoted={hasVoted}
            voters={voters}
            onToggle={onVote}
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="text-gray-500 hover:text-red-500 p-1 transition-colors"
            title="Remove from shortlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
