import React, { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Image,
  Mic,
  FileText,
  FileSearch,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

import { MyContext } from "../../context/MyContextDefinition";

const AppSidebar = () => {
  const { user, logout } = useContext(MyContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleLogin = () => {
    closeSidebar();
    navigate("/auth");
  };

  const handleLogoutClick = () => {
    closeSidebar();
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate("/");
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: Home,
      exact: true,
    },
    {
      label: "AI Chat",
      path: "/main",
      icon: MessageSquare,
    },
    {
      label: "Image Studio",
      path: "/imagify",
      icon: Image,
    },
    {
      label: "Voice AI",
      path: "/voicefy",
      icon: Mic,
    },
    {
      label: "AI Summarizer",
      path: "/summarizer",
      icon: FileText,
    },
    {
      label: "Resume Analyzer",
      path: "/resume",
      icon: FileSearch,
    },
    {
      label: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* =====================================================
          MOBILE MENU BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-4 z-[70] flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/80 text-gray-300 shadow-xl backdrop-blur-xl transition hover:bg-white/10 hover:text-white md:hidden"
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {isOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm md:hidden"
          aria-label="Close navigation"
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-[65] flex h-screen w-[270px] flex-col border-r border-white/10 bg-[#07070a]/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <button
            type="button"
            onClick={() => {
              closeSidebar();
              navigate("/");
            }}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg shadow-purple-900/30">
              <Sparkles size={20} className="text-white" />
            </div>

            <div className="text-left">
              <h1 className="text-base font-bold tracking-wide text-white">
                Synapse
              </h1>

              <p className="text-[10px] uppercase tracking-[0.18em] text-purple-400">
                AI Workspace
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={closeSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-600">
            Workspace
          </p>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? "border border-purple-500/20 bg-purple-500/10 text-purple-300 shadow-sm shadow-purple-900/10"
                        : "border border-transparent text-gray-400 hover:bg-white/[0.045] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                          isActive
                            ? "bg-purple-500/15 text-purple-400"
                            : "bg-white/[0.03] text-gray-500 group-hover:bg-white/[0.06] group-hover:text-gray-300"
                        }`}
                      >
                        <Icon size={17} />
                      </div>

                      <span className="flex-1">{item.label}</span>

                      {isActive && (
                        <ChevronRight
                          size={14}
                          className="text-purple-400"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* =================================================
              AI TOOLS LABEL
          ================================================= */}

          <div className="my-6 border-t border-white/5" />

          <div className="rounded-2xl border border-purple-500/10 bg-gradient-to-br from-purple-500/[0.06] to-indigo-500/[0.03] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                <Sparkles size={16} className="text-purple-400" />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-200">
                  Synapse AI
                </p>

                <p className="mt-1 text-[11px] leading-5 text-gray-500">
                  Your unified AI productivity workspace.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            USER / AUTH SECTION
        ================================================= */}

        <div className="shrink-0 border-t border-white/10 p-3">
          {user ? (
            <>
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.025] px-3 py-3">
                <img
                  src={
                    user.avatar ||
                    "https://api.dicebear.com/7.x/identicon/svg"
                  }
                  alt="Profile"
                  className="h-9 w-9 rounded-lg border border-purple-500/20 bg-white/5 object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-200">
                    {user.username || "User"}
                  </p>

                  <p className="truncate text-[11px] text-gray-600">
                    {user.email || "Synapse account"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-gray-500 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03]">
                  <LogOut size={17} />
                </div>

                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:from-purple-500 hover:to-indigo-500"
            >
              <LogIn size={17} />
              Login
            </button>
          )}
        </div>
      </aside>

      {/* =====================================================
          LOGOUT CONFIRMATION MODAL
      ===================================================== */}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b10] shadow-2xl shadow-black/60">
            {/* Modal Header */}

            <div className="border-b border-white/10 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Log out of Synapse AI?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    You will need to log in again to access your workspace.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}

            <div className="flex gap-3 px-6 py-5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 rounded-xl bg-red-500/90 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSidebar;