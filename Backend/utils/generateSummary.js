import "dotenv/config";

import { InferenceClient } from "@huggingface/inference";

const MODEL = "facebook/bart-large-cnn";

const hf = new InferenceClient(process.env.HF_TOKEN);

// ==================================================
// SUMMARY CONFIGURATION
// ==================================================

const SUMMARY_CONFIG = {
  short: {
    minLength: 35,
    maxLength: 80,
  },

  medium: {
    minLength: 80,
    maxLength: 150,
  },

  detailed: {
    minLength: 150,
    maxLength: 300,
  },
};

// ==================================================
// CREATE TEXT CHUNKS
// ==================================================

const createChunks = (text, maxChars = 4500) => {
  const words = text.split(/\s+/);
  const chunks = [];

  let currentChunk = "";

  for (const word of words) {
    const candidate = currentChunk
      ? `${currentChunk} ${word}`
      : word;

    if (candidate.length > maxChars) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }

      currentChunk = word;
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

// ==================================================
// SUMMARIZE ONE CHUNK
// ==================================================

const summarizeChunk = async (text, config) => {
  try {
    const result = await hf.summarization({
      model: MODEL,
      inputs: text,
      parameters: {
        min_length: config.minLength,
        max_length: config.maxLength,
        do_sample: false,
      },
    });

    if (!result?.summary_text) {
      throw new Error(
        "Hugging Face returned an empty summary."
      );
    }

    return result.summary_text.trim();
  } catch (error) {
    console.error(
      "Hugging Face request failed:"
    );

    console.error(
      "Message:",
      error?.message || "Unknown error"
    );

    console.error(
      "Status:",
      error?.status || error?.response?.status || "Unknown"
    );

    throw error;
  }
};

// ==================================================
// GENERATE SUMMARY
// ==================================================

export const generateSummary = async (
  text,
  length = "medium"
) => {
  try {
    // ------------------------------------------------
    // Validate Hugging Face token
    // ------------------------------------------------

    if (!process.env.HF_TOKEN) {
      throw new Error(
        "HF_TOKEN is missing from environment variables."
      );
    }

    // ------------------------------------------------
    // Validate input
    // ------------------------------------------------

    if (!text || !text.trim()) {
      throw new Error("Text is required.");
    }

    // ------------------------------------------------
    // Get summary configuration
    // ------------------------------------------------

    const config =
      SUMMARY_CONFIG[length] ||
      SUMMARY_CONFIG.medium;

    // ------------------------------------------------
    // Clean input
    // ------------------------------------------------

    const cleanText = text
      .trim()
      .replace(/\s+/g, " ");

    console.log(
      "Starting Hugging Face summarization..."
    );

    console.log(
      "Model:",
      MODEL
    );

    console.log(
      "Summary length:",
      length
    );

    console.log(
      "Input characters:",
      cleanText.length
    );

    // ------------------------------------------------
    // Split text into chunks
    // ------------------------------------------------

    const chunks = createChunks(cleanText);

    console.log(
      "Text chunks:",
      chunks.length
    );

    // ==================================================
    // NORMAL-SIZED TEXT
    // ==================================================

    if (chunks.length === 1) {
      const summary = await summarizeChunk(
        chunks[0],
        config
      );

      console.log(
        "Summary generated successfully."
      );

      return summary;
    }

    // ==================================================
    // LARGE TEXT
    // ==================================================

    const chunkSummaries = [];

    for (let i = 0; i < chunks.length; i++) {
      console.log(
        `Summarizing chunk ${i + 1}/${chunks.length}...`
      );

      const chunkSummary =
        await summarizeChunk(
          chunks[i],
          {
            minLength: Math.max(
              30,
              Math.floor(
                config.minLength / 2
              )
            ),

            maxLength: Math.max(
              60,
              Math.floor(
                config.maxLength / 2
              )
            ),
          }
        );

      chunkSummaries.push(
        chunkSummary
      );
    }

    // ==================================================
    // COMBINE CHUNK SUMMARIES
    // ==================================================

    const combinedSummary =
      chunkSummaries.join(" ");

    // ==================================================
    // FINAL SUMMARIZATION PASS
    // ==================================================

    if (combinedSummary.length <= 4500) {
      console.log(
        "Performing final summarization pass..."
      );

      const finalSummary =
        await summarizeChunk(
          combinedSummary,
          config
        );

      console.log(
        "Final summary generated successfully."
      );

      return finalSummary;
    }

    // ==================================================
    // FALLBACK
    // ==================================================

    console.log(
      "Combined summary is too large for another pass."
    );

    return combinedSummary;
  } catch (error) {
    console.error(
      "Hugging Face summarization error:",
      error?.message || error
    );

    throw new Error(
      error?.message ||
        "Hugging Face summarization failed."
    );
  }
};

export default generateSummary;