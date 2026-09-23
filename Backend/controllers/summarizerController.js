import {
  generateSummaryService,
} from "../services/summaryService.js";

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 50000;

const ALLOWED_LENGTHS = [
  "short",
  "medium",
  "detailed",
];

// ==================================================
// CREATE SUMMARY
// ==================================================

export const createSummary = async (
  req,
  res
) => {
  const text =
    typeof req.body?.text === "string"
      ? req.body.text.trim()
      : "";

  const length =
    typeof req.body?.length === "string"
      ? req.body.length
      : "medium";

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------

  if (!text) {
    return res.status(400).json({
      error: "Text is required.",
    });
  }

  if (
    text.length <
    MIN_TEXT_LENGTH
  ) {
    return res.status(400).json({
      error:
        "Please provide at least 50 characters of text to summarize.",
    });
  }

  if (
    text.length >
    MAX_TEXT_LENGTH
  ) {
    return res.status(400).json({
      error:
        "Text is too long. Please keep it under 50,000 characters.",
    });
  }

  if (
    !ALLOWED_LENGTHS.includes(length)
  ) {
    return res.status(400).json({
      error:
        "Invalid summary length. Use short, medium, or detailed.",
    });
  }

  // ------------------------------------------
  // GENERATE SUMMARY
  // ------------------------------------------

  try {
    const summary =
      await generateSummaryService(
        text,
        length
      );

    return res.status(200).json({
      summary,
      length,
    });
  } catch (error) {
    console.error(
      "Summarization error:",
      error.message
    );

    return res.status(
      error.statusCode || 503
    ).json({
      error:
        error.statusCode === 503
          ? error.message
          : "AI summarization service is temporarily unavailable. Please try again.",
    });
  }
};