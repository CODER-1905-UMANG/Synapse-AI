import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MyContext } from "../../context/MyContextDefinition";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";
import "./Chat.css";

const Chat = () => {
  const {
    newChat,
    prevChats,
    reply,
    voiceEnabled,
    isHistoryChat,
  } = useContext(MyContext);

  const [latestReply, setLatestReply] =
    useState(null);

  const typingInterval =
    useRef(null);

  // ==================================================
  // FIND LAST ASSISTANT MESSAGE
  // ==================================================

  const latestAssistantIndex =
    useMemo(() => {
      if (!prevChats?.length) {
        return -1;
      }

      for (
        let i = prevChats.length - 1;
        i >= 0;
        i--
      ) {
        if (
          prevChats[i]?.role ===
          "assistant"
        ) {
          return i;
        }
      }

      return -1;
    }, [prevChats]);

  // ==================================================
  // TYPING EFFECT
  //
  // NEVER RUN FOR HISTORY
  // ==================================================

  useEffect(() => {
    clearInterval(
      typingInterval.current
    );

    // ------------------------------------------
    // HISTORY CHAT
    // ------------------------------------------

    if (isHistoryChat) {
      setLatestReply(null);
      return;
    }

    // ------------------------------------------
    // NO NEW REPLY
    // ------------------------------------------

    if (!reply) {
      setLatestReply(null);
      return;
    }

    const words = reply.split(" ");

    let index = 0;

    setLatestReply("");

    typingInterval.current =
      setInterval(() => {
        setLatestReply(
          words
            .slice(0, index + 1)
            .join(" ")
        );

        index++;

        if (index >= words.length) {
          clearInterval(
            typingInterval.current
          );
        }
      }, 25);

    return () => {
      clearInterval(
        typingInterval.current
      );
    };
  }, [
    reply,
    isHistoryChat,
  ]);

  // ==================================================
  // VOICE OUTPUT
  //
  // NEVER SPEAK HISTORY CHAT
  // ==================================================

  useEffect(() => {
    if (
      isHistoryChat ||
      !voiceEnabled ||
      !reply ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        reply
      );

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(
      utterance
    );

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [
    reply,
    voiceEnabled,
    isHistoryChat,
  ]);

  // ==================================================
  // EMPTY STATE
  // ==================================================

  if (
    newChat &&
    (!prevChats ||
      prevChats.length === 0)
  ) {
    return (
      <div className="flex w-full flex-col items-center justify-center px-4 py-8">

        <h1 className="text-center text-4xl font-extrabold text-white md:text-5xl">
          🚀 Start a New Chat
        </h1>

        <p className="mt-3 max-w-md text-center text-base text-gray-400">
          Ask me anything or try out a
          suggested prompt to get started.
        </p>

      </div>
    );
  }

  // ==================================================
  // CHAT
  // ==================================================

  return (
    <div className="w-full px-2 py-4 sm:px-4 lg:px-6">

      {prevChats?.map(
        (chat, index) => {

          const isLatestAssistant =
            index ===
            latestAssistantIndex;

          /*
           * If this is a NEW response,
           * display the typing animation.
           *
           * If this is HISTORY,
           * display the saved content directly.
           */

          const content =
            !isHistoryChat &&
            isLatestAssistant &&
            latestReply !== null
              ? latestReply
              : chat.content;

          // ========================================
          // USER MESSAGE
          // ========================================

          if (
            chat.role === "user"
          ) {
            return (
              <UserMessage
                key={`user-${index}`}
                content={chat.content}
              />
            );
          }

          // ========================================
          // ASSISTANT MESSAGE
          // ========================================

          return (
            <AssistantMessage
              key={`assistant-${index}`}
              content={content}
            />
          );
        }
      )}
    </div>
  );
};

// ==================================================
// USER MESSAGE
// ==================================================

const UserMessage = ({
  content,
}) => {
  return (
    <div className="mx-auto mb-5 flex w-full max-w-6xl justify-end">

      <div className="max-w-[85%] rounded-2xl rounded-br-md border border-indigo-400/20 bg-gradient-to-br from-indigo-600 to-purple-600 px-4 py-3 text-sm leading-6 text-white shadow-lg shadow-indigo-900/20 sm:max-w-[75%] sm:px-5">

        <p className="whitespace-pre-wrap break-words">
          {content}
        </p>

      </div>

    </div>
  );
};

// ==================================================
// ASSISTANT MESSAGE
// ==================================================

const AssistantMessage = ({
  content,
}) => {
  return (
    <div className="mx-auto mb-7 flex w-full max-w-6xl justify-start">

      <div className="w-full min-w-0">

        {/* Assistant header */}

        <div className="mb-2 flex items-center gap-2 px-1">

          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">

            <div className="h-3 w-3 rounded-md bg-gradient-to-br from-indigo-400 to-purple-500" />

          </div>

          <span className="text-xs font-medium text-gray-400">
            Synapse AI
          </span>

        </div>

        {/* Message */}

        <div className="assistant-message rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-4 shadow-lg shadow-black/10 sm:px-5">

          <ReactMarkdown
            remarkPlugins={[
              remarkGfm,
            ]}
            rehypePlugins={[
              rehypeHighlight,
            ]}
            components={{

              p: ({ children }) => (
                <p className="mb-4 text-[15px] leading-7 text-gray-300 last:mb-0">
                  {children}
                </p>
              ),

              h1: ({ children }) => (
                <h1 className="mb-4 mt-6 text-2xl font-bold text-white first:mt-0">
                  {children}
                </h1>
              ),

              h2: ({ children }) => (
                <h2 className="mb-3 mt-6 text-xl font-bold text-white first:mt-0">
                  {children}
                </h2>
              ),

              h3: ({ children }) => (
                <h3 className="mb-3 mt-5 text-lg font-semibold text-white">
                  {children}
                </h3>
              ),

              h4: ({ children }) => (
                <h4 className="mb-2 mt-4 text-base font-semibold text-gray-100">
                  {children}
                </h4>
              ),

              strong: ({
                children,
              }) => (
                <strong className="font-semibold text-white">
                  {children}
                </strong>
              ),

              em: ({ children }) => (
                <em className="text-gray-300">
                  {children}
                </em>
              ),

              ul: ({ children }) => (
                <ul className="mb-4 ml-5 list-disc space-y-1.5 text-gray-300">
                  {children}
                </ul>
              ),

              ol: ({ children }) => (
                <ol className="mb-4 ml-5 list-decimal space-y-1.5 text-gray-300">
                  {children}
                </ol>
              ),

              li: ({ children }) => (
                <li className="pl-1 leading-7">
                  {children}
                </li>
              ),

              a: ({
                href,
                children,
              }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-2 transition hover:text-indigo-300"
                >
                  {children}
                </a>
              ),

              blockquote: ({
                children,
              }) => (
                <blockquote className="my-4 border-l-2 border-indigo-400/50 bg-indigo-500/5 px-4 py-2 text-gray-400">
                  {children}
                </blockquote>
              ),

              hr: () => (
                <hr className="my-6 border-white/[0.08]" />
              ),

              code: ({
                inline,
                className,
                children,
                ...props
              }) => {
                if (!inline) {
                  return (
                    <code
                      className={
                        className
                      }
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <code className="rounded-md border border-white/10 bg-black/40 px-1.5 py-0.5 font-mono text-[13px] text-indigo-300">
                    {children}
                  </code>
                );
              },

              pre: ({
                children,
              }) => (
                <div className="my-5 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090909]">

                  <div className="flex items-center gap-1.5 border-b border-white/[0.07] bg-white/[0.025] px-4 py-2">

                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />

                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />

                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />

                  </div>

                  <pre className="overflow-x-auto p-4 text-sm leading-6">
                    {children}
                  </pre>

                </div>
              ),

              table: ({
                children,
              }) => (
                <div className="my-5 w-full overflow-x-auto rounded-xl border border-white/[0.08]">

                  <table className="w-full min-w-[600px] border-collapse text-sm">
                    {children}
                  </table>

                </div>
              ),

              thead: ({
                children,
              }) => (
                <thead className="bg-white/[0.06]">
                  {children}
                </thead>
              ),

              tbody: ({
                children,
              }) => (
                <tbody className="divide-y divide-white/[0.06]">
                  {children}
                </tbody>
              ),

              tr: ({
                children,
              }) => (
                <tr className="transition hover:bg-white/[0.025]">
                  {children}
                </tr>
              ),

              th: ({
                children,
              }) => (
                <th className="whitespace-nowrap border-b border-white/[0.1] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-200">
                  {children}
                </th>
              ),

              td: ({
                children,
              }) => (
                <td className="border-b border-white/[0.05] px-4 py-3 align-top text-gray-300">
                  {children}
                </td>
              ),

              img: ({
                src,
                alt,
              }) => (
                <img
                  src={src}
                  alt={alt || ""}
                  className="my-4 max-w-full rounded-xl border border-white/10"
                />
              ),
            }}
          >
            {content || ""}
          </ReactMarkdown>

        </div>
      </div>
    </div>
  );
};

export default Chat;