import { apiRequest } from "./api";

// ==================================================
// LOGIN
// ==================================================

export const login = async (username, password) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

// ==================================================
// GOOGLE LOGIN
// ==================================================

export const googleLogin = async (credential) => {
  const response = await apiRequest("/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      credential,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Google login failed");
  }

  // Store the same Synapse JWT used by normal login
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};

// ==================================================
// REGISTER
// ==================================================

export const register = async (
  username,
  email,
  password
) => {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  return data;
};

// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPassword = async (email) => {
  const response = await apiRequest("/auth/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to send reset link"
    );
  }

  return data;
};

// ==================================================
// RESET PASSWORD
// ==================================================

export const resetPassword = async (token, password) => {
  const response = await apiRequest(
    `/auth/reset-password/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Password reset failed"
    );
  }

  return data;
};

// ==================================================
// UPDATE PROFILE
// ==================================================

export const updateProfile = async (formData) => {
  const response = await apiRequest("/user/update", {
    method: "PUT",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Profile update failed"
    );
  }

  if (data.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  return data;
};

// ==================================================
// CHANGE PASSWORD
// ==================================================

export const changePassword = async (
  currentPassword,
  newPassword
) => {
  const response = await apiRequest("/user/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: currentPassword,
      newPassword,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to change password"
    );
  }

  return data;
};