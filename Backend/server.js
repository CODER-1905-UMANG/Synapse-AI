import express from "express";
import "dotenv/config";
import cors from "cors";

import connectDB from "./config/db.js";

import { authMiddleware } from "./config/authMiddleware.js";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import threadRoutes from "./routes/thread.js";
import imageRoutes from "./routes/image.js";
import summarizerRoutes from "./routes/summarizer.js";
import resumeRoutes from "./routes/resume.js";
import userRoutes from "./routes/setting.js";

const app = express();

const PORT = process.env.PORT || 8080;

// ==================================================
// GLOBAL MIDDLEWARE
// ==================================================

app.use(express.json());
app.use(cors());

// ==================================================
// PUBLIC ROUTES
// ==================================================

// Authentication does not require a JWT.
app.use("/auth", authRoutes);

// ==================================================
// PROTECTED API ROUTES
// ==================================================

// Everything under /api requires authentication.
app.use("/api", authMiddleware);

app.use("/api", chatRoutes);
app.use("/api", threadRoutes);
app.use("/api", imageRoutes);
app.use("/api", summarizerRoutes);
app.use("/api", resumeRoutes);

// ==================================================
// USER SETTINGS
// ==================================================

app.use(
  "/user",
  authMiddleware,
  userRoutes
);

// ==================================================
// START SERVER
// ==================================================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `Server running on port ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();