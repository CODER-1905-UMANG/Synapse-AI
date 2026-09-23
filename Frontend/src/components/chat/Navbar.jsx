import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { MyContext } from "../../context/MyContextDefinition";
import { useNavigate } from "react-router-dom";

const FALLBACK_AVATAR =
  "https://api.dicebear.com/7.x/identicon/svg";

const Navbar = () => {
  const {
    user,
    logout,
    voiceEnabled,
    setVoiceEnabled,
  } = useContext(MyContext);

  const navigate = useNavigate();

  const [isOpen, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    setOpen(false);

    logout();

    navigate("/auth");
  };

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleSettings = () => {
    setOpen(false);

    navigate("/settings");
  };

  // ==================================================
  // CLOSE DROPDOWN
  // ==================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] h-[76px] border-b border-white/[0.08] bg-black/70 backdrop-blur-xl">

      {/* ==================================================
          NAVBAR CONTENT
      ================================================== */}

      <div className="flex h-full items-center justify-between px-4 sm:px-6">

        {/* ==================================================
            BRAND
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate("/main")}
          className="group flex items-center gap-3 outline-none"
          aria-label="Go to Synapse AI home"
        >

          {/* Logo */}

          <div className="relative flex h-10 w-10 items-center justify-center">

            {/* Glow */}

            <div className="absolute inset-0 rounded-xl bg-purple-500/20 blur-lg transition duration-300 group-hover:bg-purple-500/35" />

            {/* Icon container */}

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20">

              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-purple-400"
              >
                <path
                  d="M12 3v18"
                  strokeLinecap="round"
                />

                <path
                  d="M3 12h18"
                  strokeLinecap="round"
                />

                <path
                  d="M5.5 5.5l13 13"
                  strokeLinecap="round"
                />

                <path
                  d="M18.5 5.5l-13 13"
                  strokeLinecap="round"
                />
              </svg>

            </div>
          </div>

          {/* Brand text */}

          <div className="flex flex-col items-start leading-none">

            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-lg font-semibold tracking-tight text-transparent sm:text-xl">
              Synapse
            </span>

            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.25em] text-gray-500">
              AI Workspace
            </span>

          </div>
        </button>

        {/* ==================================================
            USER MENU
        ================================================== */}

        <div
          ref={dropdownRef}
          className="relative"
        >

          {/* Avatar Button */}

          <button
            type="button"
            onClick={() =>
              setOpen((prev) => !prev)
            }
            className="group relative flex h-10 w-10 items-center justify-center rounded-full outline-none"
            aria-label="User menu"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >

            {/* Avatar glow */}

            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md transition duration-300 group-hover:bg-purple-500/35" />

            {/* Avatar */}

            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-purple-400/40 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 shadow-lg shadow-purple-500/10">

              <img
                src={
                  user?.avatar ||
                  FALLBACK_AVATAR
                }
                alt="User avatar"
                onError={(event) => {
                  event.currentTarget.src =
                    FALLBACK_AVATAR;
                }}
                className="h-full w-full object-cover"
              />

            </div>

          </button>

          {/* ==================================================
              DROPDOWN
          ================================================== */}

          <div
            className={`absolute right-0 top-[52px] w-64 origin-top-right overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0b0d]/95 shadow-2xl shadow-black/60 backdrop-blur-2xl transition-all duration-200 ${
              isOpen
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-2 scale-95 opacity-0"
            }`}
            role="menu"
          >

            {/* Small top glow */}

            <div className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

            {/* ==================================================
                USER INFO
            ================================================== */}

            <div className="border-b border-white/[0.08] px-4 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">

                  <img
                    src={
                      user?.avatar ||
                      FALLBACK_AVATAR
                    }
                    alt="User avatar"
                    onError={(event) => {
                      event.currentTarget.src =
                        FALLBACK_AVATAR;
                    }}
                    className="h-full w-full object-cover"
                  />

                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium text-white">
                    {user?.name ||
                      user?.username ||
                      "Synapse User"}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {user?.email ||
                      "AI Workspace"}
                  </p>

                </div>

              </div>

            </div>

            {/* ==================================================
                MENU ITEMS
            ================================================== */}

            <div className="p-1.5">

              {/* Upgrade */}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-300 transition hover:bg-purple-500/10 hover:text-white"
                role="menuitem"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 transition group-hover:bg-purple-500/20">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" />
                    <path d="M19 4v4" />
                    <path d="M17 6h4" />
                  </svg>
                </div>

                <div className="flex-1">

                  <p className="font-medium">
                    Upgrade Plan
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-600">
                    Unlock more AI features
                  </p>

                </div>

              </button>

              {/* Voice Mode */}

              <div
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm text-gray-300 transition hover:bg-white/[0.04]"
                role="menuitem"
              >

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">

                    <svg
                      width="17"
                      height="17"
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

                  </div>

                  <div>

                    <p className="font-medium text-white">
                      Voice Mode
                    </p>

                    <p className="text-[11px] text-gray-600">
                      Read responses aloud
                    </p>

                  </div>

                </div>

                {/* Toggle */}

                <button
                  type="button"
                  onClick={() =>
                    setVoiceEnabled(
                      !voiceEnabled
                    )
                  }
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    voiceEnabled
                      ? "bg-indigo-500"
                      : "bg-gray-700"
                  }`}
                  aria-label="Toggle voice mode"
                  aria-pressed={voiceEnabled}
                >

                  <span
                    className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      voiceEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />

                </button>

              </div>

              {/* Divider */}

              <div className="my-1.5 h-px bg-white/[0.06]" />

              {/* Settings */}

              <button
                type="button"
                onClick={handleSettings}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-300 transition hover:bg-white/[0.05] hover:text-white"
                role="menuitem"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-gray-400 transition group-hover:text-white">

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />

                    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.46 15a1.7 1.7 0 0 0-1.56-1.03H6.7v-2.4h.2A1.7 1.7 0 0 0 8.46 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.73 5.2V5h2.4v.2a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.4 10c.17.62.73 1.03 1.38 1.03H21v2.4h-.22A1.7 1.7 0 0 0 19.4 15Z" />
                  </svg>

                </div>

                <span>
                  Settings
                </span>

              </button>

              {/* Logout */}

              <button
                type="button"
                onClick={handleLogout}
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                role="menuitem"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/5 text-red-400/70 transition group-hover:bg-red-500/10 group-hover:text-red-400">

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                      strokeLinecap="round"
                    />

                    <path
                      d="M16 17l5-5-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M21 12H9"
                      strokeLinecap="round"
                    />
                  </svg>

                </div>

                <span>
                  Log out
                </span>

              </button>

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;