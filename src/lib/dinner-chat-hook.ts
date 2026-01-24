import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from "@tanstack/ai-react";
import type { InferChatMessages } from "@tanstack/ai-react";
import { clientTools } from "@tanstack/ai-client";

import {
  showOnMapToolDef,
  showRestaurantCardToolDef,
  highlightShortlistItemToolDef,
} from "@/lib/dinner-tools";
import type { UserLocation } from "@/lib/location";

// Client tool handlers interface
export interface ClientToolHandlers {
  onShowOnMap?: (params: {
    lat: number;
    lng: number;
    placeId: string;
    name: string;
    zoom?: number;
  }) => void;
  onShowRestaurantCard?: (params: { placeId: string; name: string }) => void;
  onHighlightShortlistItem?: (params: { placeId: string }) => void;
}

// Create client tool implementations
function createClientTools(handlers: ClientToolHandlers) {
  const showOnMapClient = showOnMapToolDef.client((params) => {
    handlers.onShowOnMap?.(params);
    return { shown: true, name: params.name };
  });

  const showRestaurantCardClient = showRestaurantCardToolDef.client(
    (params) => {
      handlers.onShowRestaurantCard?.(params);
      return { shown: true };
    },
  );

  const highlightShortlistItemClient = highlightShortlistItemToolDef.client(
    (params) => {
      handlers.onHighlightShortlistItem?.(params);
      return { highlighted: true };
    },
  );

  return clientTools(
    showOnMapClient,
    showRestaurantCardClient,
    highlightShortlistItemClient,
  );
}

// Create chat options with context
export function createDinnerChatOptions(
  senderName: string,
  userLocation: UserLocation,
  handlers: ClientToolHandlers = {},
) {
  const tools = createClientTools(handlers);

  return createChatClientOptions({
    connection: fetchServerSentEvents("/api/chat", {
      body: {
        senderName,
        userLocation,
      },
    }),
    tools,
  });
}

// Type for chat messages
export type DinnerChatOptions = ReturnType<typeof createDinnerChatOptions>;
export type DinnerChatMessages = InferChatMessages<DinnerChatOptions>;

// Hook wrapper for convenience
export function useDinnerChat(
  senderName: string,
  userLocation: UserLocation,
  handlers: ClientToolHandlers = {},
) {
  const options = createDinnerChatOptions(senderName, userLocation, handlers);
  return useChat(options);
}
