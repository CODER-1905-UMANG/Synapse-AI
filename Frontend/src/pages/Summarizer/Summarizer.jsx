import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  FileText,
  Zap,
  ShieldCheck,
  Languages,
  Target,
  Clock3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { summarizeText } from "../../services/summarizerService";

const STORAGE_KEY = "synapse-summarizer-state";

const DEFAULT_STATE = {
  input: "",
  output: "",
  summaryLength: "medium",
};

// ======================================================
// LOAD SAVED DATA BEFORE FIRST RENDER
// ======================================================

const getSavedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(saved);

    return {
      input:
        typeof parsed.input === "string"
          ? parsed.input
          : "",

      output:
        typeof parsed.output === "string"
          ? parsed.output
          : "",

      summaryLength:
        ["short", "medium", "detailed"].includes(
          parsed.summaryLength
        )
          ? parsed.summaryLength
          : "medium",
    };
  } catch (error) {
    console.error(
      "Failed to load saved summarizer data:",
      error
    );

    return DEFAULT_STATE;
  }
};

// ======================================================
// SAVE STATE
// ======================================================

const saveState = ({
  input,
  output,
  summaryLength,
}) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        input,
        output,
        summaryLength,
      })
    );
  } catch (error) {
    console.error(
      "Failed to save summarizer data:",
      error
    );
  }
};

// ======================================================
// OPTIONS
// ======================================================

const lengthOptions = [
  {
    id: "short",
    title: "Short",
    description: "Quick overview",
  },
  {
    id: "medium",
    title: "Medium",
    description: "Balanced summary",
  },
  {
    id: "detailed",
    title: "Detailed",
    description: "More context",
  },
];

// ======================================================
// FEATURES
// ======================================================

const features = [
  {
    icon: Zap,
    title: "Fast",
    description:
      "Turn long content into a clear summary in seconds.",
  },
  {
    icon: Target,
    title: "Focused",
    description:
      "Highlights the important ideas while reducing unnecessary detail.",
  },
  {
    icon: Languages,
    title: "Flexible",
    description:
      "Useful for articles, notes, documentation and study material.",
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    description:
      "Your API credentials stay on the backend instead of the browser.",
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description:
      "Summarize articles, technical content, notes and general text.",
  },
  {
    icon: Clock3,
    title: "Save Time",
    description:
      "Understand lengthy information without reading every sentence.",
  },
];

// ======================================================
// COMPONENT
// ======================================================

