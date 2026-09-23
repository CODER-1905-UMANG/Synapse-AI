import Thread from "../models/Thread.js";

import getAIResponse from "../utils/groqai.js";

// ==================================================
// SEND CHAT MESSAGE
// ==================================================

export const sendChatMessage = async (
  threadId,
  userId,
  message
) => {
  // ------------------------------------------
  // FIND EXISTING THREAD
  // ------------------------------------------

  let thread = await Thread.findOne({
    threadId,
    userId,
  });

  // ------------------------------------------
  // CREATE NEW THREAD
  // ------------------------------------------

  if (!thread) {
    thread = new Thread({
      threadId,
      userId,
      title: message,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });
  }

  // ------------------------------------------
  // EXISTING THREAD
  // ------------------------------------------

  else {
    thread.messages.push({
      role: "user",
      content: message,
    });
  }

  // ------------------------------------------
  // GET AI RESPONSE
  // ------------------------------------------

  const assistantReply =
    await getAIResponse(
      thread.messages
    );

  if (
    !assistantReply ||
    typeof assistantReply !== "string"
  ) {
    const error = new Error(
      "AI service returned an empty response."
    );

    error.statusCode = 503;

    throw error;
  }

  // ------------------------------------------
  // SAVE AI RESPONSE
  // ------------------------------------------

  thread.messages.push({
    role: "assistant",
    content: assistantReply,
  });

  thread.updatedAt = new Date();

  await thread.save();

  return assistantReply;
};