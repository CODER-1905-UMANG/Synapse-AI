import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Password validation
  // --------------------------------------------------

  const validatePassword = () => {
    if (password.length < 8) {
      toast.error(
        "Password must contain at least 8 characters."
      );
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Reset Password
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);

      toast.success(
        "Password reset successfully. Please login."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/auth");
      }, 1000);
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      toast.error(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-[15%] w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[140px]" />

        <div className="absolute -bottom-40 right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-700/10 blur-[140px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-7 sm:px-8 pt-8 pb-6 text-center border-b border-white/10">

            {/* Logo */}
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">

              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
              >
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                />

                <path d="M8 11V7a4 4 0 018 0v4" />

                <circle
                  cx="12"
                  cy="16"
                  r="1"
                />
              </svg>

            </div>

            <h1 className="text-2xl font-bold mt-5">
              Reset your password
            </h1>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Create a new password for your Synapse AI
              account.
            </p>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-7 sm:p-8"
          >

            {/* New Password */}
            <div>

              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>

              </div>

              <p className="text-xs text-gray-600 mt-2">
                Use at least 8 characters.
              </p>

            </div>

            {/* Confirm Password */}
            <div className="mt-5">

              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* Password Match */}
            {confirmPassword && (
              <div
                className={`mt-3 text-xs ${
                  password ===
                  confirmPassword
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {password ===
                confirmPassword
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20"
              }`}
            >

              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                  Resetting Password...
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
                    <path d="M12 15v2" />

                    <path d="M7 11V8a5 5 0 0110 0v3" />

                    <rect
                      x="5"
                      y="11"
                      width="14"
                      height="10"
                      rx="2"
                    />
                  </svg>

                  Reset Password
                </>
              )}

            </button>

            {/* Back */}
            <button
              type="button"
              onClick={() => navigate("/auth")}
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
            >
              ← Back to Login
            </button>

          </form>

          {/* Footer */}
          <div className="px-7 sm:px-8 py-5 border-t border-white/10 text-center">
            <p className="text-xs text-gray-600">
              Synapse AI • Secure Account Recovery
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ResetPassword;