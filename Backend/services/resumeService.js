import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import getAIResponse from "../utils/groqai.js";

const MAX_RESUME_TEXT_LENGTH = 7000;
const MAX_JOB_DESCRIPTION_LENGTH = 7000;

// ==================================================
// PDF TEXT EXTRACTION
// ==================================================

const extractTextFromPDF = async (buffer) => {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
  });

  const pdf = await loadingTask.promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const content = await page.getTextContent();

    const strings = content.items.map(
      (item) => item.str
    );

    text += strings.join(" ") + "\n";
  }

  return text;
};

// ==================================================
// EXTRACT JSON FROM AI RESPONSE
// ==================================================

const extractJSON = (response) => {
  let cleaned = response
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Find the first JSON object.
  const firstBrace = cleaned.indexOf("{");

  if (firstBrace === -1) {
    throw new Error(
      "No JSON object was found in the AI response."
    );
  }

  cleaned = cleaned.slice(firstBrace);

  // Find the last closing brace.
  const lastBrace = cleaned.lastIndexOf("}");

  if (lastBrace === -1) {
    throw new Error(
      "AI response contains incomplete JSON."
    );
  }

  cleaned = cleaned.slice(0, lastBrace + 1);

  return JSON.parse(cleaned);
};

// ==================================================
// ATS RESUME ANALYSIS
// ==================================================

export const analyzeResumeService = async (
  resumeBuffer,
  jobDescription
) => {
  // ------------------------------------------
  // 1. Extract resume text
  // ------------------------------------------

  console.log(
    "Extracting resume text..."
  );

  const extractedText =
    await extractTextFromPDF(
      resumeBuffer
    );

  const resumeText = extractedText
    .replace(/\s+/g, " ")
    .trim()
    .slice(
      0,
      MAX_RESUME_TEXT_LENGTH
    );

  if (!resumeText) {
    const error = new Error(
      "Could not read resume content."
    );

    error.statusCode = 400;

    throw error;
  }

  const jdText = jobDescription
    .replace(/\s+/g, " ")
    .trim()
    .slice(
      0,
      MAX_JOB_DESCRIPTION_LENGTH
    );

  console.log(
    "Resume text extracted."
  );

  // ------------------------------------------
  // 2. Build ATS prompt
  // ------------------------------------------

  const prompt = `
You are an ATS resume analyzer.

Compare the RESUME against the JOB DESCRIPTION.

Analyze ONLY the evidence present in the resume.

IMPORTANT RULES:

1. Do not invent skills, experience, projects, education, certifications, or technologies.
2. If something is not clearly present in the resume, treat it as missing/not evidenced.
3. Missing does not necessarily mean the candidate does not know the skill.
4. Focus on:
   - keyword matching
   - technical skills
   - experience relevance
   - projects
   - technologies
   - education
   - resume quality
5. Return ONLY valid JSON.
6. Do NOT use markdown.
7. Do NOT use \`\`\`json.
8. Do NOT add any explanation before or after the JSON.
9. Keep all strings concise.
10. Do not repeat long text from the resume or job description.
11. Keep arrays short and relevant.
12. The complete response must be valid JSON.

IMPORTANT JSON REQUIREMENTS:

- Use double quotes for all JSON keys.
- Use double quotes for all string values.
- Do not use trailing commas.
- Escape quotation marks inside strings.
- Do not include newline characters inside string values.
- Return exactly one JSON object.
- Make sure the final character of your response is }.

Required JSON format:

{
  "atsScore": 0,
  "summary": "",
  "keywordMatch": 0,
  "skillsMatch": 0,
  "experienceMatch": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "matchedKeywords": [],
  "missingKeywords": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": [],
  "resumeIssues": []
}

SCORING RULES:

- atsScore must be between 0 and 100.
- keywordMatch must be between 0 and 100.
- skillsMatch must be between 0 and 100.
- experienceMatch must be between 0 and 100.

ARRAY RULES:

- Every list field must contain strings.
- Keep each list concise.
- Do not return more than 10 items in any list.
- Each item should be short and specific.

RESUME:

${resumeText}

JOB DESCRIPTION:

${jdText}
`;

  // ------------------------------------------
  // 3. Call AI
  // ------------------------------------------

  console.log(
    "Starting AI resume analysis..."
  );

  const aiResponse =
    await getAIResponse([
      {
        role: "user",
        content: prompt,
      },
    ]);

  console.log(
    "AI response received."
  );

  // ------------------------------------------
  // 4. Validate AI response
  // ------------------------------------------

  if (
    !aiResponse ||
    typeof aiResponse !== "string"
  ) {
    const error = new Error(
      "AI service is temporarily unavailable. Please try again in a few moments."
    );

    error.statusCode = 503;

    throw error;
  }

  // ------------------------------------------
  // 5. Parse JSON
  // ------------------------------------------

  let parsed;

  try {
    parsed = extractJSON(aiResponse);
  } catch (parseError) {
    console.error(
      "ATS JSON parse failed:",
      parseError.message
    );

    console.error(
      "AI response length:",
      aiResponse.length
    );

    console.error(
      "AI response preview:",
      aiResponse.slice(0, 1000)
    );

    const error = new Error(
      "The AI returned an invalid analysis. Please try the analysis again."
    );

    error.statusCode = 502;

    throw error;
  }

  // ------------------------------------------
  // 6. Validate ATS score
  // ------------------------------------------

  if (
    typeof parsed.atsScore !== "number" ||
    parsed.atsScore < 0 ||
    parsed.atsScore > 100
  ) {
    const error = new Error(
      "Invalid ATS score returned by AI."
    );

    error.statusCode = 502;

    throw error;
  }

  // ------------------------------------------
  // 7. Normalize sub-scores
  // ------------------------------------------

  const scoreFields = [
    "keywordMatch",
    "skillsMatch",
    "experienceMatch",
  ];

  for (const field of scoreFields) {
    if (
      typeof parsed[field] !== "number" ||
      parsed[field] < 0 ||
      parsed[field] > 100
    ) {
      parsed[field] = 0;
    }
  }

  // ------------------------------------------
  // 8. Normalize array fields
  // ------------------------------------------

  const arrayFields = [
    "matchedSkills",
    "missingSkills",
    "matchedKeywords",
    "missingKeywords",
    "strengths",
    "weaknesses",
    "suggestions",
    "resumeIssues",
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(parsed[field])) {
      parsed[field] = [];
    }

    parsed[field] = parsed[field]
      .filter(
        (item) =>
          typeof item === "string"
      )
      .slice(0, 10);
  }

  // ------------------------------------------
  // 9. Normalize summary
  // ------------------------------------------

  parsed.summary =
    typeof parsed.summary === "string"
      ? parsed.summary
      : "ATS analysis completed.";

  console.log(
    "ATS analysis completed successfully."
  );

  return parsed;
};