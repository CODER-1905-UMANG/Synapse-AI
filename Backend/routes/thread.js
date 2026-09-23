import express from "express";

import {
  getThreads,
  getThreadById,
  deleteThread,
} from "../controllers/threadController.js";

const router = express.Router();

// Get all threads
router.get("/thread", getThreads);

// Get a specific thread
router.get("/thread/:threadId", getThreadById);

// Delete a specific thread
router.delete("/thread/:threadId", deleteThread);

export default router;