export default function Summarizer() {
  // IMPORTANT:
  // This loads localStorage during initialization.
  // There is NO restore useEffect anymore.

  const [savedState] = useState(() =>
    getSavedState()
  );

  const [input, setInput] = useState(
    savedState.input
  );

  const [output, setOutput] = useState(
    savedState.output
  );

  const [summaryLength, setSummaryLength] =
    useState(savedState.summaryLength);

  const [loading, setLoading] = useState(false);

  const [copied, setCopied] = useState(false);

  const [error, setError] = useState("");

  // ====================================================
  // INPUT WORD COUNT
  // ====================================================

  const inputWordCount = useMemo(() => {
    if (!input.trim()) {
      return 0;
    }

    return input.trim().split(/\s+/).length;
  }, [input]);

  // ====================================================
  // OUTPUT WORD COUNT
  // ====================================================

  const outputWordCount = useMemo(() => {
    if (!output.trim()) {
      return 0;
    }

    return output.trim().split(/\s+/).length;
  }, [output]);

  // ====================================================
  // HANDLE INPUT CHANGE
  // ====================================================

  const handleInputChange = (e) => {
    const newInput = e.target.value;

    setInput(newInput);

    setError("");

    // SAVE IMMEDIATELY
    saveState({
      input: newInput,
      output,
      summaryLength,
    });
  };

  // ====================================================
  // HANDLE SUMMARY LENGTH
  // ====================================================

  const handleLengthChange = (newLength) => {
    setSummaryLength(newLength);

    // SAVE IMMEDIATELY
    saveState({
      input,
      output,
      summaryLength: newLength,
    });
  };

  // ====================================================
  // GENERATE SUMMARY
  // ====================================================

  const handleSummarize = async () => {
    const cleanInput = input.trim();

    setError("");
    setCopied(false);

    if (!cleanInput) {
      setError(
        "Please enter some text to summarize."
      );

      return;
    }

    if (cleanInput.length < 50) {
      setError(
        "Please enter at least 50 characters of text."
      );

      return;
    }

    setLoading(true);

    try {
      // ------------------------------------------
      // Call service layer
      // ------------------------------------------

      const data = await summarizeText({
        text: cleanInput,
        length: summaryLength,
      });

      const generatedSummary =
        data.summary.trim();

      setOutput(generatedSummary);

      // SAVE GENERATED SUMMARY IMMEDIATELY
      saveState({
        input,
        output: generatedSummary,
        summaryLength,
      });
    } catch (err) {
      console.error(
        "Summarizer error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while generating the summary."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // COPY
  // ====================================================

  const handleCopy = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        output
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  // ====================================================
  // DOWNLOAD
  // ====================================================

  const handleDownload = () => {
    if (!output) {
      return;
    }

    const blob = new Blob(
      [output],
      {
        type: "text/plain;charset=utf-8",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "synapse-summary.txt";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ====================================================
  // CLEAR
  // ====================================================

  const handleClear = () => {
    setInput("");
    setOutput("");
    setSummaryLength("medium");

    setError("");
    setCopied(false);

    // DELETE PERSISTED DATA
    localStorage.removeItem(
      STORAGE_KEY
    );
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <div className="min-h-screen bg-black text-white">

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute left-[10%] top-[5%] h-96 w-96 rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="absolute right-[5%] top-[25%] h-96 w-96 rounded-full bg-indigo-600/10 blur-[140px]" />

        <div className="absolute bottom-[5%] left-[40%] h-80 w-80 rounded-full bg-fuchsia-600/5 blur-[130px]" />

      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <section className="mb-10 text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">

            <Sparkles size={16} />

            <span>
              Synapse AI Summarizer
            </span>

          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">

            Summarize{" "}

            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Anything
            </span>

          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
            Transform lengthy content into clear,
            concise and useful summaries with AI.
          </p>

        </section>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* MAIN GRID */}

        <section className="grid gap-6 lg:grid-cols-2">

          {/* INPUT */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  Your Text
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Paste or type the content you want to summarize.
                </p>

              </div>

              <FileText
                size={20}
                className="text-purple-400"
              />

            </div>

            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder="Paste your article, notes, documentation, research, or any other text here..."
              className="min-h-[320px] w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-4 text-sm leading-7 text-gray-200 outline-none transition placeholder:text-gray-600 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
            />

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">

              <span>
                {input.length.toLocaleString()}{" "}
                characters
              </span>

              <span>
                {inputWordCount.toLocaleString()}{" "}
                words
              </span>

            </div>

            {/* LENGTH */}

            <div className="mt-6">

              <p className="mb-3 text-sm font-medium text-gray-300">
                Summary length
              </p>

              <div className="grid grid-cols-3 gap-2">

                {lengthOptions.map(
                  (option) => {
                    const active =
                      summaryLength ===
                      option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          handleLengthChange(
                            option.id
                          )
                        }
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-purple-500/50 bg-purple-500/15 text-white"
                            : "border-white/10 bg-white/[0.02] text-gray-400 hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >

                        <div className="text-sm font-medium">
                          {option.title}
                        </div>

                        <div className="mt-1 text-[11px] text-gray-500">
                          {option.description}
                        </div>

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* GENERATE */}

            <button
              type="button"
              onClick={handleSummarize}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3.5 text-sm font-semibold shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <>
                  <RefreshCw
                    size={18}
                    className="animate-spin"
                  />

                  Generating Summary...
                </>
              ) : (
                <>
                  <Sparkles size={18} />

                  Generate Summary
                </>
              )}

            </button>

            {/* CLEAR */}

            {(input || output) &&
              !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
                >

                  <Trash2 size={16} />

                  Clear

                </button>
              )}

          </div>

          {/* OUTPUT */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl backdrop-blur-xl sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  AI Summary
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Your generated summary will appear here.
                </p>

              </div>

              <Sparkles
                size={20}
                className="text-purple-400"
              />

            </div>

            <div className="min-h-[320px] rounded-2xl border border-white/10 bg-black/40 p-5">

              {loading ? (

                <div className="flex h-[280px] flex-col items-center justify-center text-center">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10">

                    <Sparkles
                      size={25}
                      className="animate-pulse text-purple-400"
                    />

                  </div>

                  <p className="text-sm font-medium text-gray-300">
                    Creating your summary...
                  </p>

                  <p className="mt-2 max-w-xs text-xs leading-6 text-gray-600">
                    The AI is analyzing your content and extracting the most important points.
                  </p>

                </div>

              ) : output ? (

                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-300">
                  {output}
                </div>

              ) : (

                <div className="flex h-[280px] flex-col items-center justify-center text-center">

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">

                    <FileText
                      size={24}
                      className="text-gray-600"
                    />

                  </div>

                  <p className="text-sm font-medium text-gray-400">
                    No summary yet
                  </p>

                  <p className="mt-2 max-w-xs text-xs leading-6 text-gray-600">
                    Add some text on the left and click Generate Summary.
                  </p>

                </div>

              )}

            </div>

            {/* OUTPUT STATS */}

            {output && (
              <>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">

                  <span>
                    {output.length.toLocaleString()}{" "}
                    characters
                  </span>

                  <span>
                    {outputWordCount.toLocaleString()}{" "}
                    words
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
                  >

                    {copied ? (
                      <>
                        <Check
                          size={16}
                          className="text-green-400"
                        />

                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />

                        Copy
                      </>
                    )}

                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
                  >

                    <Download size={16} />

                    Download

                  </button>

                </div>

              </>
            )}

          </div>

        </section>

        {/* PERSISTENCE MESSAGE */}

        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-gray-600">

          <Check
            size={14}
            className="text-purple-400"
          />

          Your text and summary are automatically saved on this device.

        </div>

        {/* WHY USE */}

        <section className="mt-24">

          <div className="mb-10 text-center">

            <p className="mb-3 text-sm font-medium text-purple-400">
              WHY USE SYNAPSE?
            </p>

            <h2 className="text-3xl font-bold sm:text-4xl">
              Why Use this Summarizer?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500">
              Spend less time reading through lengthy content and more time understanding what actually matters.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {features.map(
              (feature) => {
                const Icon =
                  feature.icon;

                return (
                  <div
                    key={
                      feature.title
                    }
                    className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-purple-500/20 hover:bg-purple-500/[0.04]"
                  >

                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">

                      <Icon
                        size={20}
                        className="text-purple-400"
                      />

                    </div>

                    <h3 className="text-base font-semibold">
                      {feature.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {feature.description}
                    </p>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* SUPPORTED CONTENT */}

        <section className="mt-8 rounded-3xl border border-purple-500/10 bg-gradient-to-r from-purple-500/[0.06] to-indigo-500/[0.04] p-6 sm:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <h3 className="text-lg font-semibold">
                What can you summarize?
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Articles, study notes, technical documentation, research material, meeting notes, project descriptions and other text-based content.
              </p>

            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-gray-400">

              <Sparkles
                size={14}
                className="text-purple-400"
              />

              Powered by AI

            </div>

          </div>

        </section>

        {/* DISCLAIMER */}

        <p className="mx-auto mt-8 max-w-2xl text-center text-[11px] leading-5 text-gray-600">
          AI-generated summaries may occasionally omit context or contain inaccuracies. Always verify important information against the original source.
        </p>

      </main>

    </div>
  );
}