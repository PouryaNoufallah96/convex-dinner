import { create } from "zustand";
import type { UIMessage } from "@convex-dev/agent/react";

interface ChatState {
  threadId: string | null | undefined;
  messages: UIMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  // Actions
  setThreadId: (threadId: string | null | undefined) => void;
  setMessages: (messages: UIMessage[]) => void;
  setStatus: (isLoading: boolean, isStreaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  threadId: undefined,
  messages: [],
  isLoading: true,
  isStreaming: false,

  setThreadId: (threadId) => set({ threadId }),
  setMessages: (messages) => set({ messages }),
  setStatus: (isLoading, isStreaming) => set({ isLoading, isStreaming }),
}));

// Selector hook for thread ID
export function useThreadId() {
  return useChatStore((s) => s.threadId);
}

// Selector hook for AI status
export function useAIStatus() {
  const isLoading = useChatStore((s) => s.isLoading);
  const isStreaming = useChatStore((s) => s.isStreaming);

  return {
    isLoading,
    isStreaming,
    isAiLoading: isLoading || isStreaming,
  };
}

// Selector hook for messages
export function useMessages() {
  return useChatStore((s) => s.messages);
}
