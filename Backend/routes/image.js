import express from "express";

import {
  createImage,
} from "../controllers/imageController.js";

const router = express.Router();

// ==================================================
// GENERATE IMAGE
// ==================================================

router.post(
  "/generate-image",
  createImage
);

export default router;