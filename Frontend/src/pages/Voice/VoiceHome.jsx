import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { sendVoiceMessage } from "../../services/chatService";

const VOICE_STORAGE_KEY = "synapse-voice-state";

const getSavedVoiceState = () => {
  try {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);

    if (!saved) {
      return {
        transcript: "",
        aiResponse: "",
      };
    }

    const parsed = JSON.parse(saved);

    return {
      transcript: parsed.transcript || "",
      aiResponse: parsed.aiResponse || "",
    };
  } catch (error) {
    console.error("Failed to restore voice state:", error);

    return {
      transcript: "",
      aiResponse: "",
    };
  }
};

const VoiceHome = () => {
  const savedState = getSavedVoiceState();

  const [listening, setListening] = useState(false);

  const [status, setStatus] = useState(
    "Click 'Start Listening' to speak..."
  );

  const [transcript, setTranscript] = useState(savedState.transcript);
  const [aiResponse, setAiResponse] = useState(savedState.aiResponse);
  const [processing, setProcessing] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const manualStopRef = useRef(false);
  const recognitionActiveRef = useRef(false);

  // --------------------------------------------------
  // Save voice state
  // --------------------------------------------------

  const saveVoiceState = useCallback(
    (newTranscript, newResponse) => {
      try {
        localStorage.setItem(
          VOICE_STORAGE_KEY,
          JSON.stringify({
            transcript: newTranscript,
            aiResponse: newResponse,
          })
        );
      } catch (error) {
        console.error("Failed to save voice state:", error);
      }
    },
    []
  );

  // --------------------------------------------------
  // Speak AI Response
  // --------------------------------------------------

  const speakAI = useCallback((text) => {
    if (!window.speechSynthesis || !text) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setStatus("AI is speaking...");
    };

    utterance.onend = () => {
      setSpeaking(false);
      setStatus(
        "AI response completed. You can speak again."
      );
    };

    utterance.onerror = (error) => {
      setSpeaking(false);
      console.error("Speech synthesis error:", error);
      setStatus("AI response generated.");
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  // --------------------------------------------------
  // Get AI Response
  // --------------------------------------------------

  const getAIResponse = useCallback(
    async (userMessage) => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setStatus("Please login again to use Voice AI.");
          setProcessing(false);
          return;
        }

        const data = await sendVoiceMessage(userMessage);

        const reply = data.reply;

        setAiResponse(reply);
        setStatus("AI response generated.");

        saveVoiceState(userMessage, reply);

        speakAI(reply);
      } catch (error) {
        console.error("Voice AI error:", error);

        setStatus(
          error.message || "Failed to get AI response."
        );
      } finally {
        setProcessing(false);
      }
    },
    [saveVoiceState, speakAI]
  );

  // --------------------------------------------------
  // Speech Recognition Setup
  // --------------------------------------------------

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus(
        "Your browser does not support voice recognition. Please use Chrome or Edge."
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      recognitionActiveRef.current = true;
      setListening(true);
      setStatus("Listening... Speak now.");
    };

    recognition.onresult = async (event) => {
      const userMessage = event.results[0][0].transcript.trim();

      if (!userMessage) {
        setStatus("I couldn't hear anything. Please try again.");
        return;
      }

      setTranscript(userMessage);
      setAiResponse("");

      saveVoiceState(userMessage, "");

      setStatus(`You said: "${userMessage}"`);
      setListening(false);
      setProcessing(true);

      await getAIResponse(userMessage);
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition event:", event.error);

      recognitionActiveRef.current = false;
      setListening(false);
      setProcessing(false);

      if (event.error === "no-speech") {
        setStatus(
          "No speech detected. Click Start Listening and speak clearly."
        );
        return;
      }

      if (event.error === "not-allowed") {
        setStatus(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
        return;
      }

      if (event.error === "audio-capture") {
        setStatus(
          "No microphone was detected. Check your microphone connection and Windows input settings."
        );
        return;
      }

      if (event.error === "network") {
        setStatus(
          "Speech recognition needs a network connection. Please check your internet connection."
        );
        return;
      }

      if (event.error === "aborted") {
        setStatus("Voice recognition stopped.");
        return;
      }

      setStatus("Unable to recognize speech. Please try again.");
    };

    recognition.onend = () => {
      recognitionActiveRef.current = false;
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      manualStopRef.current = true;

      try {
        recognition.stop();
      } catch {
        // Recognition may already be stopped.
      }

      window.speechSynthesis?.cancel();
      setSpeaking(false);
    };
  }, [getAIResponse, saveVoiceState]);

  // --------------------------------------------------
  // Start Listening
  // --------------------------------------------------

  const startListening = () => {
    if (!recognitionRef.current) {
      setStatus("Voice recognition is not available.");
      return;
    }

    if (recognitionActiveRef.current) {
      return;
    }

    try {
      manualStopRef.current = false;

      window.speechSynthesis?.cancel();
      setSpeaking(false);

      recognitionRef.current.start();
    } catch (error) {
      console.error("Failed to start recognition:", error);

      setListening(false);
      recognitionActiveRef.current = false;

      setStatus("Unable to start voice recognition.");
    }
  };

  // --------------------------------------------------
  // Stop Listening
  // --------------------------------------------------

  const stopListening = () => {
    manualStopRef.current = true;

    if (
      recognitionRef.current &&
      recognitionActiveRef.current
    ) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error(error);
      }
    }

    window.speechSynthesis?.cancel();

    recognitionActiveRef.current = false;

    setListening(false);
    setProcessing(false);
    setSpeaking(false);
    setStatus("Voice chat stopped.");
  };

  // --------------------------------------------------
  // Clear Conversation
  // --------------------------------------------------

  const clearVoiceChat = () => {
    manualStopRef.current = true;

    try {
      recognitionRef.current?.stop();
    } catch {
      // Already stopped.
    }

    window.speechSynthesis?.cancel();

    recognitionActiveRef.current = false;

    setListening(false);
    setProcessing(false);
    setSpeaking(false);

    setTranscript("");
    setAiResponse("");

    setStatus("Click 'Start Listening' to speak...");

    localStorage.removeItem(VOICE_STORAGE_KEY);
  };

  // --------------------------------------------------
  // Voice visual state
  // --------------------------------------------------

  const voiceState = speaking
    ? "speaking"
    : listening
      ? "listening"
      : processing
        ? "thinking"
        : "idle";

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#050507] text-white overflow-x-hidden">
      <style>{`
        .voice-orb-wrap {
          position: relative;
          width: 290px;
          height: 290px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-orb {
          position: relative;
          width: 270px;
          height: 270px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .orb-core {
          position: relative;
          width: 128px;
          height: 128px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 34% 28%,
            #ffffff 0%,
            #ddd6fe 8%,
            #a78bfa 24%,
            #7c3aed 46%,
            #4c1d95 72%,
            #10051d 100%
          );
          box-shadow:
            0 0 35px rgba(139, 92, 246, 0.75),
            0 0 90px rgba(99, 102, 241, 0.38),
            inset -14px -18px 30px rgba(15, 5, 30, 0.55);
          z-index: 5;
          overflow: hidden;
          transition:
            transform 0.35s ease,
            box-shadow 0.35s ease;
        }

        .orb-highlight {
          position: absolute;
          top: 17px;
          left: 22px;
          width: 32px;
          height: 18px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          filter: blur(7px);
          transform: rotate(-25deg);
        }

        .orb-symbol {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.9);
          font-size: 30px;
          text-shadow: 0 0 18px rgba(255, 255, 255, 0.8);
        }

        .orb-glow {
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.28);
          filter: blur(45px);
          z-index: 0;
        }

        .orb-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(167, 139, 250, 0.32);
          z-index: 2;
          opacity: 0;
        }

        .ring-1 {
          width: 155px;
          height: 155px;
        }

        .ring-2 {
          width: 205px;
          height: 205px;
        }

        .ring-3 {
          width: 260px;
          height: 260px;
        }

        .voice-orb.idle .orb-core {
          animation: orbIdle 3.2s ease-in-out infinite;
        }

        .voice-orb.listening .orb-core {
          animation: orbListen 1.35s ease-in-out infinite;
          box-shadow:
            0 0 42px rgba(139, 92, 246, 0.85),
            0 0 110px rgba(99, 102, 241, 0.45),
            inset -14px -18px 30px rgba(15, 5, 30, 0.55);
        }

        .voice-orb.listening .orb-ring {
          animation: orbRing 1.9s ease-out infinite;
        }

        .voice-orb.listening .ring-2 {
          animation-delay: 0.45s;
        }

        .voice-orb.listening .ring-3 {
          animation-delay: 0.9s;
        }

        .voice-orb.thinking .orb-core {
          animation: orbThink 1.8s ease-in-out infinite;
        }

        .voice-orb.thinking .orb-ring {
          opacity: 0.35;
          animation: orbThinkRing 2.2s linear infinite;
        }

        .voice-orb.speaking .orb-core {
          animation: orbSpeak 0.62s ease-in-out infinite alternate;
          box-shadow:
            0 0 48px rgba(129, 140, 248, 0.95),
            0 0 125px rgba(99, 102, 241, 0.5),
            inset -14px -18px 30px rgba(15, 5, 30, 0.55);
        }

        .voice-orb.speaking .orb-ring {
          animation: orbSpeakRing 1.15s ease-out infinite;
        }

        .voice-orb.speaking .ring-2 {
          animation-delay: 0.28s;
        }

        .voice-orb.speaking .ring-3 {
          animation-delay: 0.56s;
        }

        @keyframes orbIdle {
          0%,
          100% {
            transform: scale(0.96);
          }

          50% {
            transform: scale(1.02);
          }
        }

        @keyframes orbListen {
          0%,
          100% {
            transform: scale(0.92);
          }

          50% {
            transform: scale(1.1);
          }
        }

        @keyframes orbThink {
          0%,
          100% {
            transform: scale(0.95) rotate(-4deg);
          }

          50% {
            transform: scale(1.04) rotate(4deg);
          }
        }

        @keyframes orbSpeak {
          from {
            transform: scale(0.88);
          }

          to {
            transform: scale(1.16);
          }
        }

        @keyframes orbRing {
          0% {
            transform: scale(0.55);
            opacity: 0.75;
          }

          100% {
            transform: scale(1.12);
            opacity: 0;
          }
        }

        @keyframes orbSpeakRing {
          0% {
            transform: scale(0.55);
            opacity: 0.8;
          }

          100% {
            transform: scale(1.16);
            opacity: 0;
          }
        }

        @keyframes orbThinkRing {
          0% {
            transform: rotate(0deg) scale(0.82);
          }

          50% {
            transform: rotate(180deg) scale(1);
          }

          100% {
            transform: rotate(360deg) scale(0.82);
          }
        }

        @media (max-width: 640px) {
          .voice-orb-wrap {
            width: 250px;
            height: 250px;
          }

          .voice-orb {
            width: 235px;
            height: 235px;
          }

          .orb-core {
            width: 108px;
            height: 108px;
          }

          .ring-1 {
            width: 135px;
            height: 135px;
          }

          .ring-2 {
            width: 180px;
            height: 180px;
          }

          .ring-3 {
            width: 225px;
            height: 225px;
          }
        }
      `}</style>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-180px] left-[15%] w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[140px]" />

        <div className="absolute bottom-[-200px] right-[10%] w-[500px] h-[500px] bg-indigo-700/10 rounded-full blur-[140px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />

            Synapse Voice AI
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Talk naturally with{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300 bg-clip-text text-transparent">
              Synapse AI
            </span>
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Speak your question, let Synapse process it, and listen to
            the response in real time.
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-[320px_1fr] rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Left Controls */}
            <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="9"
                      y="2"
                      width="6"
                      height="12"
                      rx="3"
                    />

                    <path d="M5 10a7 7 0 0 0 14 0" />

                    <path d="M12 19v3" />

                    <path d="M8 22h8" />
                  </svg>
                </div>

                <div>
                  <h2 className="font-semibold text-lg">
                    Voice Controls
                  </h2>

                  <p className="text-xs text-gray-500">
                    Speak with Synapse
                  </p>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={startListening}
                disabled={listening || processing}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  listening || processing
                    ? "bg-purple-600/50 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20"
                }`}
              >
                {listening ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Listening...
                  </>
                ) : processing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="9"
                        y="2"
                        width="6"
                        height="12"
                        rx="3"
                      />

                      <path d="M5 10a7 7 0 0 0 14 0" />

                      <path d="M12 19v3" />

                      <path d="M8 22h8" />
                    </svg>

                    Start Listening
                  </>
                )}
              </button>

              {/* Stop Button */}
              <button
                onClick={stopListening}
                disabled={!listening && !processing}
                className={`w-full mt-3 py-3 rounded-xl font-medium border transition-all ${
                  !listening && !processing
                    ? "border-white/5 text-gray-600 cursor-not-allowed"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                Stop Voice
              </button>

              {/* Clear */}
              <button
                onClick={clearVoiceChat}
                className="w-full mt-3 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Clear Conversation
              </button>

              {/* Status */}
              <div className="mt-8">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                  Status
                </p>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        listening
                          ? "bg-green-400 animate-pulse"
                          : processing
                            ? "bg-yellow-400 animate-pulse"
                            : "bg-purple-400"
                      }`}
                    />

                    <p className="text-sm text-gray-300 leading-relaxed">
                      {status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Browser Support */}
              <div className="mt-6 text-xs text-gray-500 leading-relaxed">
                Voice recognition works best in modern browsers such as
                Chrome and Edge. Make sure microphone permission is
                enabled.
              </div>
            </div>

            {/* Right Voice Workspace */}
            <div className="p-6 sm:p-8">
              {/* Voice Visualizer */}
              <div className="rounded-2xl border border-white/10 bg-black/20 p-6 sm:p-8 mb-6 overflow-hidden">
                <div className="text-center">
                  <div className="voice-orb-wrap">
                    <div className={`voice-orb ${voiceState}`}>
                      <div className="orb-glow" />
                      <div className="orb-ring ring-1" />
                      <div className="orb-ring ring-2" />
                      <div className="orb-ring ring-3" />

                      <div className="orb-core">
                        <div className="orb-highlight" />
                        <div className="orb-symbol">✦</div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold mt-2">
                    {speaking
                      ? "Synapse is speaking"
                      : listening
                        ? "Listening to you"
                        : processing
                          ? "Thinking..."
                          : "Ready to listen"}
                  </h2>

                  <p className="text-sm text-gray-500 mt-2">
                    {speaking
                      ? "Listen to Synapse's response"
                      : listening
                        ? "Speak clearly and naturally"
                        : processing
                          ? "Synapse is preparing your response"
                          : "Tap Start Listening when you're ready"}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-gray-500">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        speaking
                          ? "bg-indigo-400 animate-pulse"
                          : listening
                            ? "bg-purple-400 animate-pulse"
                            : processing
                              ? "bg-yellow-400 animate-pulse"
                              : "bg-white/20"
                      }`}
                    />

                    {speaking
                      ? "Speaking"
                      : listening
                        ? "Listening"
                        : processing
                          ? "Processing"
                          : "Standby"}
                  </div>
                </div>
              </div>

              {/* Conversation */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* User Message */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Your Message
                      </p>

                      <p className="text-xs text-gray-500">
                        Speech transcript
                      </p>
                    </div>
                  </div>

                  <div className="p-5 min-h-[150px]">
                    {transcript ? (
                      <p className="text-gray-300 leading-relaxed">
                        {transcript}
                      </p>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <p className="text-gray-600 text-sm">
                          Your spoken message will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Response */}
                <div className="rounded-2xl border border-purple-500/10 bg-purple-500/[0.025] overflow-hidden">
                  <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="9" />

                        <path d="M8 12h8" />

                        <path d="M12 8v8" />
                      </svg>
                    </div>

                    <div>
                      <p className="font-medium text-sm">
                        Synapse Response
                      </p>

                      <p className="text-xs text-gray-500">
                        AI-generated response
                      </p>
                    </div>
                  </div>

                  <div className="p-5 min-h-[150px]">
                    {aiResponse ? (
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {aiResponse}
                      </p>
                    ) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <p className="text-gray-600 text-sm">
                          Synapse responses will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
                <p className="text-xs text-gray-600">
                  Voice conversations are processed through your Synapse
                  AI backend.
                </p>

                {aiResponse && (
                  <button
                    onClick={() => speakAI(aiResponse)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    🔊 Replay response
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="max-w-6xl mx-auto mt-6 text-center">
          <p className="text-xs text-gray-600">
            Synapse AI • Voice Assistant
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceHome;