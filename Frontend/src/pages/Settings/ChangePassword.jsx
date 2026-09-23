import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePassword } from "../../services/authService";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Password validation
  // --------------------------------------------------

  const validatePassword = () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return false;
    }

    if (newPassword.length < 8) {
      toast.error(
        "New password must contain at least 8 characters."
      );
      return false;
    }

    if (newPassword === currentPassword) {
      toast.error(
        "New password must be different from your current password."
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return false;
    }

    return true;
  };

  // --------------------------------------------------
  // Change Password
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Your session has expired. Please login again."
        );
        navigate("/auth");
        return;
      }

      await changePassword(
        currentPassword,
        newPassword
      );

      toast.success("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/settings");
      }, 1000);
    } catch (error) {
      console.error(
        "Change password error:",
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
  // Password visibility button
  // --------------------------------------------------

  const EyeButton = ({ visible, onClick }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        tabIndex={-1}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-[10%] w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[140px]" />

        <div className="absolute -bottom-40 right-[5%] w-[500px] h-[500px] rounded-full bg-indigo-700/10 blur-[140px]" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-5"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>

          Back to Settings
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-7 sm:px-8 py-7 border-b border-white/10">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">

                <svg
                  width="23"
                  height="23"
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

              <div>
                <h1 className="text-2xl font-bold">
                  Change Password
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Keep your Synapse AI account secure.
                </p>
              </div>

            </div>

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-7 sm:p-8"
          >

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>

              <div className="relative">

                <input
                  type={
                    showCurrent
                      ? "text"
                      : "password"
                  }
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                  required
                />

                <EyeButton
                  visible={showCurrent}
                  onClick={() =>
                    setShowCurrent(
                      (prev) => !prev
                    )
                  }
                />

              </div>
            </div>

            {/* New Password */}
            <div className="mt-6">

              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showNew
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                  required
                />

                <EyeButton
                  visible={showNew}
                  onClick={() =>
                    setShowNew(
                      (prev) => !prev
                    )
                  }
                />

              </div>

              {/* Password requirements */}
              <div className="mt-3 space-y-1">

                <p
                  className={`text-xs ${
                    newPassword.length >= 8
                      ? "text-emerald-400"
                      : "text-gray-600"
                  }`}
                >
                  {newPassword.length >= 8
                    ? "✓"
                    : "○"}{" "}
                  At least 8 characters
                </p>

                <p
                  className={`text-xs ${
                    newPassword &&
                    newPassword !== currentPassword
                      ? "text-emerald-400"
                      : "text-gray-600"
                  }`}
                >
                  {newPassword &&
                  newPassword !== currentPassword
                    ? "✓"
                    : "○"}{" "}
                  Different from current password
                </p>

              </div>

            </div>

            {/* Confirm Password */}
            <div className="mt-6">

              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                  required
                />

                <EyeButton
                  visible={showConfirm}
                  onClick={() =>
                    setShowConfirm(
                      (prev) => !prev
                    )
                  }
                />

              </div>

              {confirmPassword && (
                <p
                  className={`text-xs mt-2 ${
                    newPassword ===
                    confirmPassword
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {newPassword ===
                  confirmPassword
                    ? "✓ Passwords match"
                    : "✕ Passwords do not match"}
                </p>
              )}

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20"
              }`}
            >

              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                  Updating Password...
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

                  Update Password
                </>
              )}

            </button>

          </form>

          {/* Footer */}
          <div className="px-7 sm:px-8 py-5 border-t border-white/10 text-center">
            <p className="text-xs text-gray-600">
              Your password is securely encrypted.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ChangePassword;