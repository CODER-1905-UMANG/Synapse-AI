import { useEffect, useRef, useState } from "react";
import Footer from "../../components/common/Footer";
import { generateImage } from "../../services/imageService";

const styles = [
  {
    name: "Photorealistic",
    image:
      "https://images.deepai.org/machine-learning-models/d4b1dd3ee43648a997650dc7f9e6923f/panda.jpeg",
    prompt: "photorealistic, highly detailed, realistic lighting",
  },
  {
    name: "Cyberpunk",
    image:
      "https://images.deepai.org/machine-learning-models/b6dcce965af54c26918924813f3cd288/cyborg.jpg",
    prompt: "cyberpunk, futuristic, neon lighting, cinematic atmosphere",
  },
  {
    name: "Anime",
    image:
      "https://images.deepai.org/machine-learning-models/af4d384431974ab5bfda622a20a27695/anime_fairy.jpg",
    prompt: "anime art style, vibrant colors, detailed illustration",
  },
  {
    name: "Fantasy",
    image:
      "https://images.deepai.org/machine-learning-models/74d5de30d7344fa2b1455dc4b89e10cb/prince.jpg",
    prompt: "fantasy art, magical atmosphere, cinematic details",
  },
];

const sizes = [
  {
    label: "Small",
    value: "256x256",
  },
  {
    label: "Medium",
    value: "512x512",
  },
  {
    label: "Large",
    value: "1024x1024",
  },
];

const IMAGIFY_STORAGE_KEY = "synapse-imagify-state";
const IMAGIFY_PREVIEW_KEY = "synapse-imagify-preview";

const getSavedImagifyState = () => {
  try {
    const saved = localStorage.getItem(IMAGIFY_STORAGE_KEY);

    if (!saved) {
      return {
        prompt: "",
        selectedStyleName: null,
        size: "512x512",
      };
    }

    const parsed = JSON.parse(saved);

    return {
      prompt:
        typeof parsed.prompt === "string"
          ? parsed.prompt
          : "",
      selectedStyleName:
        typeof parsed.selectedStyleName === "string"
          ? parsed.selectedStyleName
          : null,
      size: ["256x256", "512x512", "1024x1024"].includes(
        parsed.size
      )
        ? parsed.size
        : "512x512",
    };
  } catch (error) {
    console.error("Failed to restore Imagify state:", error);

    return {
      prompt: "",
      selectedStyleName: null,
      size: "512x512",
    };
  }
};

const saveImagifyState = ({
  prompt,
  selectedStyleName,
  size,
}) => {
  try {
    localStorage.setItem(
      IMAGIFY_STORAGE_KEY,
      JSON.stringify({
        prompt,
        selectedStyleName,
        size,
      })
    );
  } catch (error) {
    console.error("Failed to save Imagify state:", error);
  }
};

const getSavedPreview = () => {
  try {
    return sessionStorage.getItem(IMAGIFY_PREVIEW_KEY);
  } catch (error) {
    console.error("Failed to restore Imagify preview:", error);
    return null;
  }
};

const savePreview = (preview) => {
  try {
    if (preview) {
      sessionStorage.setItem(IMAGIFY_PREVIEW_KEY, preview);
    } else {
      sessionStorage.removeItem(IMAGIFY_PREVIEW_KEY);
    }
  } catch (error) {
    console.warn(
      "Could not persist generated image preview:",
      error
    );
  }
};

