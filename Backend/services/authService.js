import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "http://localhost:5173";

const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(
  GOOGLE_CLIENT_ID
);

// ==================================================
// VALIDATION HELPERS
// ==================================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= 6
  );
};

// ==================================================
// REGISTER
// ==================================================

export const registerUser = async ({
  username,
  email,
  password,
}) => {
  const trimmedUsername =
    typeof username === "string"
      ? username.trim()
      : "";

  const normalizedEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  if (
    !trimmedUsername ||
    !normalizedEmail ||
    !password
  ) {
    const error = new Error(
      "All fields are required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(normalizedEmail)) {
    const error = new Error(
      "Please provide a valid email address."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!isValidPassword(password)) {
    const error = new Error(
      "Password must be at least 6 characters long."
    );

    error.statusCode = 400;
    throw error;
  }

  const existingUser =
    await User.findOne({
      email: normalizedEmail,
    });

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists."
    );

    error.statusCode = 409;
    throw error;
  }

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username: trimmedUsername,
    email: normalizedEmail,
    password: hashedPassword,
  });

  return {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
  };
};

// ==================================================
// LOGIN
// ==================================================

export const loginUser = async ({
  username,
  password,
}) => {
  const trimmedUsername =
    typeof username === "string"
      ? username.trim()
      : "";

  if (
    !trimmedUsername ||
    !password
  ) {
    const error = new Error(
      "Username and password are required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!JWT_SECRET) {
    console.error(
      "JWT_SECRET is not configured."
    );

    const error = new Error(
      "Authentication service is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  const user =
    await User.findOne({
      username: trimmedUsername,
    }).select("+password");

  if (!user) {
    const error = new Error(
      "Invalid username or password."
    );

    error.statusCode = 401;
    throw error;
  }

  const isMatch =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isMatch) {
    const error = new Error(
      "Invalid username or password."
    );

    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,

    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar:
        user.avatar ||
        "https://api.dicebear.com/7.x/identicon/svg",
    },
  };
};

// ==================================================
// GOOGLE LOGIN
// ==================================================

export const loginWithGoogle = async (
  credential
) => {
  if (!credential) {
    const error = new Error(
      "Google credential is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!GOOGLE_CLIENT_ID) {
    console.error(
      "GOOGLE_CLIENT_ID is not configured."
    );

    const error = new Error(
      "Google authentication is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  if (!JWT_SECRET) {
    console.error(
      "JWT_SECRET is not configured."
    );

    const error = new Error(
      "Authentication service is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  let payload;

  try {
    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });

    payload = ticket.getPayload();
  } catch (error) {
    console.error(
      "Google token verification failed:",
      error.message
    );

    const tokenError = new Error(
      "Invalid Google authentication."
    );

    tokenError.statusCode = 401;

    throw tokenError;
  }

  if (
    !payload ||
    !payload.sub ||
    !payload.email
  ) {
    const error = new Error(
      "Invalid Google account information."
    );

    error.statusCode = 401;
    throw error;
  }

  if (payload.email_verified !== true) {
    const error = new Error(
      "Your Google email address is not verified."
    );

    error.statusCode = 401;
    throw error;
  }

  const googleId = payload.sub;

  const normalizedEmail =
    payload.email.trim().toLowerCase();

  // ==================================================
  // FIND USER BY GOOGLE ID
  // ==================================================

  let user = await User.findOne({
    googleId,
  });

  // ==================================================
  // IF GOOGLE ID DOESN'T EXIST,
  // CHECK WHETHER EMAIL ALREADY EXISTS
  // ==================================================

  if (!user) {
    user = await User.findOne({
      email: normalizedEmail,
    });

    if (user) {
      // Link the existing account with Google
      user.googleId = googleId;

      if (
        payload.picture &&
        (!user.avatar ||
          user.avatar.includes("dicebear"))
      ) {
        user.avatar = payload.picture;
      }

      await user.save();
    }
  }

  // ==================================================
  // CREATE NEW GOOGLE USER
  // ==================================================

  if (!user) {
    const googleName =
      typeof payload.name === "string"
        ? payload.name.trim()
        : "";

    const emailUsername =
      normalizedEmail.split("@")[0];

    let baseUsername =
      googleName || emailUsername;

    baseUsername = baseUsername
      .replace(/[^a-zA-Z0-9_]/g, "")
      .toLowerCase();

    if (baseUsername.length < 3) {
      baseUsername = "googleuser";
    }

    let username = baseUsername;
    let counter = 1;

    while (
      await User.exists({
        username,
      })
    ) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    /*
      Our current User model requires a password.

      Google users don't provide one, so we generate
      a random internal password hash.

      This password is never sent to the user.
    */

    const randomPassword =
      `${googleId}_${process.env.JWT_SECRET}_${Date.now()}`;

    const hashedPassword =
      await bcrypt.hash(
        randomPassword,
        10
      );

    user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      googleId,
      avatar:
        payload.picture ||
        "https://api.dicebear.com/7.x/identicon/svg",
    });
  }

  // ==================================================
  // GENERATE NORMAL SYNAPSE JWT
  // ==================================================

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return {
    token,

    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar:
        user.avatar ||
        "https://api.dicebear.com/7.x/identicon/svg",
    },
  };
};

