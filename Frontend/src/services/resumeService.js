import { apiRequest } from "./api";

/**
 * Analyze a resume against a job description.
 */
export const analyzeResume = async ({
  resumeFile,
  jobDescription,
}) => {
  if (!resumeFile) {
    throw new Error("Resume file is required");
  }

  if (!jobDescription?.trim()) {
    throw new Error("Job description is required");
  }

  const formData = new FormData();

  formData.append("resume", resumeFile);

  formData.append(
    "jobDescription",
    jobDescription.trim()
  );

  const response = await apiRequest(
    "/api/analyze-resume",
    {
      method: "POST",
      body: formData,
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    throw new Error(
      "Your session has expired. Please log in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Resume analysis failed."
    );
  }

  return data;
};