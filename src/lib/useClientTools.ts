import { useEffect, useRef } from "react";
import type { UIMessage } from "@convex-dev/agent/react";

// Client tool handlers interface
export interface ClientToolHandlers {
  onShowOnMap?: (params: {
    lat: number;
    lng: number;
    placeId: string;
    name: string;
    zoom?: number;
  }) => void;
  onHighlightShortlistItem?: (params: { placeId: string }) => void;
}

// Hook for processing client-side tool calls from messages
export function useClientTools(
  messages: UIMessage[],
  handlers: ClientToolHandlers,
) {
  // Track which tool calls we've already processed
  const processedToolCalls = useRef<Set<string>>(new Set());

  // Process tool calls from messages for client-side effects
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    messages.forEach((message: UIMessage) => {
      // Check each part for tool calls
      const parts = message.parts ?? [];
      parts.forEach((part: UIMessage["parts"][number]) => {
        if (part.type === "tool-call") {
          const toolCallId = "toolCallId" in part ? part.toolCallId : "";
          const toolCallKey = `${message.key}-${toolCallId}`;

          // Skip if already processed
          if (processedToolCalls.current.has(toolCallKey)) return;
          processedToolCalls.current.add(toolCallKey);

          // Handle client-side tools
          const toolName = "toolName" in part ? part.toolName : "";
          const args =
            "args" in part ? (part.args as Record<string, unknown>) : {};

          switch (toolName) {
            case "showOnMap":
              handlers.onShowOnMap?.({
                lat: args.lat as number,
                lng: args.lng as number,
                placeId: args.placeId as string,
                name: args.name as string,
                zoom: args.zoom as number | undefined,
              });
              break;
            case "highlightShortlistItem":
              handlers.onHighlightShortlistItem?.({
                placeId: args.placeId as string,
              });
              break;
          }
        }
      });
    });
  }, [messages, handlers]);
}