const ImagifyHome = () => {
  const [savedState] = useState(() =>
    getSavedImagifyState()
  );

  const [prompt, setPrompt] = useState(
    savedState.prompt
  );

  const [selectedStyle, setSelectedStyle] =
    useState(() =>
      styles.find(
        (style) =>
          style.name === savedState.selectedStyleName
      ) || null
    );

  const [size, setSize] = useState(
    savedState.size
  );

  const [loading, setLoading] =
    useState(false);

  const [preview, setPreview] =
    useState(() => getSavedPreview());

  const [error, setError] =
    useState("");

  const [progress, setProgress] =
    useState(0);

  const progressIntervalRef =
    useRef(null);

  // ==================================================
  // CLEANUP PROGRESS TIMER
  // ==================================================

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(
          progressIntervalRef.current
        );
      }
    };
  }, []);

  // ==================================================
  // GENERATE IMAGE
  // ==================================================

  const handleGenerate = async () => {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError(
        "Please describe the image you want to create."
      );
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please log in before generating an image."
      );
      return;
    }

    setLoading(true);
    setError("");
    setPreview(null);
    setProgress(5);

    // ------------------------------------------
    // Simulated progress
    // ------------------------------------------

    if (progressIntervalRef.current) {
      clearInterval(
        progressIntervalRef.current
      );
    }

    progressIntervalRef.current =
      setInterval(() => {
        setProgress((previous) => {
          if (previous >= 90) {
            return previous;
          }

          const increment =
            Math.random() * 5;

          return Math.min(
            previous + increment,
            90
          );
        });
      }, 350);

    try {
      // ------------------------------------------
      // Add selected style to prompt
      // ------------------------------------------

      const finalPrompt =
        selectedStyle
          ? `${cleanPrompt}, ${selectedStyle.prompt}`
          : cleanPrompt;

      // ------------------------------------------
      // Generate image through service layer
      // ------------------------------------------

      const data = await generateImage(finalPrompt);

      // ------------------------------------------
      // Complete progress
      // ------------------------------------------

      if (progressIntervalRef.current) {
        clearInterval(
          progressIntervalRef.current
        );

        progressIntervalRef.current = null;
      }

      setProgress(100);

      // ------------------------------------------
      // Show generated image
      // ------------------------------------------

      setPreview(data.imageUrl);
      savePreview(data.imageUrl);
    } catch (err) {
      console.error(
        "Image generation error:",
        err
      );

      if (
        progressIntervalRef.current
      ) {
        clearInterval(
          progressIntervalRef.current
        );

        progressIntervalRef.current =
          null;
      }

      setError(
        err?.message ||
          "Image generation failed. Please try again."
      );

      setPreview(null);
      savePreview(null);
    } finally {
      setLoading(false);

      setTimeout(() => {
        setProgress(0);
      }, 700);
    }
  };

  // ==================================================
  // DOWNLOAD
  // ==================================================

  const handleDownload = async () => {
    if (!preview) return;

    try {
      // Base64 images can be downloaded directly.
      if (preview.startsWith("data:")) {
        const link =
          document.createElement("a");

        link.href = preview;
        link.download =
          "synapse-ai-generated-image.png";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        return;
      }

      // Fallback for normal URLs
      const response = await fetch(
        preview
      );

      if (!response.ok) {
        throw new Error(
          "Unable to download image."
        );
      }

      const blob =
        await response.blob();

      const blobUrl =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = blobUrl;
      link.download =
        "synapse-ai-generated-image.png";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(
        "Download error:",
        err
      );

      setError(
        "Unable to download the image. You can right-click the image and save it instead."
      );
    }
  };

  // ==================================================
  // REGENERATE
  // ==================================================

  const handleRegenerate = () => {
    if (!loading) {
      handleGenerate();
    }
  };

  // ==================================================
  // STYLE
  // ==================================================

  const handleStyleClick = (style) => {
    const nextStyle =
      selectedStyle?.name === style.name
        ? null
        : style;

    setSelectedStyle(nextStyle);

    setPreview(null);
    savePreview(null);
    setError("");

    saveImagifyState({
      prompt,
      selectedStyleName:
        nextStyle?.name || null,
      size,
    });
  };

  // ==================================================
  // PROMPT
  // ==================================================

  const handlePromptChange = (event) => {
    const nextPrompt = event.target.value;

    setPrompt(nextPrompt);

    setPreview(null);
    savePreview(null);
    setError("");

    saveImagifyState({
      prompt: nextPrompt,
      selectedStyleName:
        selectedStyle?.name || null,
      size,
    });
  };

  // ==================================================
  // ENTER TO GENERATE
  // ==================================================

  const handlePromptKeyDown = (
    event
  ) => {
    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      event.preventDefault();

      handleGenerate();
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-black text-white">

      <main className="min-h-screen px-4 pb-16 pt-10 sm:px-6 lg:px-8">

        {/* ==========================================
            HEADER
        ========================================== */}

        <section className="mx-auto mb-10 max-w-6xl text-center">

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)]">

            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500/30" />

          </div>

          <h1 className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">

            Create with{" "}

            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Imagify
            </span>

          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Turn your ideas into stunning
            visuals. Describe what you
            imagine and let Imagify bring it
            to life.
          </p>

        </section>

        {/* ==========================================
            MAIN CARD
        ========================================== */}

        <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] shadow-2xl shadow-black/40 lg:grid-cols-[380px_1fr]">

          {/* ========================================
              LEFT PANEL
          ======================================== */}

          <div className="border-b border-white/[0.08] p-5 sm:p-7 lg:border-b-0 lg:border-r">

            <div className="mb-6">

              <h2 className="text-lg font-semibold text-white">
                Create an image
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Describe the image you
                want to generate.
              </p>

            </div>

            {/* Prompt */}

            <div className="mb-6">

              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm font-medium text-gray-300">
                  Prompt
                </label>

                <span className="text-[11px] text-gray-600">
                  Ctrl + Enter
                </span>

              </div>

              <textarea
                value={prompt}
                onChange={
                  handlePromptChange
                }
                onKeyDown={
                  handlePromptKeyDown
                }
                placeholder="A futuristic city at night with neon lights..."
                rows={5}
                disabled={loading}
                maxLength={1000}
                className="w-full resize-none rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-400/30 focus:bg-white/[0.035] disabled:cursor-not-allowed disabled:opacity-50"
              />

              <div className="mt-2 flex justify-end">

                <span className="text-[11px] text-gray-600">
                  {prompt.length}/1000
                </span>

              </div>

            </div>

            {/* Generate */}

            <button
              type="button"
              onClick={
                handleGenerate
              }
              disabled={
                loading ||
                !prompt.trim()
              }
              className="mb-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >

              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Generating...
                </>
              ) : (
                <>
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
                    <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
                  </svg>

                  Generate Image
                </>
              )}

            </button>

            {/* ======================================
                STYLE
            ====================================== */}

            <div className="mb-7">

              <div className="mb-3">

                <p className="text-sm font-medium text-gray-300">
                  Style
                </p>

                <p className="mt-1 text-[11px] text-gray-600">
                  Choose a visual direction
                  for your image.
                </p>

              </div>

              <div className="grid grid-cols-2 gap-2.5">

                {styles.map((item) => {

                  const selected =
                    selectedStyle?.name ===
                    item.name;

                  return (
                    <button
                      type="button"
                      key={item.name}
                      onClick={() =>
                        handleStyleClick(
                          item
                        )
                      }
                      disabled={loading}
                      className={`group relative overflow-hidden rounded-xl border text-left transition ${
                        selected
                          ? "border-indigo-400/70 ring-1 ring-indigo-400/30"
                          : "border-white/[0.08] hover:border-white/20"
                      }`}
                    >

                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-20 w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <span className="absolute bottom-2 left-2 text-xs font-medium text-white">
                        {item.name}
                      </span>

                      {selected && (
                        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white">

                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M5 12l4 4L19 6" />
                          </svg>

                        </span>
                      )}

                    </button>
                  );
                })}

              </div>

            </div>

            {/* ======================================
                SIZE
            ====================================== */}

            <div>

              <p className="mb-3 text-sm font-medium text-gray-300">
                Preview size
              </p>

              <div className="grid grid-cols-3 gap-2">

                {sizes.map((item) => {

                  const selected =
                    size === item.value;

                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => {
                        setSize(item.value);

                        saveImagifyState({
                          prompt,
                          selectedStyleName:
                            selectedStyle?.name || null,
                          size: item.value,
                        });
                      }}
                      disabled={loading}
                      className={`rounded-xl border py-2.5 text-xs transition ${
                        selected
                          ? "border-indigo-400/50 bg-indigo-500/15 text-indigo-300"
                          : "border-white/[0.08] bg-white/[0.025] text-gray-500 hover:border-white/20 hover:text-gray-300"
                      }`}
                    >

                      {item.label}

                      <span className="mt-0.5 block text-[10px] opacity-60">
                        {item.value}
                      </span>

                    </button>
                  );
                })}

              </div>

              <p className="mt-2 text-[10px] leading-4 text-gray-600">
                Preview size controls how the
                generated image is displayed.
              </p>

            </div>

          </div>

          {/* ========================================
              RIGHT PREVIEW
          ======================================== */}

          <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-[#050505] p-5 sm:min-h-[600px] sm:p-8">

            {/* Glow */}

            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

            {/* Progress */}

            {loading && (
              <div className="absolute left-5 right-5 top-5 z-20 sm:left-8 sm:right-8">

                <div className="mb-2 flex items-center justify-between text-[11px]">

                  <span className="text-gray-500">
                    Creating your image...
                  </span>

                  <span className="text-indigo-400">
                    {Math.floor(
                      progress
                    )}
                    %
                  </span>

                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{
                      width: `${Math.floor(
                        progress
                      )}%`,
                    }}
                  />

                </div>

              </div>
            )}

            {/* ======================================
                LOADING
            ====================================== */}

            {loading ? (
              <div className="relative z-10 flex flex-col items-center text-center">

                <div className="relative mb-6 flex h-24 w-24 items-center justify-center">

                  <div className="absolute inset-0 animate-ping rounded-3xl bg-indigo-500/10" />

                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20">

                    <div className="h-8 w-8 animate-pulse rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500" />

                  </div>

                </div>

                <h3 className="text-lg font-medium text-white">
                  Creating your image
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  Turning your prompt into
                  something visual...
                </p>

              </div>
            ) : error ? (

              /* ====================================
                 ERROR
              ==================================== */

              <div className="relative z-10 max-w-md text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">

                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path d="M12 8v4" />

                    <path d="M12 16h.01" />
                  </svg>

                </div>

                <h3 className="text-lg font-medium text-white">
                  Generation failed
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    handleGenerate
                  }
                  className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-white/[0.08]"
                >
                  Try again
                </button>

              </div>
            ) : preview ? (

              /* ====================================
                 IMAGE
              ==================================== */

              <div className="relative z-10 flex w-full flex-col items-center">

                <div className="group relative max-w-full overflow-hidden rounded-2xl border border-white/[0.1] bg-black shadow-2xl shadow-black/50">

                  <img
                    src={preview}
                    alt={
                      prompt ||
                      "Generated image"
                    }
                    className="block max-h-[65vh] max-w-full object-contain"
                    style={{
                      width:
                        size ===
                        "256x256"
                          ? "256px"
                          : size ===
                            "512x512"
                          ? "512px"
                          : "min(1024px, 100%)",
                      height:
                        "auto",
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                </div>

                {/* Actions */}

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handleDownload
                    }
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-purple-500"
                  >

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 3v12" />
                      <path d="M7 10l5 5 5-5" />
                      <path d="M5 21h14" />
                    </svg>

                    Download
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleRegenerate
                    }
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-white/[0.08] hover:text-white"
                  >

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 11a8.1 8.1 0 0 0-15.5-2" />
                      <path d="M4 5v4h4" />
                      <path d="M4 13a8.1 8.1 0 0 0 15.5 2" />
                      <path d="M20 19v-4h-4" />
                    </svg>

                    Regenerate
                  </button>

                </div>

              </div>

            ) : (

              /* ====================================
                 EMPTY
              ==================================== */

              <div className="relative z-10 text-center">

                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.025]">

                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    className="text-gray-600"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="3"
                    />

                    <circle
                      cx="8.5"
                      cy="8.5"
                      r="1.5"
                    />

                    <path d="M21 15l-5-5L5 21" />
                  </svg>

                </div>

                <h3 className="text-lg font-medium text-gray-300">
                  Your creation will appear
                  here
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600">
                  Enter a prompt on the
                  left and generate your
                  first image.
                </p>

              </div>
            )}

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
};

export default ImagifyHome;