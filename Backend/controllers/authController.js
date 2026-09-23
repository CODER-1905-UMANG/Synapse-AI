import {
  registerUser,
  loginUser,
  loginWithGoogle,
  forgotPassword,
  resetPassword,
} from "../services/authService.js";

// ==================================================
// REGISTER
// ==================================================

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(
      "Error registering user:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message || "Server error",
    });
  }
};

// ==================================================
// LOGIN
// ==================================================

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message || "Server error",
    });
  }
};

// ==================================================
// GOOGLE LOGIN
// ==================================================

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body || {};

    const result =
      await loginWithGoogle(credential);

    return res.status(200).json({
      message: "Google login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error(
      "Google login error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message ||
        "Google authentication failed",
    });
  }
};

// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPasswordController = async (
  req,
  res
) => {
  try {
    await forgotPassword(req.body?.email);

    return res.status(200).json({
      message:
        "Password reset link sent to your email",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error.message
    );

    return res.status(
      error.statusCode || 500
    ).json({
      message:
        error.message || "Server error",
    });
  }
};

// ==================================================
// RESET PASSWORD
// ==================================================

export const resetPasswordController = async (
  req,
  res
) => {
  try {
    await resetPassword(
      req.params.token,
      req.body?.password
    );

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error.message
    );

    return res.status(
      error.statusCode || 400
    ).json({
      message:
        error.message ||
        "Invalid or expired token",
    });
  }
};