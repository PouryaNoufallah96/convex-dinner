import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

// ============================================
// Server Tools - Execute on server via Convex
// ============================================

// Search for restaurants
export const searchRestaurantsToolDef = toolDefinition({
  name: 'searchRestaurants',
  description:
    'Search for restaurants near a location. Use this when users ask for food recommendations, want to find places to eat, or mention cuisines/food types.',
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search query, e.g. 'Thai food', 'pizza', 'romantic dinner', 'best restaurants'"
      ),
  }),
  outputSchema: z.array(
    z.object({
      placeId: z.string(),
      name: z.string(),
      address: z.string(),
      lat: z.number(),
      lng: z.number(),
      rating: z.number().nullable(),
      priceLevel: z.number().nullable(),
      cuisine: z.string().nullable(),
    })
  ),
})

// Get restaurant details
export const getRestaurantDetailsToolDef = toolDefinition({
  name: 'getRestaurantDetails',
  description:
    'Get detailed information about a specific restaurant including reviews, hours, and contact info. Use when users want more info about a place.',
  inputSchema: z.object({
    placeId: z.string().describe('The Place ID of the restaurant'),
    name: z.string().describe('The restaurant name for context'),
  }),
  outputSchema: z.object({
    placeId: z.string(),
    name: z.string(),
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    rating: z.number().nullable(),
    priceLevel: z.number().nullable(),
    hours: z.array(z.string()),
    reviews: z.array(
      z.object({
        rating: z.number(),
        text: z.string(),
        author: z.string(),
      })
    ),
    phone: z.string().nullable(),
    website: z.string().nullable(),
  }),
})

// Add restaurant to shortlist
export const addToShortlistToolDef = toolDefinition({
  name: 'addToShortlist',
  description:
    "Add a restaurant to the group's shortlist for voting. Use when users want to consider a restaurant or say things like 'add that one', 'let's consider that', 'put it on the list'.",
  inputSchema: z.object({
    placeId: z.string(),
    name: z.string(),
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    rating: z.number().optional(),
    priceLevel: z.number().optional(),
    cuisine: z.string().optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    reason: z.string().optional(),
  }),
})

// Remove from shortlist
export const removeFromShortlistToolDef = toolDefinition({
  name: 'removeFromShortlist',
  description:
    'Remove a restaurant from the shortlist. Use when users want to remove an option.',
  inputSchema: z.object({
    placeId: z.string(),
    name: z.string().describe('For confirmation message'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
  }),
})

// ============================================
// Client Tools - Execute in browser
// ============================================

// Show location on map
export const showOnMapToolDef = toolDefinition({
  name: 'showOnMap',
  description:
    'Pan the map to a location and highlight it. Use when discussing a specific restaurant or when users want to see where something is.',
  inputSchema: z.object({
    lat: z.number(),
    lng: z.number(),
    placeId: z.string(),
    name: z.string(),
    zoom: z.number().optional().describe('Map zoom level, default 15'),
  }),
  outputSchema: z.object({
    shown: z.boolean(),
    name: z.string(),
  }),
})

// Show restaurant detail card
export const showRestaurantCardToolDef = toolDefinition({
  name: 'showRestaurantCard',
  description:
    'Display a detailed card/modal for a restaurant. Use when users want to see more details, reviews, or hours for a specific place.',
  inputSchema: z.object({
    placeId: z.string(),
    name: z.string(),
  }),
  outputSchema: z.object({
    shown: z.boolean(),
  }),
})

// Highlight shortlist item
export const highlightShortlistItemToolDef = toolDefinition({
  name: 'highlightShortlistItem',
  description:
    'Highlight a restaurant in the shortlist UI to draw attention to it.',
  inputSchema: z.object({
    placeId: z.string(),
  }),
  outputSchema: z.object({
    highlighted: z.boolean(),
  }),
})

// Export all tool definitions for use in the chat API
export const allToolDefs = {
  searchRestaurants: searchRestaurantsToolDef,
  getRestaurantDetails: getRestaurantDetailsToolDef,
  addToShortlist: addToShortlistToolDef,
  removeFromShortlist: removeFromShortlistToolDef,
  showOnMap: showOnMapToolDef,
  showRestaurantCard: showRestaurantCardToolDef,
  highlightShortlistItem: highlightShortlistItemToolDef,
}
