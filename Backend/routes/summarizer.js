import express from "express";

import {
  createSummary,
} from "../controllers/summarizerController.js";

const router = express.Router();

// ==================================================
// AI SUMMARIZATION
// ==================================================

router.post(
  "/ai-summarize",
  createSummary
);

export default router;