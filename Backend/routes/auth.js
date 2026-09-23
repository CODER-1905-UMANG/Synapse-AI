import express from "express";

import {
  register,
  login,
  googleLogin,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/authController.js";

const router = express.Router();

// ==================================================
// REGISTER
// ==================================================

router.post(
  "/register",
  register
);

// ==================================================
// LOGIN
// ==================================================

router.post(
  "/login",
  login
);

// ==================================================
// GOOGLE LOGIN
// ==================================================

router.post(
  "/google",
  googleLogin
);

// ==================================================
// FORGOT PASSWORD
// ==================================================

router.post(
  "/forgot-password",
  forgotPasswordController
);

// ==================================================
// RESET PASSWORD
// ==================================================

router.post(
  "/reset-password/:token",
  resetPasswordController
);

export default router;