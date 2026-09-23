import React from "react";
import { NavLink } from "react-router-dom";

import {
  MessageSquare,
  Image,
  Mic,
  FileText,
  FileSearch,
  Settings,
  Menu,
  X,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";

const navigationItems = [
  {
    to: "/imagify",
    label: "Image Studio",
    icon: Image,
  },
  {
    to: "/voicefy",
    label: "Voice AI",
    icon: Mic,
  },
  {
    to: "/summarizer",
    label: "AI Summarizer",
    icon: FileText,
  },
  {
    to: "/resume",
    label: "Resume Analyzer",
    icon: FileSearch,
  },
];

function Sidebar({
  isOpen,
  onOpen,
  onClose,
  allThreads = [],
  currThreadId,
  onNewChat,
  onSelectThread,
  onDeleteThread,
}) {
  return (
    <>
      {/* Mobile Hamburger */}
      <div className="fixed left-4 top-4 z-[60] md:hidden">
        <button
          onClick={isOpen ? onClose : onOpen}
          aria-label="Toggle sidebar"
          className="
            flex h-10 w-10 items-center justify-center
            rounded-xl
            border border-white/10
            bg-black/85
            text-white
            shadow-lg
            backdrop-blur-xl
            transition
            hover:border-purple-400/30
            hover:bg-white/10
          "
        >
          {isOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-64
          flex-col
          border-r
          border-white/10
          bg-[#050505]/95
          shadow-[0_0_40px_rgba(0,0,0,0.55)]
          backdrop-blur-xl
          transition-transform
          duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Brand */}
        <div className="px-5 pb-5 pt-5">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-xl
                bg-gradient-to-br
                from-purple-500
                to-indigo-500
                shadow-lg
                shadow-purple-500/20
              "
            >
              <Sparkles size={20} className="text-white" />
            </div>

            <div>
              <h2
                className="
                  bg-gradient-to-r
                  from-purple-400
                  to-indigo-400
                  bg-clip-text
                  text-xl
                  font-bold
                  text-transparent
                "
              >
                Synapse AI
              </h2>

              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                AI Workspace
              </p>
            </div>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-4">
          <button
            onClick={onNewChat}
            className="
              flex w-full items-center gap-3
              rounded-xl
              border border-white/10
              bg-white/[0.04]
              px-3 py-3
              text-left text-gray-200
              transition-all
              hover:border-purple-500/30
              hover:bg-purple-500/[0.08]
              hover:text-white
            "
          >
            <div
              className="
                flex h-7 w-7 items-center justify-center
                rounded-lg
                bg-gradient-to-br
                from-purple-500
                to-indigo-500
              "
            >
              <Plus size={16} />
            </div>

            <span className="text-sm font-medium">
              New Chat
            </span>
          </button>
        </div>

        {/* Chat History */}
        <div className="mt-6 flex min-h-0 flex-1 flex-col px-4">
          <div className="mb-3 flex items-center justify-between px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Recent Chats
            </p>

            <MessageSquare
              size={13}
              className="text-gray-600"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            {allThreads.length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <MessageSquare
                  size={18}
                  className="mb-2 text-gray-600"
                />

                <p className="text-xs text-gray-500">
                  No conversations yet.
                </p>

                <p className="mt-1 text-[11px] text-gray-600">
                  Start chatting to create your first conversation.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {allThreads.map((thread) => {
                  const isActive =
                    currThreadId === thread.threadId;

                  return (
                    <div
                      key={thread.threadId}
                      className={`
                        group flex items-center rounded-lg
                        transition
                        ${
                          isActive
                            ? "bg-purple-500/[0.10]"
                            : "hover:bg-white/[0.05]"
                        }
                      `}
                    >
                      <button
                        onClick={() => {
                          onSelectThread(thread.threadId);

                          if (onClose) {
                            onClose();
                          }
                        }}
                        className="
                          flex min-w-0 flex-1
                          items-center gap-2
                          px-3 py-2.5
                          text-left
                        "
                        title={thread.title}
                      >
                        <MessageSquare
                          size={15}
                          className={`
                            shrink-0
                            ${
                              isActive
                                ? "text-purple-400"
                                : "text-gray-600"
                            }
                          `}
                        />

                        <span
                          className={`
                            min-w-0 flex-1 truncate text-xs
                            ${
                              isActive
                                ? "text-white"
                                : "text-gray-400"
                            }
                          `}
                        >
                          {thread.title || "Untitled conversation"}
                        </span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onDeleteThread(thread.threadId);
                        }}
                        title="Delete conversation"
                        className="
                          mr-1
                          hidden
                          rounded-md
                          p-1.5
                          text-gray-600
                          transition
                          hover:bg-red-500/10
                          hover:text-red-400
                          group-hover:block
                        "
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* AI Tools */}
        <div className="border-t border-white/[0.08] px-4 pb-3 pt-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            AI Tools
          </p>

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className="
                    group flex items-center gap-3
                    rounded-lg
                    px-3 py-2.5
                    text-gray-400
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <Icon
                    size={17}
                    className="
                      text-gray-500
                      transition-colors
                      group-hover:text-purple-400
                    "
                  />

                  <span className="text-xs font-medium">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}

            {/* Settings */}
            <NavLink
              to="/settings"
              onClick={onClose}
              className="
                group flex items-center gap-3
                rounded-lg
                px-3 py-2.5
                text-gray-400
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              <Settings
                size={17}
                className="
                  text-gray-500
                  transition-colors
                  group-hover:text-purple-400
                "
              />

              <span className="text-xs font-medium">
                Settings
              </span>
            </NavLink>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2">
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
            <div className="flex items-center gap-2">
              <Sparkles
                size={13}
                className="text-purple-400"
              />

              <span className="text-[10px] text-gray-500">
                Synapse AI
              </span>
            </div>

            <span className="text-[9px] text-gray-700">
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/60
            backdrop-blur-sm
            md:hidden
          "
          onClick={onClose}
        />
      )}
    </>
  );
}

export default Sidebar;