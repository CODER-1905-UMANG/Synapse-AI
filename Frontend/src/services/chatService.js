import { apiRequest } from "./api";

/**
 * Fetch all chat threads for the logged-in user.
 */
export const fetchThreads = async () => {
  const response = await apiRequest("/api/thread", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch threads");
  }

  const threads = await response.json();

  return Array.isArray(threads) ? threads : [];
};

/**
 * Load all messages from a specific thread.
 */
export const loadThread = async (threadId) => {
  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  const response = await apiRequest(
    `/api/thread/${threadId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load conversation");
  }

  const messages = await response.json();

  return Array.isArray(messages) ? messages : [];
};

/**
 * Delete a specific chat thread.
 */
export const deleteThread = async (threadId) => {
  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  const response = await apiRequest(
    `/api/thread/${threadId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete thread");
  }

  return true;
};

/**
 * Send a chat message and receive the AI response.
 */
export const sendChatMessage = async (
  threadId,
  message
) => {
  if (!threadId) {
    throw new Error("Thread ID is required");
  }

  if (!message?.trim()) {
    throw new Error("Message is required");
  }

  const response = await apiRequest("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      threadId,
      message: message.trim(),
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to send message";

    try {
      const errorData = await response.json();

      if (errorData?.message) {
        errorMessage = errorData.message;
      }

      if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  return data;
};

/**
 * Send a message from Voice AI and receive the AI response.
 */
export const sendVoiceMessage = async (message) => {
  if (!message?.trim()) {
    throw new Error("Voice message is required");
  }

  const response = await apiRequest("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      threadId: "voice-thread",
      message: message.trim(),
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to get AI response.";

    try {
      const errorData = await response.json();

      errorMessage =
        errorData?.error ||
        errorData?.message ||
        errorMessage;
    } catch {
      // Keep default error message
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (!data?.reply) {
    throw new Error("AI returned an empty response.");
  }

  return data;
};