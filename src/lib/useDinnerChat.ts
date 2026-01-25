import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useUIMessages } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";

import { api } from "../../convex/_generated/api";

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

// Hook for the multi-user dinner chat
// All message state comes from Convex subscription - no local React state for messages
export function useDinnerChat(
  senderName: string,
  userLocation: UserLocation,
  handlers: ClientToolHandlers = {},
) {
  // Input state for the chat
  const [input, setInput] = useState("");

  // Get or create the shared thread
  const threadId = useQuery(api.chat.getThread);
  const createThread = useMutation(api.chat.getOrCreateThread);
  const sendMessageAction = useAction(api.chat.sendMessage);

  // Create thread if it doesn't exist
  useEffect(() => {
    if (threadId === null) {
      createThread();
    }
  }, [threadId, createThread]);

  // Subscribe to messages via useUIMessages
  // This is the reactive subscription - all clients see the same messages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesResult = useUIMessages(
    api.chat.listAllMessages,
    threadId ? { threadId } : ("skip" as any),
    { initialNumItems: 100, stream: true },
  );

  const messages = messagesResult?.results ?? [];
  const status = messagesResult?.status;

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
            case "showRestaurantCard":
              handlers.onShowRestaurantCard?.({
                placeId: args.placeId as string,
                name: args.name as string,
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

  // Send message function (handles trimming internally)
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !threadId) {
      return;
    }

    setInput("");

    await sendMessageAction({
      threadId,
      content: trimmed,
      senderName,
      lat: userLocation.lat,
      lng: userLocation.lng,
    });
  }, [input, threadId, sendMessageAction, senderName, userLocation]);

  // Form submit handler
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage();
    },
    [sendMessage],
  );

  // Computed values for input state
  const mentionsAi =
    input.toLowerCase().includes("@ai") ||
    input.toLowerCase().startsWith("ai ");

  const canSend = input.trim().length > 0;

  // Determine if we're currently loading/streaming
  const isLoading = status === "LoadingMore" || !messagesResult;
  const isStreaming =
    messages.some((m: UIMessage) => m.status === "streaming") ?? false;

  return {
    // Messages
    messages,
    isLoading,
    isStreaming,
    threadId,
    // Input state
    input,
    setInput,
    handleSubmit,
    mentionsAi,
    canSend,
  };
}

// Export the UIMessage type for use in components
export type { UIMessage };
