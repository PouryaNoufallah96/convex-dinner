import { useCallback, useState } from "react";
import { useAction } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { UserLocation } from "@/lib/location";

// Hook for managing chat input state and sending messages
export function useChatInput(
  threadId: string | null | undefined,
  senderName: string,
  userLocation: UserLocation,
) {
  const [input, setInput] = useState("");
  const sendMessageAction = useAction(api.chat.sendMessage);

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

  return {
    input,
    setInput,
    handleSubmit,
    mentionsAi,
    canSend,
  };
}
