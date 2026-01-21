import { useQuery, useMutation } from 'convex/react'
import { ListChecks, Loader2 } from 'lucide-react'
import RestaurantCard from './RestaurantCard'
import { api } from '../../../../convex/_generated/api'

interface ShortlistPanelProps {
  visitorId: string
  visitorName: string
  highlightedPlaceId?: string | null
  onCardClick?: (placeId: string) => void
}

export default function ShortlistPanel({
  visitorId,
  visitorName,
  highlightedPlaceId,
  onCardClick,
}: ShortlistPanelProps) {
  const shortlist = useQuery(api.shortlist.list)
  const toggleVote = useMutation(api.votes.toggle)
  const removeFromShortlist = useMutation(api.shortlist.remove)

  const handleVote = async (placeId: string) => {
    await toggleVote({ visitorId, visitorName, placeId })
  }

  const handleRemove = async (placeId: string) => {
    await removeFromShortlist({ placeId })
  }

  if (shortlist === undefined) {
    return (
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 h-full flex flex-col">
      <div className="p-3 border-b border-gray-800 shrink-0">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-amber-500" />
          Shortlist & Voting
          {shortlist.length > 0 && (
            <span className="text-sm text-gray-400 font-normal">
              ({shortlist.length} restaurant{shortlist.length !== 1 ? 's' : ''})
            </span>
          )}
        </h2>
        <p className="text-sm text-gray-400">
          Vote for your favorites to help decide!
        </p>
      </div>

      {shortlist.length === 0 ? (
        <div className="p-6 text-center flex-1 flex flex-col items-center justify-center">
          <ListChecks className="w-10 h-10 text-gray-600 mb-2" />
          <p className="text-gray-400 text-sm">No restaurants shortlisted yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Ask AI to add restaurants!
          </p>
        </div>
      ) : (
        <div className="p-3 flex-1 overflow-auto">
          <div className="grid grid-cols-1 gap-3">
            {shortlist.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                placeId={restaurant.placeId}
                name={restaurant.name}
                address={restaurant.address}
                cuisine={restaurant.cuisine}
                rating={restaurant.rating}
                priceLevel={restaurant.priceLevel}
                voteCount={restaurant.voteCount}
                voters={restaurant.voters}
                hasVoted={restaurant.voterIds.includes(visitorId)}
                isHighlighted={highlightedPlaceId === restaurant.placeId}
                onVote={() => handleVote(restaurant.placeId)}
                onRemove={() => handleRemove(restaurant.placeId)}
                onClick={() => onCardClick?.(restaurant.placeId)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
