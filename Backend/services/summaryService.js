import { generateSummary } from "../utils/generateSummary.js";

// ==================================================
// GENERATE SUMMARY
// ==================================================

export const generateSummaryService = async (
  text,
  length
) => {
  console.log(
    `Starting AI summarization (${length})...`
  );

  const summary =
    await generateSummary(
      text,
      length
    );

  if (
    !summary ||
    typeof summary !== "string"
  ) {
    const error = new Error(
      "AI summarization service returned an empty response."
    );

    error.statusCode = 503;

    throw error;
  }

  console.log(
    "Summary generated successfully."
  );

  return summary;
};