// ==================================================
// FORGOT PASSWORD
// ==================================================

export const forgotPassword = async (email) => {
  const normalizedEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  if (!normalizedEmail) {
    const error = new Error(
      "Email is required."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!isValidEmail(normalizedEmail)) {
    const error = new Error(
      "Please provide a valid email address."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!JWT_SECRET) {
    console.error(
      "JWT_SECRET is not configured."
    );

    const error = new Error(
      "Authentication service is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    console.error(
      "Email configuration is missing."
    );

    const error = new Error(
      "Email service is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  const user =
    await User.findOne({
      email: normalizedEmail,
    });

  if (!user) {
    const error = new Error(
      "No account was found with this email address."
    );

    error.statusCode = 404;
    throw error;
  }

  const resetToken = jwt.sign(
    {
      id: user._id,
    },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );

  const resetLink =
    `${FRONTEND_URL}/reset-password/${resetToken}`;

  const transporter =
    nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  const emailHtml = `
    <div style="
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      padding: 30px;
      background: #0a0a0f;
      color: white;
      border-radius: 12px;
    ">
      <h2 style="
        color: #a855f7;
      ">
        Synapse AI
      </h2>

      <p>
        You requested to reset your password.
      </p>

      <p>
        Click the button below to create a new password.
      </p>

      <a
        href="${resetLink}"
        style="
          display: inline-block;
          padding: 12px 22px;
          background: linear-gradient(
            90deg,
            #9333ea,
            #4f46e5
          );
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        "
      >
        Reset Password
      </a>

      <p style="
        margin-top: 25px;
        color: #888;
        font-size: 13px;
      ">
        This password reset link will expire in 15 minutes.
      </p>

      <p style="
        color: #666;
        font-size: 12px;
      ">
        If you did not request a password reset,
        you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: normalizedEmail,
    subject: "Synapse AI - Password Reset",
    html: emailHtml,
  });
};

// ==================================================
// RESET PASSWORD
// ==================================================

export const resetPassword = async (
  token,
  password
) => {
  if (!isValidPassword(password)) {
    const error = new Error(
      "Password must be at least 6 characters long."
    );

    error.statusCode = 400;
    throw error;
  }

  if (!JWT_SECRET) {
    console.error(
      "JWT_SECRET is not configured."
    );

    const error = new Error(
      "Authentication service is not configured."
    );

    error.statusCode = 500;
    throw error;
  }

  let decoded;

  try {
    decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );
  } catch (error) {
    const tokenError = new Error(
      "Invalid or expired token"
    );

    tokenError.statusCode = 400;
    throw tokenError;
  }

  const user =
    await User.findById(
      decoded.id
    );

  if (!user) {
    const error = new Error(
      "User not found."
    );

    error.statusCode = 404;
    throw error;
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10
    );

  user.password =
    hashedPassword;

  await user.save();
};