import express from "express";

import {
  sendChat,
} from "../controllers/chatController.js";

const router = express.Router();

// ==================================================
// SEND CHAT MESSAGE
// ==================================================

router.post(
  "/chat",
  sendChat
);

export default router;