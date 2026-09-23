import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "../../context/MyContextDefinition";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { updateProfile } from "../../services/authService";

const DEFAULT_AVATAR =
  "https://api.dicebear.com/7.x/identicon/svg";

const Settings = () => {
  const {
    user,
    setUser,
    voiceEnabled,
    setVoiceEnabled,
  } = useContext(MyContext);

  const navigate = useNavigate();

  const [username, setUsername] = useState(
    user?.username || ""
  );

  const [email] = useState(user?.email || "");

  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || DEFAULT_AVATAR
  );

  const [avatarFile, setAvatarFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Sync user data
  // --------------------------------------------------

  useEffect(() => {
    setUsername(user?.username || "");
    setAvatarPreview(user?.avatar || DEFAULT_AVATAR);
  }, [user]);

  // --------------------------------------------------
  // Avatar Upload
  // --------------------------------------------------

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB.");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  // --------------------------------------------------
  // Save Profile
  // --------------------------------------------------

  const handleSave = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again.");
        navigate("/auth");
        return;
      }

      const formData = new FormData();

      formData.append(
        "username",
        username.trim()
      );

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const data = await updateProfile(formData);

      if (data?.user) {
        setUser(data.user);
      }

      setAvatarFile(null);

      toast.success("Profile updated successfully.");
    } catch (error) {
      console.error(
        "Settings update error:",
        error
      );

      toast.error(
        error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Voice Toggle
  // --------------------------------------------------

  const handleVoiceToggle = (e) => {
    const enabled = e.target.checked;

    setVoiceEnabled(enabled);

    toast.success(
      enabled
        ? "Voice mode enabled."
        : "Voice mode disabled."
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#050507] text-white">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-[15%] w-[500px] h-[500px] rounded-full bg-purple-700/10 blur-[140px]" />

        <div className="absolute -bottom-40 right-[10%] w-[500px] h-[500px] rounded-full bg-indigo-700/10 blur-[140px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8">

          <button
            onClick={() => navigate("/main")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-6"
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

            Back to Synapse
          </button>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Settings
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your Synapse AI account and preferences.
            </p>
          </div>

        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-[220px_1fr] gap-6">

          {/* Sidebar */}
          <aside className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-3 h-fit">

            <button
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 text-purple-300 text-sm font-medium text-left"
            >
              <span>👤</span>
              Account
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("preferences")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white text-sm transition-all text-left"
            >
              <span>🎛️</span>
              Preferences
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("security")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white text-sm transition-all text-left"
            >
              <span>🔒</span>
              Security
            </button>

          </aside>

          {/* Content */}
          <div className="space-y-6">

            {/* -------------------------------- */}
            {/* Profile */}
            {/* -------------------------------- */}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden">

              <div className="px-6 py-5 border-b border-white/10">
                <h2 className="text-lg font-semibold">
                  Profile
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Manage your personal account information.
                </p>
              </div>

              <form
                onSubmit={handleSave}
                className="p-6"
              >

                {/* Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                  <img
                    src={avatarPreview}
                    alt="Profile avatar"
                    className="w-20 h-20 rounded-2xl object-cover border border-purple-500/30 shadow-lg shadow-purple-900/20"
                  />

                  <div>

                    <p className="font-medium">
                      Profile Picture
                    </p>

                    <p className="text-sm text-gray-500 mt-1 mb-3">
                      JPG, PNG or WEBP. Maximum 2MB.
                    </p>

                    <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all text-sm font-medium">

                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 16V4" />
                        <path d="M7 9l5-5 5 5" />
                        <path d="M5 20h14" />
                      </svg>

                      Upload Picture

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />

                    </label>

                  </div>

                </div>

                {/* Inputs */}
                <div className="grid md:grid-cols-2 gap-5 mt-8">

                  <div>

                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Username
                    </label>

                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      placeholder="Enter your username"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-600 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all disabled:opacity-50"
                    />

                  </div>

                  <div>

                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>

                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-gray-500 cursor-not-allowed"
                    />

                    <p className="text-xs text-gray-600 mt-2">
                      Email address cannot be changed here.
                    </p>

                  </div>

                </div>

                {/* Save */}
                <div className="mt-6 flex justify-end">

                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-semibold transition-all flex items-center gap-2 ${
                      loading
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/20"
                    }`}
                  >

                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                          <path d="M17 21v-8H7v8" />
                          <path d="M7 3v5h8" />
                        </svg>

                        Save Changes
                      </>
                    )}

                  </button>

                </div>

              </form>

            </section>

            {/* -------------------------------- */}
            {/* Preferences */}
            {/* -------------------------------- */}

            <section
              id="preferences"
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
            >

              <div className="px-6 py-5 border-b border-white/10">

                <h2 className="text-lg font-semibold">
                  Preferences
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Control how Synapse AI behaves for you.
                </p>

              </div>

              <div className="p-6">

                <div className="flex items-center justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                      🎙️
                    </div>

                    <div>

                      <p className="font-medium">
                        Voice Mode
                      </p>

                      <p className="text-sm text-gray-500 mt-1 max-w-xl">
                        Allow Synapse AI to use voice interaction
                        and spoken responses.
                      </p>

                    </div>

                  </div>

                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">

                    <input
                      type="checkbox"
                      checked={voiceEnabled}
                      onChange={handleVoiceToggle}
                      className="sr-only peer"
                    />

                    <div className="w-12 h-7 bg-gray-700 rounded-full peer-checked:bg-purple-600 transition-all" />

                    <span
                      className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        voiceEnabled
                          ? "translate-x-5"
                          : ""
                      }`}
                    />

                  </label>

                </div>

              </div>

            </section>

            {/* -------------------------------- */}
            {/* Security */}
            {/* -------------------------------- */}

            <section
              id="security"
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
            >

              <div className="px-6 py-5 border-b border-white/10">

                <h2 className="text-lg font-semibold">
                  Security
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Manage your password and account security.
                </p>

              </div>

              <div className="p-6">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      🔐
                    </div>

                    <div>

                      <p className="font-medium">
                        Password
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Change your account password.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/settings/password")
                    }
                    className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium transition-all"
                  >
                    Change Password
                  </button>

                </div>

              </div>

            </section>

            {/* -------------------------------- */}
            {/* Danger Zone */}
            {/* -------------------------------- */}

            <section className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] overflow-hidden">

              <div className="px-6 py-5 border-b border-red-500/10">

                <h2 className="text-lg font-semibold text-red-400">
                  Danger Zone
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Actions in this section may affect your account.
                </p>

              </div>

              <div className="p-6">

                <div className="flex items-center justify-between gap-5">

                  <div>

                    <p className="font-medium">
                      Account Deletion
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Permanently delete your Synapse AI account.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      toast(
                        "Account deletion can be added later.",
                        {
                          icon: "⚠️",
                        }
                      )
                    }
                    className="px-4 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
                  >
                    Delete Account
                  </button>

                </div>

              </div>

            </section>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Settings;