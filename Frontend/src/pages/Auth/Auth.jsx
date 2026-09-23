import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { MyContext } from "../../context/MyContextDefinition";

import {
  forgotPassword,
  googleLogin,
  login,
  register,
} from "../../services/authService";

/*
|--------------------------------------------------------------------------
| Google Identity Services
|--------------------------------------------------------------------------
*/

let googleInitialized = false;
let googleClientIdUsed = "";

const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fill="#4285F4"
      d="M21.35 12.23c0-.72-.06-1.42-.18-2.09H12v3.96h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.23Z"
    />

    <path
      fill="#34A853"
      d="M12 21.5c2.63 0 4.84-.87 6.45-2.34l-3.14-2.43c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.5Z"
    />

    <path
      fill="#FBBC05"
      d="M6.54 13.63a5.86 5.86 0 0 1 0-3.26v-2.5H3.3a9.75 9.75 0 0 0 0 8.26l3.24-2.5Z"
    />

    <path
      fill="#EA4335"
      d="M12 6.34c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.47 14.63 2.5 12 2.5A9.75 9.75 0 0 0 3.3 7.87l3.24 2.5C7.31 8.06 9.46 6.34 12 6.34Z"
    />
  </svg>
);

const AuthForm = () => {
  // ==================================================
  // STATE
  // ==================================================

  const [isLogin, setIsLogin] = useState(true);
  const [forgotModal, setForgotModal] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const googleCredentialHandlerRef = useRef(null);

  const navigate = useNavigate();
  const { setUser } = useContext(MyContext);

  // ==================================================
  // REDIRECT AFTER LOGIN
  // ==================================================

  const redirectAfterLogin = useCallback(() => {
    const redirectPath =
      localStorage.getItem("redirectAfterLogin");

    if (redirectPath) {
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
    } else {
      navigate("/main");
    }
  }, [navigate]);

  // ==================================================
  // GOOGLE LOGIN CALLBACK
  // ==================================================

  const handleGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        setGoogleLoading(false);
        alert("Google authentication failed.");
        return;
      }

      try {
        setGoogleLoading(true);

        const data = await googleLogin(
          response.credential
        );

        setUser(data.user);

        redirectAfterLogin();
      } catch (error) {
        console.error(
          "Google login error:",
          error
        );

        alert(
          error.message ||
            "Google login failed. Please try again."
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [setUser, redirectAfterLogin]
  );

  // ==================================================
  // KEEP LATEST GOOGLE CALLBACK
  // ==================================================

  useEffect(() => {
    googleCredentialHandlerRef.current =
      handleGoogleCredential;
  }, [handleGoogleCredential]);

  // ==================================================
  // LOAD GOOGLE IDENTITY SERVICES
  // ==================================================

  useEffect(() => {
    if (!isLogin) {
      setGoogleReady(false);
      return;
    }

    let cancelled = false;
    let existingScript = null;

    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is not configured."
      );

      setGoogleReady(false);
      return;
    }

    const googleCallback = (response) => {
      if (
        googleCredentialHandlerRef.current
      ) {
        googleCredentialHandlerRef.current(
          response
        );
      }
    };

    const initializeGoogle = () => {
      if (cancelled) {
        return;
      }

      if (!window.google?.accounts?.id) {
        console.error(
          "Google Identity Services is unavailable."
        );

        setGoogleReady(false);
        return;
      }

      /*
       * Initialize Google only once.
       */
      if (
        !googleInitialized ||
        googleClientIdUsed !== clientId
      ) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: googleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        googleInitialized = true;
        googleClientIdUsed = clientId;
      }

      setGoogleReady(true);
    };

    existingScript = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    // Google is already available.
    if (window.google?.accounts?.id) {
      initializeGoogle();
    }

    // Script exists but hasn't loaded yet.
    else if (existingScript) {
      existingScript.addEventListener(
        "load",
        initializeGoogle
      );
    }

    // Load Google script.
    else {
      const script =
        document.createElement("script");

      script.src =
        "https://accounts.google.com/gsi/client";

      script.async = true;
      script.defer = true;

      script.onload = initializeGoogle;

      script.onerror = () => {
        console.error(
          "Failed to load Google Identity Services."
        );

        setGoogleReady(false);
      };

      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;

      if (existingScript) {
        existingScript.removeEventListener(
          "load",
          initializeGoogle
        );
      }
    };
  }, [isLogin]);

  // ==================================================
  // CUSTOM GOOGLE BUTTON
  // ==================================================

  const handleGoogleLogin = () => {
    if (googleLoading) {
      return;
    }

    if (!window.google?.accounts?.id) {
      alert(
        "Google Sign-In is still loading. Please try again."
      );
      return;
    }

    if (!googleReady) {
      alert(
        "Google Sign-In is still loading. Please try again."
      );
      return;
    }

    try {
      setGoogleLoading(true);

      /*
       * We use Google's Identity Services prompt
       * instead of Google's rendered button.
       *
       * This lets Synapse completely control the
       * appearance of the button.
       */
      window.google.accounts.id.prompt(
        (notification) => {
          if (
            notification.isNotDisplayed?.()
          ) {
            console.warn(
              "Google prompt was not displayed:",
              notification.getNotDisplayedReason?.()
            );

            setGoogleLoading(false);
          }

          if (
            notification.isSkippedMoment?.()
          ) {
            console.warn(
              "Google prompt was skipped:",
              notification.getSkippedReason?.()
            );

            setGoogleLoading(false);
          }

          if (
            notification.isDismissedMoment?.()
          ) {
            setGoogleLoading(false);
          }
        }
      );
    } catch (error) {
      console.error(
        "Google Sign-In error:",
        error
      );

      setGoogleLoading(false);

      alert(
        "Unable to start Google Sign-In. Please try again."
      );
    }
  };

  // ==================================================
  // LOGIN / REGISTER
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !isLogin &&
      password !== confirmPassword
    ) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // ==================================================
      // LOGIN
      // ==================================================

      if (isLogin) {
        const data = await login(
          username,
          password
        );

        setUser(data.user);

        redirectAfterLogin();
      }

      // ==================================================
      // REGISTER
      // ==================================================

      else {
        await register(
          username,
          email,
          password
        );

        alert(
          "Registration successful! Please login."
        );

        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error(
        "Authentication error:",
        error
      );

      alert(
        error.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // ==================================================
  // FORGOT PASSWORD
  // ==================================================

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert(
        "Please enter your email address."
      );

      return;
    }

    try {
      await forgotPassword(email);

      alert(
        "Reset link sent to your email!"
      );

      setForgotModal(false);
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      alert(
        error.message ||
          "Unable to send reset link. Please try again."
      );
    }
  };

  // ==================================================
  // SWITCH LOGIN / REGISTER
  // ==================================================

  const switchAuthMode = () => {
    setIsLogin((previous) => !previous);

    setPassword("");
    setConfirmPassword("");
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03030d] px-4 py-6 text-white">

      {/* ==================================================
          BACKGROUND
      ================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-purple-700/25 blur-[90px]" />

        <div className="absolute -left-32 -top-32 h-[340px] w-[340px] rounded-full border border-purple-500/15" />

        <div className="absolute -left-24 -top-24 h-[280px] w-[280px] rounded-full border border-purple-500/10" />

        <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-indigo-700/20 blur-[100px]" />

        <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full border border-indigo-500/15" />

        <div className="absolute -bottom-28 -right-28 h-[330px] w-[330px] rounded-full border border-indigo-500/10" />

        <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/5 blur-[120px]" />

        <div className="absolute left-[12%] top-[30%] h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.9)]" />

        <div className="absolute right-[13%] top-[28%] h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.9)]" />

        <div className="absolute right-[17%] bottom-[24%] h-1.5 w-1.5 rounded-full bg-purple-300 shadow-[0_0_12px_rgba(192,132,252,0.9)]" />

      </div>

      {/* ==================================================
          SIDE TEXT
      ================================================== */}

      <div className="pointer-events-none fixed left-8 top-1/2 hidden -translate-y-1/2 lg:block xl:left-12">

        <p className="max-w-[100px] text-sm leading-6 text-purple-300/70">
          Better
          <br />
          Ideas
          <br />
          A Smarter
          <br />
          Tomorrow.
        </p>

        <div className="mt-4 h-[3px] w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500" />

      </div>

      <div className="pointer-events-none fixed right-8 top-1/2 hidden -translate-y-1/2 lg:block xl:right-12">

        <p className="max-w-[100px] text-sm leading-6 text-purple-300/70">
          Think
          <br />
          Create
          <br />
          Explore
          <br />
          with AI.
        </p>

        <div className="mt-4 h-[3px] w-8 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500" />

      </div>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <div className="relative z-10 flex min-h-[calc(100vh-48px)] items-center justify-center">

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
          className="w-full max-w-[520px]"
        >

          {/* ==================================================
              AUTH CARD
          ================================================== */}

          <div className="relative overflow-hidden rounded-[26px] border border-purple-400/60 bg-[#080c19]/95 px-6 py-7 shadow-[0_0_60px_rgba(139,92,246,0.13)] backdrop-blur-xl sm:px-9 sm:py-8">

            <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/10 blur-[90px]" />

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="relative text-center">

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                }}
                className="mx-auto mb-2 flex h-12 w-12 items-center justify-center"
              >
                <BrainCircuit
                  size={46}
                  strokeWidth={1.7}
                  className="text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                />
              </motion.div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-[32px]">

                {isLogin ? (
                  <>
                    Login to{" "}

                    <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      Synapse AI
                    </span>
                  </>
                ) : (
                  <>
                    Create an{" "}

                    <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                      Account
                    </span>
                  </>
                )}

              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Your intelligent companion for a
                smarter tomorrow
              </p>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <AnimatePresence mode="wait">

              {isLogin ? (

                <motion.form
                  key="login"
                  onSubmit={handleSubmit}
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: 15,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="relative mt-6 space-y-4"
                >

                  {/* Username */}

                  <div className="relative">

                    <UserRound
                      size={20}
                      strokeWidth={1.8}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                        )
                      }
                      className="h-[54px] w-full rounded-xl border border-slate-600/70 bg-[#172131] pl-14 pr-5 text-base text-white outline-none transition placeholder:text-gray-400 hover:border-purple-400/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10"
                      required
                    />

                  </div>

                  {/* Password */}

                  <div className="relative">

                    <LockKeyhole
                      size={20}
                      strokeWidth={1.8}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      className="h-[54px] w-full rounded-xl border border-slate-600/70 bg-[#172131] pl-14 pr-14 text-base text-white outline-none transition placeholder:text-gray-400 hover:border-purple-400/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-purple-300"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>

                  </div>

                  {/* Forgot Password */}

                  <div className="-mt-1 flex justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        setForgotModal(true)
                      }
                      className="text-sm font-medium text-purple-400 transition hover:text-purple-300 hover:underline"
                    >
                      Forgot Password?
                    </button>

                  </div>

                  {/* Login Button */}

                  <button
                    type="submit"
                    className="group flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-base font-bold text-white shadow-[0_0_28px_rgba(168,85,247,0.25)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(168,85,247,0.38)] active:scale-[0.99]"
                  >
                    Login

                    <ArrowRight
                      size={21}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />

                  </button>

                  {/* Divider */}

                  <div className="flex items-center gap-4 py-1">

                    <div className="h-px flex-1 bg-gray-600/70" />

                    <span className="text-sm font-medium text-gray-500">
                      OR
                    </span>

                    <div className="h-px flex-1 bg-gray-600/70" />

                  </div>

                  {/* ==================================================
                      CUSTOM GOOGLE LOGIN BUTTON
                  ================================================== */}

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="flex h-[50px] w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 text-black shadow-md transition-all duration-200 hover:bg-gray-50 hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                  >

                    <GoogleIcon />

                    <span className="text-[15px] font-semibold text-black">
                      {googleLoading
                        ? "Signing in..."
                        : "Continue with Google"}
                    </span>

                  </button>

                </motion.form>

              ) : (

                <motion.form
                  key="register"
                  onSubmit={handleSubmit}
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: -15,
                  }}
                  transition={{
                    duration: 0.3,
                  }}
                  className="relative mt-6 space-y-4"
                >

                  {/* Username */}

                  <div className="relative">

                    <UserRound
                      size={20}
                      strokeWidth={1.8}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                        )
                      }
                      className="h-[54px] w-full rounded-xl border border-slate-600/70 bg-[#172131] pl-14 pr-5 text-base text-white outline-none transition placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />

                  </div>

                  {/* Email */}

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    className="h-[54px] w-full rounded-xl border border-slate-600/70 bg-[#172131] px-5 text-base text-white outline-none transition placeholder:text-gray-400 focus:border-purple-400"
                    required
                  />

                  {/* Password */}

                  <div className="relative">

                    <LockKeyhole
                      size={20}
                      strokeWidth={1.8}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      className="h-[54px] w-full rounded-xl border border-slate-600/70 bg-[#172131] pl-14 pr-14 text-base text-white outline-none transition placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300"
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>

                  </div>

                  {/* Confirm Password */}

                  <div className="relative">

                    <LockKeyhole
                      size={20}
                      strokeWidth={1.8}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type={
                        showConfirm
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      className="h-[54px] w-full rounded-xl border border-slate-600/70 bg-[#172131] pl-14 pr-14 text-base text-white outline-none transition placeholder:text-gray-400 focus:border-purple-400"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirm(
                          !showConfirm
                        )
                      }
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-300"
                    >
                      {showConfirm ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>

                  </div>

                  {/* Register Button */}

                  <button
                    type="submit"
                    className="group flex h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 text-base font-bold text-white shadow-[0_0_28px_rgba(168,85,247,0.25)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(168,85,247,0.38)] active:scale-[0.99]"
                  >
                    Create Account

                    <ArrowRight
                      size={21}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />

                  </button>

                </motion.form>
              )}

            </AnimatePresence>

            {/* ==================================================
                SWITCH LOGIN / REGISTER
            ================================================== */}

            <div className="relative mt-6 text-center text-sm text-gray-400">

              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}{" "}

              <button
                type="button"
                onClick={switchAuthMode}
                className="font-semibold text-purple-400 transition hover:text-purple-300 hover:underline"
              >
                {isLogin
                  ? "Register"
                  : "Login"}
              </button>

            </div>

          </div>

        </motion.div>

      </div>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="relative z-10 mt-2 text-center">

        <p className="text-xs font-semibold tracking-[0.35em] text-fuchsia-400/90">
          SYNAPSE AI
        </p>

        <p className="mt-1 text-[9px] tracking-[0.28em] text-gray-500">
          POWERING A SMARTER TOMORROW
        </p>

      </div>

      {/* ==================================================
          FORGOT PASSWORD MODAL
      ================================================== */}

      {forgotModal && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
        >

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-[#080c19] p-7 shadow-[0_0_60px_rgba(139,92,246,0.2)]"
          >

            <h3 className="text-center text-xl font-bold text-white">
              Reset Password
            </h3>

            <p className="mt-2 text-center text-sm text-gray-400">
              Enter your email and we'll send you
              a password reset link.
            </p>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Enter your email"
              className="mt-5 h-[52px] w-full rounded-xl border border-slate-600/70 bg-[#172131] px-4 text-white outline-none placeholder:text-gray-400 focus:border-purple-400"
            />

            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-4 h-[52px] w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 font-semibold text-white transition hover:from-purple-600 hover:to-indigo-600"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() =>
                setForgotModal(false)
              }
              className="mt-3 h-[45px] w-full text-sm text-gray-400 transition hover:text-white"
            >
              Cancel
            </button>

          </motion.div>

        </motion.div>
      )}

    </div>
  );
};

export default AuthForm;