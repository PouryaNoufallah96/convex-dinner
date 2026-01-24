// NOTE: This file is kept for reference.
// Tool definitions have been moved to convex/dinnerAgent.ts
// Client tool handling is now done via the UIMessage parts in the dinner-chat-hook.

// Legacy exports for reference - these are no longer used
export const TOOL_NAMES = {
  searchRestaurants: "searchRestaurants",
  getRestaurantDetails: "getRestaurantDetails",
  addToShortlist: "addToShortlist",
  removeFromShortlist: "removeFromShortlist",
  showOnMap: "showOnMap",
  showRestaurantCard: "showRestaurantCard",
  highlightShortlistItem: "highlightShortlistItem",
} as const;
