import { useCallback, useState } from "react";
import { useAction } from "convex/react";

import { api } from "../../convex/_generated/api";
import { useVisitorStore, useLocationStore, useThreadId } from "@/stores";

// Hook for managing chat input state and sending messages
export function useChatInput() {
  const [input, setInput] = useState("");
  const sendMessageAction = useAction(api.chat.sendMessage);

  // Get values from stores
  const threadId = useThreadId();
  const visitorName = useVisitorStore((s) => s.visitorName);
  const userLocation = useLocationStore((s) => s.userLocation);

  // Send message function (handles trimming internally)
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || !threadId || !visitorName) {
      return;
    }

    setInput("");

    await sendMessageAction({
      threadId,
      content: trimmed,
      senderName: visitorName,
      lat: userLocation.lat,
      lng: userLocation.lng,
    });
  }, [input, threadId, sendMessageAction, visitorName, userLocation]);

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

  return {
    input,
    setInput,
    handleSubmit,
    mentionsAi,
    canSend,
  };
}
