import express from "express";
import multer from "multer";

import {
  analyzeResume,
} from "../controllers/resumeController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 2 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    cb
  ) => {
    if (
      file.mimetype !==
      "application/pdf"
    ) {
      return cb(
        new Error(
          "Only PDF files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

const uploadResume = (
  req,
  res,
  next
) => {
  upload.single("resume")(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }

      if (
        error instanceof
          multer.MulterError &&
        error.code ===
          "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          error:
            "Resume file is too large. Maximum size is 2MB.",
        });
      }

      return res.status(400).json({
        error:
          error.message ||
          "Invalid resume file.",
      });
    }
  );
};

router.post(
  "/analyze-resume",
  uploadResume,
  analyzeResume
);

export default router;