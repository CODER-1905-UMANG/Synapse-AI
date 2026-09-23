import {
  analyzeResumeService,
} from "../services/resumeService.js";

export const analyzeResume = async (
  req,
  res
) => {
  console.log(
    "Starting resume ATS analysis..."
  );

  try {
    // Validate uploaded file
    if (!req.file) {
      return res.status(400).json({
        error: "No resume PDF uploaded.",
      });
    }

    if (
      req.file.mimetype !==
      "application/pdf"
    ) {
      return res.status(400).json({
        error:
          "Only PDF resumes are supported.",
      });
    }

    // Validate job description
    const { jobDescription } = req.body;

    if (
      typeof jobDescription !== "string" ||
      jobDescription.trim().length < 50
    ) {
      return res.status(400).json({
        error:
          "Please provide a valid job description.",
      });
    }

    const analysis =
      await analyzeResumeService(
        req.file.buffer,
        jobDescription.trim()
      );

    return res.status(200).json(
      analysis
    );
  } catch (error) {
    console.error(
      "Resume ATS Error:",
      error.message
    );

    const statusCode =
      error.statusCode || 500;

    return res.status(statusCode).json({
      error:
        error.message ||
        "Resume analysis failed. Please try again.",
    });
  }
};