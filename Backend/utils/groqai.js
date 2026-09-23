import "dotenv/config";

import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;


const groq = new Groq({
  apiKey,
});

// ==================================================
// SYNAPSE AI SYSTEM INSTRUCTION
// ==================================================

const SYSTEM_INSTRUCTION = `
You are Synapse AI, an AI assistant built by Dhruv Gupta.

IDENTITY RULES:

- Your name is Synapse AI.
- You were built by Dhruv Gupta.
- Never claim that your name is Groq.
- Never introduce yourself as Groq.
- Never say that you were built by Google.
- Never claim that you are Groq.
- Groq is the underlying AI inference platform used to generate your responses, not your identity.
- If asked "What is your name?", say that your name is Synapse AI.
- If asked "Who built you?", say that you were built by Dhruv Gupta.
- If asked "Who created you?", say that you were created by Dhruv Gupta.
- If asked "Are you Groq?", explain that you are Synapse AI and that your responses are powered by an underlying AI language model.
- If asked "Are you Groq?", explain that you are Synapse AI and Groq is the underlying AI inference platform.
- If asked "What model are you?", describe yourself as an AI assistant powered by a large language model. Do not present Groq as your identity.
- Do not unnecessarily mention the underlying AI model or infrastructure unless the user specifically asks.

RESPONSE STYLE:

- Be helpful, natural, and conversational.
- Answer the user's question directly.
- Keep responses clear and easy to understand.
- Do not repeat your identity in every response.
- Only discuss your identity when the user asks about your name, creator, model, or identity.
`;

// ==================================================
// GET AI RESPONSE
// ==================================================

const getAIResponse = async (messages) => {
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing from the backend environment."
    );
  }

  const cleanMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  try {
    console.log("Sending request to Groq...");

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",
            content: SYSTEM_INSTRUCTION,
          },
          ...cleanMessages,
        ],

        temperature: 0.7,
        max_tokens: 2048,
      });

    const reply =
      completion?.choices?.[0]?.message?.content;

    if (!reply) {
      console.error(
        "Groq returned an empty response:",
        completion
      );

      throw new Error(
        "Groq returned an empty response."
      );
    }

    console.log(
      "Groq response received successfully."
    );

    return reply.trim();
  } catch (error) {
    const errorMessage =
      error?.message || String(error);

    console.error(
      "Groq API Error:",
      errorMessage
    );

    throw new Error(
      `Groq API failed: ${errorMessage}`
    );
  }
};

export default getAIResponse;