import { generateImage } from "../utils/generateimage.js";

// ==================================================
// GENERATE IMAGE
// ==================================================

export const generateImageService = async (
  prompt
) => {
  const apiKey =
    process.env.CLIPDROP_API_KEY;

  if (!apiKey) {
    console.error(
      "CLIPDROP_API_KEY is missing."
    );

    const error = new Error(
      "Image generation service is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  console.log(
    "Image generation request received."
  );

  const imageUrl =
    await generateImage(
      prompt,
      apiKey
    );

  if (!imageUrl) {
    const error = new Error(
      "Image generation service returned no image."
    );

    error.statusCode = 503;

    throw error;
  }

  return imageUrl;
};