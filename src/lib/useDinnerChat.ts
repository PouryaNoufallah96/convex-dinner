import { useMemo } from "react";
import { useChatMessages } from "./useChatMessages";
import { useClientTools } from "./useClientTools";
import { useMapStore, useChatStore } from "@/stores";

// Composed hook that sets up chat subscription and client tools
export function useDinnerChat() {
  // Sync messages from Convex to store
  useChatMessages();

  // Get messages from store for client tools
  const messages = useChatStore((s) => s.messages);

  // Get stable references to map store actions
  const panTo = useMapStore((s) => s.panTo);
  const highlightPlace = useMapStore((s) => s.highlightPlace);

  // Create stable handlers object
  const handlers = useMemo(
    () => ({
      onShowOnMap: ({
        lat,
        lng,
        placeId,
        name,
        zoom,
      }: {
        lat: number;
        lng: number;
        placeId: string;
        name: string;
        zoom?: number;
      }) => {
        panTo({ lat, lng, name: name || "Restaurant" }, zoom || 15);
        highlightPlace(placeId);
      },
      onHighlightShortlistItem: ({ placeId }: { placeId: string }) => {
        highlightPlace(placeId);
      },
    }),
    [panTo, highlightPlace],
  );

  useClientTools(messages, handlers);
}
