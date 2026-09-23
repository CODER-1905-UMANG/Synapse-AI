import React, { useContext, useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";

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
  LogIn,
  LogOut,
  AlertTriangle,
} from "lucide-react";

import { MyContext } from "../../context/MyContextDefinition";
// ==================================================
// Navigation Items
// ==================================================

const navigationItems = [
  {
    to: "/main",
    label: "AI Chat",
    icon: MessageSquare,
  },
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

// ==================================================
// Sidebar
// ==================================================

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();

  const { user, logout } = useContext(MyContext);

  // ==================================================
  // Close Sidebar
  // ==================================================

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // ==================================================
  // Login
  // ==================================================

  const handleLogin = () => {
    closeSidebar();
    navigate("/auth");
  };

  // ==================================================
  // Open Logout Confirmation
  // ==================================================

  const handleLogoutClick = () => {
    closeSidebar();
    setShowLogoutModal(true);
  };

  // ==================================================
  // Confirm Logout
  // ==================================================

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);

    logout();

    navigate("/");
  };

  // ==================================================
  // Cancel Logout
  // ==================================================

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // ==================================================
  // Render
  // ==================================================

  return (
    <>
      {/* ==================================================
          Mobile Hamburger
      ================================================== */}

      <div className="fixed left-4 top-4 z-[60] md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          className="
            rounded-xl
            border border-white/10
            bg-black/70
            p-2.5
            text-white
            shadow-lg
            backdrop-blur-md
            transition-all
            hover:border-purple-400/30
            hover:bg-white/10
          "
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ==================================================
          Sidebar
      ================================================== */}

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
          p-5
          shadow-[0_0_40px_rgba(0,0,0,0.5)]
          backdrop-blur-xl
          transition-transform
          duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* ==================================================
            Logo
        ================================================== */}

        <div className="mb-8 flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-purple-500
              to-indigo-500
              shadow-lg
              shadow-purple-500/20
            "
          >
            <Sparkles
              size={20}
              className="text-white"
            />
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

        {/* ==================================================
            Workspace
        ================================================== */}

        <nav className="flex-1">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Workspace
          </p>

          <ul className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `
                      group
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? `
                            bg-gradient-to-r
                            from-purple-500/15
                            to-indigo-500/10
                            text-white
                            shadow-[inset_0_0_20px_rgba(139,92,246,0.05)]
                          `
                          : `
                            text-gray-400
                            hover:bg-white/[0.05]
                            hover:text-white
                          `
                      }
                    `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={19}
                          className={`
                            transition-colors
                            ${
                              isActive
                                ? "text-purple-400"
                                : "text-gray-500 group-hover:text-purple-400"
                            }
                          `}
                        />

                        <span className="text-sm font-medium">
                          {item.label}
                        </span>

                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* ==================================================
              Settings
          ================================================== */}

          <div className="mt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
              Account
            </p>

            <NavLink
              to="/settings"
              onClick={closeSidebar}
              className={({ isActive }) =>
                `
                group
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                transition-all
                duration-200
                ${
                  isActive
                    ? "bg-white/[0.07] text-white"
                    : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                }
              `
              }
            >
              {({ isActive }) => (
                <>
                  <Settings
                    size={19}
                    className={
                      isActive
                        ? "text-purple-400"
                        : "text-gray-500 group-hover:text-purple-400"
                    }
                  />

                  <span className="text-sm font-medium">
                    Settings
                  </span>
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* ==================================================
            Bottom Section
        ================================================== */}

        <div className="mt-auto">
          {/* AI Workspace Card */}

          <div
            className="
              mb-4
              rounded-2xl
              border
              border-purple-500/10
              bg-gradient-to-br
              from-purple-500/[0.08]
              to-indigo-500/[0.04]
              p-4
            "
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-purple-400"
              />

              <span className="text-xs font-semibold text-white">
                Synapse AI
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-gray-500">
              Your unified workspace for AI-powered productivity.
            </p>
          </div>

          {/* ==================================================
              Login / Logout
          ================================================== */}

          {user ? (
            <button
              onClick={handleLogoutClick}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-indigo-500
                px-5
                py-3
                font-semibold
                text-white
                shadow-lg
                shadow-purple-500/20
                transition-all
                hover:scale-[1.02]
                hover:shadow-purple-500/30
                active:scale-[0.98]
              "
            >
              <LogOut size={18} />

              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-purple-500
                to-indigo-500
                px-5
                py-3
                font-semibold
                text-white
                shadow-lg
                shadow-purple-500/20
                transition-all
                hover:scale-[1.02]
                hover:shadow-purple-500/30
                active:scale-[0.98]
              "
            >
              <LogIn size={18} />

              Login
            </button>
          )}

          <p className="mt-4 text-center text-[10px] text-gray-600">
            © {new Date().getFullYear()} Synapse AI
          </p>
        </div>
      </aside>

      {/* ==================================================
          Mobile Overlay
      ================================================== */}

      {isOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/60
            backdrop-blur-sm
            md:hidden
          "
          onClick={closeSidebar}
        />
      )}

      {/* ==================================================
          Logout Confirmation Modal
      ================================================== */}

      {showLogoutModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/70
            px-4
            backdrop-blur-md
          "
          onClick={handleCancelLogout}
        >
          <div
            className="
              w-full
              max-w-sm
              rounded-3xl
              border
              border-white/10
              bg-[#0b0b10]
              p-6
              shadow-[0_20px_80px_rgba(0,0,0,0.7)]
              animate-in
              fade-in
              zoom-in-95
              duration-200
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}

            <div className="flex justify-center">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-purple-500/20
                  bg-purple-500/10
                "
              >
                <AlertTriangle
                  size={25}
                  className="text-purple-400"
                />
              </div>
            </div>

            {/* Heading */}

            <div className="mt-5 text-center">
              <h3 className="text-xl font-semibold text-white">
                Log out of Synapse AI?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                Are you sure you want to log out? Your current
                session will be ended.
              </p>
            </div>

            {/* Buttons */}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCancelLogout}
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-gray-300
                  transition-all
                  hover:bg-white/[0.08]
                  hover:text-white
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="
                  rounded-xl
                  bg-gradient-to-r
                  from-purple-600
                  to-indigo-600
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-purple-900/20
                  transition-all
                  hover:from-purple-500
                  hover:to-indigo-500
                "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;