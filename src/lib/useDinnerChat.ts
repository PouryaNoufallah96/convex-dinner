import { useChatMessages, type UIMessage } from "./useChatMessages";
import { useClientTools, type ClientToolHandlers } from "./useClientTools";

// Composed hook for chat messages and client tools
export function useDinnerChat(handlers: ClientToolHandlers = {}) {
  const { messages, threadId, isLoading, isStreaming } = useChatMessages();
  useClientTools(messages, handlers);

  return {
    messages,
    threadId,
    isLoading,
    isStreaming,
  };
}

// Re-export types for convenience
export type { UIMessage, ClientToolHandlers };
