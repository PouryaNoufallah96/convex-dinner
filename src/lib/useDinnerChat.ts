import { useChatMessages, type UIMessage } from "./useChatMessages";
import { useClientTools } from "./useClientTools";
import { useMapStore } from "@/stores";

// Composed hook for chat messages and client tools
export function useDinnerChat() {
  const { messages, threadId, isLoading, isStreaming } = useChatMessages();

  // Use map store actions for client tool handlers
  const { panTo, highlightPlace } = useMapStore();

  useClientTools(messages, {
    onShowOnMap: ({ lat, lng, placeId, name, zoom }) => {
      panTo({ lat, lng, name: name || "Restaurant" }, zoom || 15);
      highlightPlace(placeId);
    },
    onShowRestaurantCard: ({ placeId }) => {
      highlightPlace(placeId);
    },
    onHighlightShortlistItem: ({ placeId }) => {
      highlightPlace(placeId);
    },
  });

  return {
    messages,
    threadId,
    isLoading,
    isStreaming,
  };
}

// Re-export types for convenience
export type { UIMessage };
