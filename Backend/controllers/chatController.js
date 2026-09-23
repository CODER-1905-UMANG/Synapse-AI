import {
  sendChatMessage,
} from "../services/chatService.js";

const MAX_CHAT_MESSAGE_LENGTH = 10000;

// ==================================================
// SEND CHAT MESSAGE
// ==================================================

export const sendChat = async (
  req,
  res
) => {
  const {
    threadId,
    message,
  } = req.body;

  const trimmedMessage =
    typeof message === "string"
      ? message.trim()
      : "";

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------

  if (
    !threadId ||
    !trimmedMessage
  ) {
    return res.status(400).json({
      error:
        "Thread ID and message are required.",
    });
  }

  if (
    trimmedMessage.length >
    MAX_CHAT_MESSAGE_LENGTH
  ) {
    return res.status(400).json({
      error:
        "Message is too long. Please keep it under 10,000 characters.",
    });
  }

  try {
    const assistantReply =
      await sendChatMessage(
        threadId,
        req.userId,
        trimmedMessage
      );

    return res.status(200).json({
      reply: assistantReply,
    });
  } catch (error) {
    console.error(
      "Chat error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      error:
        error.statusCode === 503
          ? error.message
          : "Something went wrong while processing your message.",
    });
  }
};