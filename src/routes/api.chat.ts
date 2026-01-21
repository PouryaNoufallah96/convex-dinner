import { createFileRoute } from '@tanstack/react-router'
import { chat, maxIterations, toServerSentEventsResponse } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { ConvexHttpClient } from 'convex/browser'

import {
  searchRestaurantsToolDef,
  getRestaurantDetailsToolDef,
  addToShortlistToolDef,
  removeFromShortlistToolDef,
  showOnMapToolDef,
  showRestaurantCardToolDef,
  highlightShortlistItemToolDef,
} from '@/lib/dinner-tools'
import { api } from '../../convex/_generated/api'

const SYSTEM_PROMPT = `You are a helpful AI assistant in a group chat helping friends decide where to eat dinner.

You have access to tools to search for restaurants, get details, and manage a shortlist for voting.

IMPORTANT GUIDELINES:
- Keep responses concise and friendly
- When you find restaurants, briefly describe the top 2-3 options and offer to add favorites to the shortlist
- When showing locations on the map, use the showOnMap tool so everyone can see it
- When adding to shortlist, confirm what was added
- If users are having trouble deciding, look at the current votes and make a recommendation
- Always be helpful and enthusiastic about helping find great food!

Available tools:
- searchRestaurants: Search for restaurants by cuisine, type, or general query
- getRestaurantDetails: Get detailed info about a specific restaurant
- addToShortlist: Add a restaurant to the group's voting shortlist
- removeFromShortlist: Remove a restaurant from the shortlist
- showOnMap: Pan the map to show a restaurant's location
- showRestaurantCard: Show detailed info card for a restaurant
- highlightShortlistItem: Highlight a restaurant in the shortlist`

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestSignal = request.signal

        if (requestSignal.aborted) {
          return new Response(null, { status: 499 })
        }

        const abortController = new AbortController()

        try {
          const body = await request.json()
          const { messages, senderName, userLocation } = body

          // Create Convex client for server tools
          const convexUrl = process.env.VITE_CONVEX_URL
          if (!convexUrl) {
            throw new Error('VITE_CONVEX_URL not configured')
          }
          const convex = new ConvexHttpClient(convexUrl)

          // Create server tool implementations
          const searchRestaurants = searchRestaurantsToolDef.server(
            async ({ query }) => {
              const results = await convex.action(api.places.searchNearby, {
                query,
                lat: userLocation?.lat ?? 45.5152,
                lng: userLocation?.lng ?? -122.6784,
              })
              return results
            }
          )

          const getRestaurantDetails = getRestaurantDetailsToolDef.server(
            async ({ placeId }) => {
              const details = await convex.action(api.places.getDetails, {
                placeId,
              })
              return details
            }
          )

          const addToShortlist = addToShortlistToolDef.server(
            async (restaurant) => {
              const result = await convex.mutation(api.shortlist.add, {
                ...restaurant,
                addedBy: senderName || 'AI',
              })
              return result
            }
          )

          const removeFromShortlist = removeFromShortlistToolDef.server(
            async ({ placeId }) => {
              await convex.mutation(api.shortlist.remove, { placeId })
              return { success: true }
            }
          )

          // Add enhanced system prompt with context
          const enhancedSystemPrompt = `${SYSTEM_PROMPT}

Current user's name: ${senderName || 'Anonymous'}
The group is located near: ${userLocation?.lat ?? 45.5152}, ${userLocation?.lng ?? -122.6784} (Portland, OR area)`

          const stream = chat({
            adapter: anthropicText('claude-haiku-4-5'),
            tools: [
              searchRestaurants,
              getRestaurantDetails,
              addToShortlist,
              removeFromShortlist,
              // Client tools - just pass definitions, client will handle execution
              showOnMapToolDef,
              showRestaurantCardToolDef,
              highlightShortlistItemToolDef,
            ],
            systemPrompts: [enhancedSystemPrompt],
            agentLoopStrategy: maxIterations(5),
            messages,
            abortController,
          })

          return toServerSentEventsResponse(stream, { abortController })
        } catch (error: any) {
          if (error.name === 'AbortError' || abortController.signal.aborted) {
            return new Response(null, { status: 499 })
          }
          console.error('Chat API error:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to process chat request' }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
      },
    },
  },
})
