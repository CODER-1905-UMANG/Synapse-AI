import React, { useState } from "react";

const PlusMenu = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action) => {
    setIsOpen(false);

    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="relative">
      {/* Plus Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          isOpen
            ? "bg-indigo-500/15 text-indigo-400"
            : "text-gray-500 hover:bg-white/[0.06] hover:text-white"
        }`}
        aria-label="Open AI tools"
        aria-expanded={isOpen}
      >
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </button>

      {/* Menu */}
      {isOpen && (
        <>
          {/* Click outside */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />

          <div className="absolute bottom-12 left-0 z-50 w-64 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111111]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl">
            {/* Header */}
            <div className="px-3 pb-2 pt-2">
              <p className="text-xs font-medium text-gray-400">
                Synapse Tools
              </p>
            </div>

            {/* AI Chat */}
            <button
              type="button"
              onClick={() => handleAction("chat")}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-200">
                  New Chat
                </p>
                <p className="text-[11px] text-gray-500">
                  Start a fresh conversation
                </p>
              </div>
            </button>

            {/* Image Studio */}
            <button
              type="button"
              onClick={() => handleAction("image")}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-200">
                  Image Studio
                </p>
                <p className="text-[11px] text-gray-500">
                  Create AI images
                </p>
              </div>
            </button>

            {/* Voice AI */}
            <button
              type="button"
              onClick={() => handleAction("voice")}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0" />
                  <path d="M12 18v3" />
                  <path d="M8 21h8" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-200">
                  Voice AI
                </p>
                <p className="text-[11px] text-gray-500">
                  Talk using your voice
                </p>
              </div>
            </button>

            {/* Summarizer */}
            <button
              type="button"
              onClick={() => handleAction("summarizer")}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h8" />
                  <path d="M8 17h6" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-200">
                  AI Summarizer
                </p>
                <p className="text-[11px] text-gray-500">
                  Summarize your content
                </p>
              </div>
            </button>

            {/* Resume */}
            <button
              type="button"
              onClick={() => handleAction("resume")}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 8h6" />
                  <path d="M9 12h6" />
                  <path d="M9 16h4" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-200">
                  Resume Analyzer
                </p>
                <p className="text-[11px] text-gray-500">
                  Analyze your resume
                </p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlusMenu;