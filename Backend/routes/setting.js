import express from "express";

import {
  updateProfile,
} from "../controllers/settingController.js";

import {
  upload,
} from "../config/cloudinary.js";

const router = express.Router();

// ==================================================
// UPDATE PROFILE
// ==================================================

router.put(
  "/update",
  upload.single("avatar"),
  updateProfile
);

export default router;