import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { v1 as uuidv1 } from "uuid";

import {
  fetchThreads as fetchThreadsService,
  loadThread as loadThreadService,
  deleteThread as deleteThreadService,
} from "../services/chatService";

import { MyContext } from "./MyContextDefinition";

export const MyProvider = ({ children }) => {
  // ==================================================
  // CHAT STATE
  // ==================================================

  const [prompt, setPrompt] = useState("");

  const [reply, setReply] = useState("");

  const [currThreadId, setCurrThreadId] = useState(() => {
    const savedThreadId = sessionStorage.getItem(
      "synapse_current_thread"
    );

    return savedThreadId || uuidv1();
  });

  const [prevChats, setPrevChats] = useState([]);

  const [newChat, setNewChat] = useState(true);

  const [allThreads, setAllThreads] = useState([]);

  // ==================================================
  // IMPORTANT
  //
  // true  = messages were loaded from history
  // false = current chat / newly generated response
  // ==================================================

  const [isHistoryChat, setIsHistoryChat] =
    useState(false);

  // ==================================================
  // VOICE
  // ==================================================

  const [voiceEnabled, setVoiceEnabled] =
    useState(true);

  // ==================================================
  // USER
  // ==================================================

  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem("user");

    try {
      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch {
      return null;
    }
  });

  // ==================================================
  // SAVE USER
  // ==================================================

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // ==================================================
  // SAVE CURRENT THREAD
  // ==================================================

  useEffect(() => {
    if (currThreadId) {
      sessionStorage.setItem(
        "synapse_current_thread",
        currThreadId
      );
    }
  }, [currThreadId]);

  // ==================================================
  // FETCH THREADS
  // ==================================================

  const fetchThreads = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setAllThreads([]);
        return [];
      }

      const threads =
        await fetchThreadsService();

      const safeThreads = Array.isArray(
        threads
      )
        ? threads
        : [];

      setAllThreads(safeThreads);

      return safeThreads;
    } catch (error) {
      console.error(
        "Error fetching threads:",
        error
      );

      setAllThreads([]);

      return [];
    }
  }, []);

  // ==================================================
  // LOAD HISTORY THREAD
  // ==================================================

  const loadThread = useCallback(
    async (threadId) => {
      if (!threadId) {
        return false;
      }

      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return false;
        }

        const messages =
          await loadThreadService(threadId);

        const safeMessages =
          Array.isArray(messages)
            ? messages
            : [];

        // ------------------------------------------
        // MARK AS HISTORY
        // ------------------------------------------

        setIsHistoryChat(true);

        // ------------------------------------------
        // SET THREAD
        // ------------------------------------------

        setCurrThreadId(threadId);

        // ------------------------------------------
        // LOAD EXISTING MESSAGES
        // ------------------------------------------

        setPrevChats(safeMessages);

        // ------------------------------------------
        // THIS IS NOT A NEW CHAT
        // ------------------------------------------

        setNewChat(false);

        // ------------------------------------------
        // IMPORTANT:
        //
        // Set reply to EMPTY.
        //
        // Otherwise Chat.jsx can think the last
        // assistant response is a new response.
        // ------------------------------------------

        setReply("");

        setPrompt("");

        return true;
      } catch (error) {
        console.error(
          "Error loading thread:",
          error
        );

        return false;
      }
    },
    []
  );

  // ==================================================
  // START NEW CHAT
  // ==================================================

  const startNewChat = useCallback(() => {
    const newThreadId = uuidv1();

    setCurrThreadId(newThreadId);

    setPrevChats([]);

    setReply("");

    setPrompt("");

    setNewChat(true);

    // This is NOT history
    setIsHistoryChat(false);

    sessionStorage.setItem(
      "synapse_current_thread",
      newThreadId
    );

    sessionStorage.removeItem(
      `synapse_scroll_${newThreadId}`
    );
  }, []);

  // ==================================================
  // DELETE THREAD
  // ==================================================

  const deleteThread = useCallback(
    async (threadId) => {
      if (!threadId) {
        return;
      }

      try {
        const token =
          localStorage.getItem("token");

        if (!token) {
          return;
        }

        await deleteThreadService(threadId);

        // ------------------------------------------
        // REMOVE FROM SIDEBAR
        // ------------------------------------------

        setAllThreads((previous) =>
          previous.filter(
            (thread) =>
              thread.threadId !== threadId
          )
        );

        // ------------------------------------------
        // REMOVE SAVED SCROLL
        // ------------------------------------------

        sessionStorage.removeItem(
          `synapse_scroll_${threadId}`
        );

        // ------------------------------------------
        // IF CURRENT THREAD WAS DELETED
        // START NEW CHAT
        // ------------------------------------------

        if (currThreadId === threadId) {
          startNewChat();
        }
      } catch (error) {
        console.error(
          "Error deleting thread:",
          error
        );
      }
    },
    [currThreadId, startNewChat]
  );

  // ==================================================
  // RESTORE THREAD AFTER REFRESH
  // ==================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const initializeChat = async () => {
      const threads =
        await fetchThreads();

      if (cancelled) {
        return;
      }

      const savedThreadId =
        sessionStorage.getItem(
          "synapse_current_thread"
        );

      if (!savedThreadId) {
        return;
      }

      const exists =
        Array.isArray(threads) &&
        threads.some(
          (thread) =>
            thread.threadId ===
            savedThreadId
        );

      if (!exists) {
        return;
      }

      await loadThread(savedThreadId);
    };

    initializeChat();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    fetchThreads,
    loadThread,
  ]);

  // ==================================================
  // LOGOUT
  // ==================================================

  const logout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    sessionStorage.removeItem(
      "synapse_current_thread"
    );

    setUser(null);

    setPrevChats([]);

    setAllThreads([]);

    setReply("");

    setPrompt("");

    setNewChat(true);

    setIsHistoryChat(false);
  };

  // ==================================================
  // PROVIDER VALUES
  // ==================================================

  const providerValues = {
    prompt,
    setPrompt,

    reply,
    setReply,

    currThreadId,
    setCurrThreadId,

    prevChats,
    setPrevChats,

    newChat,
    setNewChat,

    allThreads,
    setAllThreads,

    voiceEnabled,
    setVoiceEnabled,

    user,
    setUser,

    // Important
    isHistoryChat,
    setIsHistoryChat,

    logout,

    fetchThreads,
    loadThread,
    startNewChat,
    deleteThread,
  };

  return (
    <MyContext.Provider value={providerValues}>
      {children}
    </MyContext.Provider>
  );
};