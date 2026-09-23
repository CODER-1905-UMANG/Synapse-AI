import { apiRequest } from "./api";

/**
 * Generate an AI image from a prompt.
 */
export const generateImage = async (prompt) => {
  if (!prompt?.trim()) {
    throw new Error("Image prompt is required");
  }

  const response = await apiRequest("/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
    }),
  });

  if (!response.ok) {
    let errorMessage = "Failed to generate image";

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

  return await response.json();
};