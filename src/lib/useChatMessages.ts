import { useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUIMessages } from "@convex-dev/agent/react";
import type { UIMessage } from "@convex-dev/agent/react";

import { api } from "../../convex/_generated/api";
import { useChatStore } from "@/stores";

// Hook that syncs chat messages from Convex to the store
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

  // Sync threadId to store (use getState to avoid re-render loops)
  const prevThreadIdRef = useRef(threadId);
  useEffect(() => {
    if (prevThreadIdRef.current !== threadId) {
      prevThreadIdRef.current = threadId;
      useChatStore.getState().setThreadId(threadId);
    }
  }, [threadId]);

  // Subscribe to messages via useUIMessages
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messagesResult = useUIMessages(
    api.chat.listAllMessages,
    threadId ? { threadId } : ("skip" as any),
    { initialNumItems: 100, stream: true },
  );

  const messages = messagesResult?.results ?? [];
  const status = messagesResult?.status;

  // Track previous values to avoid unnecessary updates
  const prevMessagesLengthRef = useRef(0);
  const prevStatusRef = useRef<string | undefined>(undefined);

  // Sync messages and status to store
  useEffect(() => {
    const store = useChatStore.getState();

    // Only update messages if length changed (simple check)
    // For streaming, we also check the last message status
    const lastMessage = messages[messages.length - 1];
    const lastMessageStatus = lastMessage?.status;
    const messagesChanged =
      messages.length !== prevMessagesLengthRef.current ||
      lastMessageStatus === "streaming";

    if (messagesChanged) {
      prevMessagesLengthRef.current = messages.length;
      store.setMessages(messages);
    }

    // Update status
    const isLoading = status === "LoadingMore" || !messagesResult;
    const isStreaming =
      messages.some((m: UIMessage) => m.status === "streaming") ?? false;

    if (status !== prevStatusRef.current || messagesChanged) {
      prevStatusRef.current = status;
      store.setStatus(isLoading, isStreaming);
    }
  }, [messages, status, messagesResult]);
}

// Export the UIMessage type for use in components
export type { UIMessage };
