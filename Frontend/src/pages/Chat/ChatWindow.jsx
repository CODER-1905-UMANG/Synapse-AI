import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { MyContext } from "../../context/MyContextDefinition";

import Chat from "../../components/chat/Chat";
import Navbar from "../../components/chat/Navbar";
import Sidebar from "../../components/chat/Sidebar";
import PlusMenu from "../../components/chat/PlusMenu";

import { ScaleLoader } from "react-spinners";

import { sendChatMessage } from "../../services/chatService";

const ChatWindow = () => {
  const navigate = useNavigate();

  const {
    prompt,
    setPrompt,

    setReply,

    currThreadId,

    prevChats,
    setPrevChats,

    allThreads,
    loadThread,
    startNewChat,
    deleteThread,
    fetchThreads,

    // IMPORTANT
    setIsHistoryChat,
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);

  const [showError, setShowError] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const recognitionRef = useRef(null);

  const textareaRef = useRef(null);

  const chatContainerRef = useRef(null);

  const restoringThreadRef = useRef(false);

  // ==================================================
  // SPEECH RECOGNITION
  // ==================================================

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[
          event.results.length - 1
        ][0].transcript;

      setPrompt((previous) =>
        previous
          ? `${previous} ${transcript}`
          : transcript
      );
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore
      }
    };
  }, [setPrompt]);

  // ==================================================
  // RESTORE SCROLL
  // ==================================================

  useEffect(() => {
    const container =
      chatContainerRef.current;

    if (!container || !currThreadId) {
      return;
    }

    const savedScroll =
      sessionStorage.getItem(
        `synapse_scroll_${currThreadId}`
      );

    if (savedScroll === null) {
      return;
    }

    restoringThreadRef.current = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTop =
          Number(savedScroll);

        setTimeout(() => {
          restoringThreadRef.current = false;
        }, 100);
      });
    });
  }, [currThreadId, prevChats.length]);

  // ==================================================
  // SAVE SCROLL
  // ==================================================

  useEffect(() => {
    const container =
      chatContainerRef.current;

    if (!container || !currThreadId) {
      return;
    }

    const saveScroll = () => {
      if (restoringThreadRef.current) {
        return;
      }

      sessionStorage.setItem(
        `synapse_scroll_${currThreadId}`,
        String(container.scrollTop)
      );
    };

    container.addEventListener(
      "scroll",
      saveScroll,
      {
        passive: true,
      }
    );

    return () => {
      container.removeEventListener(
        "scroll",
        saveScroll
      );
    };
  }, [currThreadId]);

  // ==================================================
  // SCROLL BOTTOM
  // ==================================================

  const scrollToBottom = () => {
    const container =
      chatContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  // ==================================================
  // VOICE INPUT
  // ==================================================

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    try {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
    } catch (error) {
      console.error(
        "Speech recognition error:",
        error
      );
    }
  };

  // ==================================================
  // TEXTAREA
  // ==================================================

  const handlePromptChange = (event) => {
    const value = event.target.value;

    setPrompt(value);

    const textarea = event.target;

    textarea.style.height = "auto";

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      180
    )}px`;
  };

  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const getReply = async (textToSend) => {
    const message = (
      textToSend ||
      prompt ||
      ""
    )
      .toString()
      .trim();

    if (!message || loading) {
      return;
    }

    // This is a NEW chat response.
    setIsHistoryChat(false);

    setLoading(true);

    setShowError(false);

    restoringThreadRef.current = false;

    if (
      isListening &&
      recognitionRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }

    // ------------------------------------------
    // Add user message immediately
    // ------------------------------------------

    setPrevChats((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
      },
    ]);

    setPrompt("");

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto";
    }

    try {
      // ------------------------------------------
      // SEND MESSAGE THROUGH SERVICE
      // ------------------------------------------

      const result = await sendChatMessage(
        currThreadId,
        message
      );

      if (!result.reply) {
        throw new Error(
          "No response received."
        );
      }

      // ------------------------------------------
      // AI RESPONSE
      // ------------------------------------------

      setReply(result.reply);

      setPrevChats((previous) => [
        ...previous,
        {
          role: "assistant",
          content: result.reply,
        },
      ]);

      // ------------------------------------------
      // UPDATE SIDEBAR
      // ------------------------------------------

      await fetchThreads();

      // ------------------------------------------
      // SCROLL TO NEW RESPONSE
      // ------------------------------------------

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error(
        "Error fetching reply:",
        error
      );

      setShowError(true);

      // Remove optimistic user message
      setPrevChats((previous) => {
        if (
          previous.length > 0 &&
          previous[
            previous.length - 1
          ]?.role === "user" &&
          previous[
            previous.length - 1
          ]?.content === message
        ) {
          return previous.slice(0, -1);
        }

        return previous;
      });
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // KEYBOARD
  // ==================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      getReply();
    }
  };

  // ==================================================
  // NEW CHAT
  // ==================================================

  const handleNewChat = () => {
    restoringThreadRef.current = false;

    startNewChat();

    setShowError(false);

    setPrompt("");

    if (textareaRef.current) {
      textareaRef.current.style.height =
        "auto";
    }

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // ==================================================
  // SELECT HISTORY
  // ==================================================

  const handleSelectThread = async (
    threadId
  ) => {
    if (!threadId) return;

    setShowError(false);

    // Tell Chat that this is history.
    setIsHistoryChat(true);

    restoringThreadRef.current = true;

    await loadThread(threadId);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container =
          chatContainerRef.current;

        if (!container) {
          return;
        }

        const savedScroll =
          sessionStorage.getItem(
            `synapse_scroll_${threadId}`
          );

        if (savedScroll !== null) {
          container.scrollTop =
            Number(savedScroll);
        } else {
          container.scrollTop =
            container.scrollHeight;
        }

        setTimeout(() => {
          restoringThreadRef.current = false;
        }, 100);
      });
    });

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // ==================================================
  // DELETE THREAD
  // ==================================================

  const handleDeleteThread = async (
    threadId
  ) => {
    await deleteThread(threadId);
  };

  // ==================================================
  // PLUS MENU
  // ==================================================

  const handlePlusAction = (action) => {
    switch (action) {
      case "image":
        navigate("/imagify");
        break;

      case "chat":
        handleNewChat();
        break;

      case "voice":
        navigate("/voicefy");
        break;

      case "summarizer":
        navigate("/summarizer");
        break;

      case "resume":
        navigate("/resume");
        break;

      default:
        break;
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-black text-white">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <Navbar />

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        isOpen={isSidebarOpen}
        onOpen={() =>
          setIsSidebarOpen(true)
        }
        onClose={() =>
          setIsSidebarOpen(false)
        }
        allThreads={allThreads}
        currThreadId={currThreadId}
        onNewChat={handleNewChat}
        onSelectThread={
          handleSelectThread
        }
        onDeleteThread={
          handleDeleteThread
        }
      />

      {/* ==================================================
          WORKSPACE
      ================================================== */}

      <div
        className="relative h-[calc(100dvh-76px)] overflow-hidden md:ml-[280px]"
        style={{
          marginTop: "76px",
        }}
      >
        <main className="relative h-full w-full overflow-hidden">

          {/* Background */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">

            <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />

            <div className="absolute bottom-[-200px] right-[-100px] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[120px]" />

          </div>

          {/* ==================================================
              MOBILE MENU
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setIsSidebarOpen(true)
            }
            className="fixed left-4 top-[92px] z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white backdrop-blur-xl transition hover:bg-white/[0.1] md:hidden"
            aria-label="Open sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line
                x1="4"
                y1="6"
                x2="20"
                y2="6"
              />

              <line
                x1="4"
                y1="12"
                x2="20"
                y2="12"
              />

              <line
                x1="4"
                y1="18"
                x2="20"
                y2="18"
              />
            </svg>
          </button>

          {/* ==================================================
              ONLY SCROLL CONTAINER
          ================================================== */}

          <div
            ref={chatContainerRef}
            className="relative z-10 h-full w-full overflow-y-auto"
          >
            <div className="min-h-full px-3 pb-[165px] pt-6 sm:px-5 sm:pt-8 lg:px-8">

              {prevChats.length === 0 ? (

                /* ==================================================
                    EMPTY STATE
                ================================================== */

                <div className="flex min-h-[calc(100dvh-250px)] items-center justify-center">

                  <div className="w-full max-w-4xl text-center">

                    <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-[0_0_50px_rgba(99,102,241,0.15)]">

                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500/30" />

                    </div>

                    <h1 className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
                      How can I help you today?
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
                      Ask questions, solve
                      problems, generate ideas,
                      analyze information, or
                      explore your next idea
                      with Synapse AI.
                    </p>

                    <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">

                      {[
                        {
                          title:
                            "Explain a concept",
                          text:
                            "Explain a technical concept simply",
                        },
                        {
                          title:
                            "Write something",
                          text:
                            "Help me write a professional email",
                        },
                        {
                          title:
                            "Solve a problem",
                          text:
                            "Help me solve a coding problem",
                        },
                        {
                          title:
                            "Generate ideas",
                          text:
                            "Give me creative project ideas",
                        },
                      ].map((item) => (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() =>
                            setPrompt(
                              item.text
                            )
                          }
                          className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 text-left transition duration-200 hover:border-indigo-400/20 hover:bg-white/[0.05]"
                        >
                          <p className="text-sm font-medium text-gray-200">
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 transition group-hover:text-gray-400">
                            {item.text}
                          </p>
                        </button>
                      ))}

                    </div>
                  </div>
                </div>

              ) : (

                /* ==================================================
                    CHAT
                ================================================== */

                <div className="mx-auto w-full max-w-6xl">

                  <Chat />

                  {loading && (
                    <div className="mt-5 flex items-center gap-3 px-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">

                        <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-400" />

                      </div>

                      <ScaleLoader
                        height={16}
                        width={2}
                        radius={2}
                        margin={2}
                        speedMultiplier={0.8}
                        color="#818cf8"
                      />

                    </div>
                  )}

                  {showError && (
                    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
                      Something went wrong
                      while generating the
                      response. Please try
                      again.
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

          {/* ==================================================
              FIXED INPUT
          ================================================== */}

          <div className="fixed bottom-0 left-0 right-0 z-50 md:left-[280px]">

            <div className="border-t border-white/[0.06] bg-black/90 px-3 pb-3 pt-4 backdrop-blur-xl sm:px-5">

              <div className="mx-auto w-full max-w-6xl px-1 sm:px-3">

                <div className="relative rounded-2xl border border-white/[0.1] bg-[#0b0b0b]/95 shadow-2xl shadow-black/50 transition focus-within:border-indigo-400/30">

                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={
                      handlePromptChange
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    placeholder="Message Synapse AI..."
                    rows={1}
                    disabled={loading}
                    className="block max-h-[180px] min-h-[56px] w-full resize-none bg-transparent px-4 pb-14 pt-4 text-sm leading-6 text-white outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <PlusMenu
                        onAction={
                          handlePlusAction
                        }
                      />

                      <span className="hidden text-[11px] text-gray-600 sm:block">
                        Use Shift + Enter
                        for a new line
                      </span>

                    </div>

                    <div className="flex items-center gap-2">

                      {/* ==================================================
                          VOICE
                      ================================================== */}

                      <button
                        type="button"
                        onClick={
                          toggleListening
                        }
                        disabled={loading}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                          isListening
                            ? "bg-red-500/15 text-red-400"
                            : "text-gray-500 hover:bg-white/[0.06] hover:text-white"
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                        aria-label={
                          isListening
                            ? "Stop voice input"
                            : "Start voice input"
                        }
                      >
                        {isListening ? (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <rect
                              x="6"
                              y="6"
                              width="12"
                              height="12"
                              rx="2"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="19"
                            height="19"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          >
                            <rect
                              x="9"
                              y="3"
                              width="6"
                              height="12"
                              rx="3"
                            />

                            <path d="M5 11a7 7 0 0 0 14 0" />

                            <path d="M12 18v3" />

                            <path d="M8 21h8" />
                          </svg>
                        )}
                      </button>

                      {/* ==================================================
                          SEND
                      ================================================== */}

                      <button
                        type="button"
                        onClick={() =>
                          getReply()
                        }
                        disabled={
                          !prompt.trim() ||
                          loading
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
                        aria-label="Send message"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 19V5" />
                          <path d="M5 12l7-7 7 7" />
                        </svg>
                      </button>

                    </div>
                  </div>
                </div>

                <p className="mt-2 text-center text-[10px] text-gray-600">
                  Synapse AI can make
                  mistakes. Verify important
                  information.
                </p>

              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default ChatWindow;