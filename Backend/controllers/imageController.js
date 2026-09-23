import {
  generateImageService,
} from "../services/imageService.js";

const MAX_PROMPT_LENGTH = 2000;

// ==================================================
// GENERATE IMAGE
// ==================================================

export const createImage = async (
  req,
  res
) => {
  const { prompt } = req.body;

  const trimmedPrompt =
    typeof prompt === "string"
      ? prompt.trim()
      : "";

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------

  if (!trimmedPrompt) {
    return res.status(400).json({
      error:
        "Image prompt is required.",
    });
  }

  if (
    trimmedPrompt.length >
    MAX_PROMPT_LENGTH
  ) {
    return res.status(400).json({
      error:
        "Image prompt is too long. Please keep it under 2,000 characters.",
    });
  }

  try {
    const imageUrl =
      await generateImageService(
        trimmedPrompt
      );

    return res.status(200).json({
      imageUrl,
    });
  } catch (error) {
    console.error(
      "Image generation error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      error:
        error.message ||
        "Image generation failed. Please try again.",
    });
  }
};