import { Agent, createTool } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod/v3";

import { components, internal } from "./_generated/api";

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
- showOnMap: Pan the map to show a restaurant's location (client-side)
- showRestaurantCard: Show detailed info card for a restaurant (client-side)
- highlightShortlistItem: Highlight a restaurant in the shortlist (client-side)`;

// Define tools using createTool for proper Convex context access
const searchRestaurants = createTool({
  description:
    "Search for restaurants near a location. Use this when users ask for food recommendations, want to find places to eat, or mention cuisines/food types.",
  args: z.object({
    query: z
      .string()
      .describe(
        "Search query, e.g. 'Thai food', 'pizza', 'romantic dinner', 'best restaurants'"
      ),
  }),
  handler: async (ctx, args): Promise<unknown[]> => {
    // Get location from context or use defaults
    const lat = (ctx as any).lat ?? 45.5152;
    const lng = (ctx as any).lng ?? -122.6784;
    
    const results = await ctx.runAction(internal.places.searchNearbyInternal, {
      query: args.query,
      lat,
      lng,
    });
    return results;
  },
});

const getRestaurantDetails = createTool({
  description:
    "Get detailed information about a specific restaurant including reviews, hours, and contact info. Use when users want more info about a place.",
  args: z.object({
    placeId: z.string().describe("The Place ID of the restaurant"),
    name: z.string().describe("The restaurant name for context"),
  }),
  handler: async (ctx, args): Promise<unknown> => {
    const details = await ctx.runAction(internal.places.getDetailsInternal, {
      placeId: args.placeId,
    });
    return details;
  },
});

const addToShortlist = createTool({
  description:
    "Add a restaurant to the group's shortlist for voting. Use when users want to consider a restaurant or say things like 'add that one', 'let's consider that', 'put it on the list'.",
  args: z.object({
    placeId: z.string(),
    name: z.string(),
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    rating: z.number().optional(),
    priceLevel: z.number().optional(),
    cuisine: z.string().optional(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; reason?: string }> => {
    const senderName = (ctx as any).senderName ?? "AI";
    
    const result = await ctx.runMutation(internal.shortlist.addInternal, {
      ...args,
      addedBy: senderName,
    });
    return result;
  },
});

const removeFromShortlist = createTool({
  description:
    "Remove a restaurant from the shortlist. Use when users want to remove an option.",
  args: z.object({
    placeId: z.string(),
    name: z.string().describe("For confirmation message"),
  }),
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    await ctx.runMutation(internal.shortlist.removeInternal, { 
      placeId: args.placeId 
    });
    return { success: true };
  },
});

// Client-side tools - these execute but the client handles the actual UI update
// The tool calls are streamed to all clients who can react to them
const showOnMap = createTool({
  description:
    "Pan the map to a location and highlight it. Use when discussing a specific restaurant or when users want to see where something is.",
  args: z.object({
    lat: z.number(),
    lng: z.number(),
    placeId: z.string(),
    name: z.string(),
    zoom: z.number().optional().describe("Map zoom level, default 15"),
  }),
  handler: async (_ctx, args): Promise<{ shown: boolean; name: string }> => {
    // Client will handle the actual map panning via the tool call in the message
    return { shown: true, name: args.name };
  },
});

const showRestaurantCard = createTool({
  description:
    "Display a detailed card/modal for a restaurant. Use when users want to see more details, reviews, or hours for a specific place.",
  args: z.object({
    placeId: z.string(),
    name: z.string(),
  }),
  handler: async (): Promise<{ shown: boolean }> => {
    // Client will handle the actual card display
    return { shown: true };
  },
});

const highlightShortlistItem = createTool({
  description:
    "Highlight a restaurant in the shortlist UI to draw attention to it.",
  args: z.object({
    placeId: z.string(),
  }),
  handler: async (): Promise<{ highlighted: boolean }> => {
    // Client will handle the actual highlighting
    return { highlighted: true };
  },
});

// Create the Agent definition with all tools
export const dinnerAgent = new Agent(components.agent, {
  name: "DinnerBot",
  languageModel: anthropic("claude-haiku-4-5"),
  instructions: SYSTEM_PROMPT,
  tools: {
    searchRestaurants,
    getRestaurantDetails,
    addToShortlist,
    removeFromShortlist,
    showOnMap,
    showRestaurantCard,
    highlightShortlistItem,
  },
  maxSteps: 5,
});
