import { apiRequest } from "./api";

/**
 * Generate an AI summary from source text.
 */
export const summarizeText = async ({
  text,
  length,
}) => {
  if (!text?.trim()) {
    throw new Error("Text is required");
  }

  const response = await apiRequest("/api/ai-summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text.trim(),
      length,
    }),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Unable to generate summary."
    );
  }

  if (
    !data?.summary ||
    typeof data.summary !== "string"
  ) {
    throw new Error(
      "The summarization service returned an invalid response."
    );
  }

  return data;
};