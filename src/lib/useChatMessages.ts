import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUIMessages } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";

import { api } from "../../convex/_generated/api";

// Hook for managing chat thread and message subscription
export function useChatMessages() {
  // Get or create the shared thread
  const threadId = useQuery(api.chat.getThread);
  const createThread = useMutation(api.chat.getOrCreateThread);

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

  // Determine if we're currently loading/streaming
  const isLoading = status === "LoadingMore" || !messagesResult;
  const isStreaming =
    messages.some((m: UIMessage) => m.status === "streaming") ?? false;

  return {
    messages,
    threadId,
    isLoading,
    isStreaming,
  };
}

// Export the UIMessage type for use in components
export type { UIMessage };
