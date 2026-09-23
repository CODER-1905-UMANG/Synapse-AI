import fetch from "node-fetch";

export async function generateImage(
  prompt,
  apiKey
) {
  if (!prompt || !prompt.trim()) {
    throw new Error(
      "Prompt is required."
    );
  }

  if (!apiKey) {
    throw new Error(
      "Image generation API key is not configured."
    );
  }

  try {
    const response = await fetch(
      "https://clipdrop-api.co/text-to-image/v1",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          "x-api-key": apiKey,
        },

        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      }
    );

    if (!response.ok) {
      const errorText =
        await response.text();

      console.error(
        "Clipdrop API error:",
        response.status,
        errorText
      );

      throw new Error(
        `Image provider returned ${response.status}.`
      );
    }

    const buffer =
      await response.arrayBuffer();

    if (!buffer || buffer.byteLength === 0) {
      throw new Error(
        "Image provider returned an empty response."
      );
    }

    const base64Image =
      Buffer.from(buffer).toString(
        "base64"
      );

    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error(
      "generateImage error:",
      error
    );

    throw error;
  }
}