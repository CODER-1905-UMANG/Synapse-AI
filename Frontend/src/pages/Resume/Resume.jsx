import React, { useEffect, useRef, useState } from "react";

import {
  Upload,
  FileText,
  X,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  BriefcaseBusiness,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

import { analyzeResume as analyzeResumeService } from "../../services/resumeService";

const RESUME_STORAGE_KEY =
  "synapse-resume-analyzer-state";

const RESUME_DB_NAME =
  "synapse-resume-db";

const RESUME_DB_STORE =
  "resume-files";

const RESUME_DB_KEY =
  "current-resume";

// ==================================================
// LOCAL STORAGE
// ==================================================

const getSavedResumeState = () => {
  try {
    const saved =
      localStorage.getItem(
        RESUME_STORAGE_KEY
      );

    if (!saved) {
      return {
        jobDescription: "",
        data: null,
      };
    }

    const parsed = JSON.parse(saved);

    return {
      jobDescription:
        typeof parsed.jobDescription === "string"
          ? parsed.jobDescription
          : "",

      data: parsed.data || null,
    };
  } catch (error) {
    console.error(
      "Failed to restore resume analyzer state:",
      error
    );

    return {
      jobDescription: "",
      data: null,
    };
  }
};

const saveResumeState = ({
  jobDescription,
  data,
}) => {
  try {
    localStorage.setItem(
      RESUME_STORAGE_KEY,
      JSON.stringify({
        jobDescription,
        data,
      })
    );
  } catch (error) {
    console.error(
      "Failed to save resume analyzer state:",
      error
    );
  }
};

// ==================================================
// INDEXED DB
// ==================================================

const openResumeDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(
      RESUME_DB_NAME,
      1
    );

    request.onupgradeneeded = () => {
      const db = request.result;

      if (
        !db.objectStoreNames.contains(
          RESUME_DB_STORE
        )
      ) {
        db.createObjectStore(
          RESUME_DB_STORE
        );
      }
    };

    request.onsuccess = () =>
      resolve(request.result);

    request.onerror = () =>
      reject(request.error);
  });

const saveResumeFile = async (file) => {
  if (!file) return;

  try {
    const db = await openResumeDB();

    await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            RESUME_DB_STORE,
            "readwrite"
          );

        transaction
          .objectStore(
            RESUME_DB_STORE
          )
          .put(file, RESUME_DB_KEY);

        transaction.oncomplete =
          resolve;

        transaction.onerror = () =>
          reject(transaction.error);
      }
    );

    db.close();
  } catch (error) {
    console.error(
      "Failed to persist resume file:",
      error
    );
  }
};

const getSavedResumeFile = async () => {
  try {
    const db = await openResumeDB();

    const file = await new Promise(
      (resolve, reject) => {
        const transaction =
          db.transaction(
            RESUME_DB_STORE,
            "readonly"
          );

        const request =
          transaction
            .objectStore(
              RESUME_DB_STORE
            )
            .get(RESUME_DB_KEY);

        request.onsuccess = () =>
          resolve(request.result);

        request.onerror = () =>
          reject(request.error);
      }
    );

    db.close();

    return file || null;
  } catch (error) {
    console.error(
      "Failed to restore resume file:",
      error
    );

    return null;
  }
};

const removeSavedResumeFile =
  async () => {
    try {
      const db = await openResumeDB();

      await new Promise(
        (resolve, reject) => {
          const transaction =
            db.transaction(
              RESUME_DB_STORE,
              "readwrite"
            );

          transaction
            .objectStore(
              RESUME_DB_STORE
            )
            .delete(RESUME_DB_KEY);

          transaction.oncomplete =
            resolve;

          transaction.onerror = () =>
            reject(transaction.error);
        }
      );

      db.close();
    } catch (error) {
      console.error(
        "Failed to remove saved resume file:",
        error
      );
    }
  };

// ==================================================
// COMPONENT
// ==================================================

const Resume = () => {
  const fileInputRef =
    useRef(null);

  const [savedState] = useState(() =>
    getSavedResumeState()
  );

  const [file, setFile] =
    useState(null);

  const [jobDescription, setJobDescription] =
    useState(
      savedState.jobDescription
    );

  const [loading, setLoading] =
    useState(false);

  const [data, setData] =
    useState(savedState.data);

  const [error, setError] =
    useState("");

  const [restoring, setRestoring] =
    useState(true);

  // ==================================================
  // RESTORE RESUME FILE AFTER REFRESH
  // ==================================================

  useEffect(() => {
    let active = true;

    const restoreFile = async () => {
      const savedFile =
        await getSavedResumeFile();

      if (active && savedFile) {
        setFile(savedFile);
      }

      if (active) {
        setRestoring(false);
      }
    };

    restoreFile();

    return () => {
      active = false;
    };
  }, []);

  // ==================================================
  // FILE HANDLING
  // ==================================================

  const handleFile = (
    selectedFile
  ) => {
    setError("");

    if (!selectedFile) return;

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setError(
        "Please upload a PDF resume."
      );
      return;
    }

    if (
      selectedFile.size >
      2 * 1024 * 1024
    ) {
      setError(
        "Resume size must be less than 2 MB."
      );
      return;
    }

    setFile(selectedFile);
    setData(null);

    saveResumeFile(selectedFile);

    saveResumeState({
      jobDescription,
      data: null,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile =
      e.target.files?.[0];

    handleFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const droppedFile =
      e.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);

    removeSavedResumeFile();

    saveResumeState({
      jobDescription,
      data,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // ==================================================
  // ANALYZE RESUME
  // ==================================================

  const analyzeResume = async () => {
    setError("");

    if (!file) {
      setError(
        "Please upload your resume PDF."
      );
      return;
    }

    if (!jobDescription.trim()) {
      setError(
        "Please paste the job description."
      );
      return;
    }

    if (
      jobDescription.trim().length <
      50
    ) {
      setError(
        "Please provide the complete job description."
      );
      return;
    }

    try {
      setLoading(true);
      setData(null);

      const result =
        await analyzeResumeService({
          resumeFile: file,
          jobDescription,
        });

      setData(result);

      saveResumeState({
        jobDescription,
        data: result,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Resume analysis error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while analyzing your resume."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // RESET
  // ==================================================

  const resetAnalysis = () => {
    setFile(null);
    setJobDescription("");
    setData(null);
    setError("");

    localStorage.removeItem(
      RESUME_STORAGE_KEY
    );

    removeSavedResumeFile();

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // SCORE
  // ==================================================

  const getScoreLabel = (score) => {
    if (score >= 85) {
      return "Excellent Match";
    }

    if (score >= 70) {
      return "Strong Match";
    }

    if (score >= 55) {
      return "Moderate Match";
    }

    return "Needs Improvement";
  };

  const getScoreRing = (score) => {
    const radius = 70;

    const circumference =
      2 * Math.PI * radius;

    const progress =
      (score / 100) *
      circumference;

    return {
      radius,
      circumference,
      progress,
    };
  };

  const score = Number(
    data?.atsScore || 0
  );

  const scoreRing =
    getScoreRing(score);

  // ==================================================
  // LIST ITEM
  // ==================================================

  const ListItem = ({
    children,
    type = "default",
  }) => {
    const isPositive =
      type === "positive";

    const isNegative =
      type === "negative";

    return (
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
            isPositive
              ? "bg-emerald-500/10 text-emerald-400"
              : isNegative
              ? "bg-red-500/10 text-red-400"
              : "bg-purple-500/10 text-purple-400"
          }`}
        >
          {isPositive ? (
            <CheckCircle2 size={14} />
          ) : isNegative ? (
            <AlertCircle size={14} />
          ) : (
            <Sparkles size={14} />
          )}
        </div>

        <p className="text-sm leading-6 text-gray-300">
          {children}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="relative min-h-screen overflow-hidden pb-20 pt-12">

        {/* Background */}

        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-[140px]" />

        <div className="pointer-events-none absolute left-[-200px] top-[500px] h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[130px]" />

        <div className="pointer-events-none absolute right-[-200px] top-[900px] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
              <Sparkles size={15} />

              AI Resume Analyzer
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Match your resume

              <span className="block bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                to any job.
              </span>
            </h1>

            <p className="mt-5 text-base leading-7 text-gray-400 sm:text-lg">
              Upload your resume and paste a job
              description to get an AI-generated
              estimate of how closely your resume
              matches the role.
            </p>

          </div>

          {/* ==================================================
              INPUT
          ================================================== */}

          {!data && (
            <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">

              {/* RESUME */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
                      <FileText
                        size={19}
                        className="text-purple-400"
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold">
                        Your Resume
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        PDF • Max 2 MB
                      </p>
                    </div>

                  </div>

                  <ShieldCheck
                    size={20}
                    className="text-gray-600"
                  />

                </div>

                {!file ? (

                  <div
                    onDragOver={(e) =>
                      e.preventDefault()
                    }
                    onDrop={handleDrop}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="group flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/30 p-6 text-center transition-all hover:border-purple-500/50 hover:bg-purple-500/[0.03]"
                  >

                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 transition-transform group-hover:scale-105">

                      <Upload
                        size={25}
                        className="text-purple-400"
                      />

                    </div>

                    <h3 className="font-medium text-white">
                      Drop your resume here
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      or click to browse your files
                    </p>

                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400">
                      PDF only • Maximum 2 MB
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={
                        handleFileChange
                      }
                      className="hidden"
                    />

                  </div>

                ) : (

                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] p-6">

                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">

                      <FileText
                        size={28}
                        className="text-purple-400"
                      />

                    </div>

                    <h3 className="max-w-sm break-all text-center font-medium text-white">
                      {file.name}
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>

                    <button
                      type="button"
                      onClick={
                        removeFile
                      }
                      className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/15"
                    >
                      <X size={15} />
                      Remove resume
                    </button>

                  </div>

                )}

              </div>

              {/* JOB DESCRIPTION */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

                <div className="mb-6 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">

                      <BriefcaseBusiness
                        size={19}
                        className="text-indigo-400"
                      />

                    </div>

                    <div>

                      <h2 className="text-lg font-semibold">
                        Job Description
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Paste the complete JD
                      </p>

                    </div>

                  </div>

                  <Target
                    size={20}
                    className="text-gray-600"
                  />

                </div>

                <div className="relative">

                  <textarea
                    value={jobDescription}
                    onChange={(e) => {
                      const nextJobDescription =
                        e.target.value;

                      setJobDescription(
                        nextJobDescription
                      );

                      setError("");
                      setData(null);

                      saveResumeState({
                        jobDescription:
                          nextJobDescription,
                        data: null,
                      });
                    }}
                    placeholder={`Paste the complete job description here...

Example:
We are looking for a Full Stack Developer with experience in React, Node.js, MongoDB, REST APIs, Git and AWS...`}
                    maxLength={10000}
                    className="min-h-[300px] w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-5 py-5 text-sm text-gray-200 outline-none transition placeholder:text-gray-600 focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20"
                  />

                  <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-2 py-1 text-xs text-gray-600">
                    {jobDescription.length} / 10000
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mx-auto mt-6 max-w-6xl">

              <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4">

                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-400"
                />

                <p className="text-sm text-red-300">
                  {error}
                </p>

              </div>

            </div>

          )}

          {/* ==================================================
              BUTTON
          ================================================== */}

          {!data && (

            <div className="mx-auto mt-7 max-w-6xl">

              <button
                type="button"
                onClick={
                  analyzeResume
                }
                disabled={
                  loading ||
                  restoring
                }
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 font-medium shadow-lg shadow-purple-900/20 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <>
                    <RefreshCw
                      size={19}
                      className="animate-spin"
                    />

                    Analyzing your resume...
                  </>
                ) : (
                  <>
                    <Sparkles size={19} />

                    Analyze Resume
                  </>
                )}

              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-600">

                <ShieldCheck size={14} />

                AI-generated estimate • Not a guarantee
                of employer ATS screening

              </div>

            </div>

          )}

          {/* ==================================================
              RESULTS
          ================================================== */}

          {data && (

            <div className="mx-auto max-w-6xl">

              {/* RESULT HEADER */}

              <div className="mb-7 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                  <p className="text-sm font-medium text-purple-400">
                    Analysis Complete
                  </p>

                  <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                    Your resume match
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={
                    resetAnalysis
                  }
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/10"
                >

                  <RefreshCw size={15} />

                  New Analysis

                </button>

              </div>

              {/* SCORE */}

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 shadow-2xl backdrop-blur-xl sm:p-10">

                <div className="grid items-center gap-8 lg:grid-cols-[240px_1fr]">

                  {/* SCORE CIRCLE */}

                  <div className="flex flex-col items-center justify-center">

                    <div className="relative h-[190px] w-[190px]">

                      <svg
                        width="190"
                        height="190"
                        viewBox="0 0 190 190"
                        className="-rotate-90"
                      >

                        <circle
                          cx="95"
                          cy="95"
                          r={
                            scoreRing.radius
                          }
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-white/5"
                        />

                        <circle
                          cx="95"
                          cy="95"
                          r={
                            scoreRing.radius
                          }
                          fill="none"
                          stroke="url(#scoreGradient)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={
                            scoreRing.circumference
                          }
                          strokeDashoffset={
                            scoreRing.circumference -
                            scoreRing.progress
                          }
                        />

                        <defs>

                          <linearGradient
                            id="scoreGradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >

                            <stop
                              offset="0%"
                              stopColor="#a855f7"
                            />

                            <stop
                              offset="100%"
                              stopColor="#6366f1"
                            />

                          </linearGradient>

                        </defs>

                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">

                        <span className="text-4xl font-bold">
                          {score}
                        </span>

                        <span className="text-xs text-gray-500">
                          / 100
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 text-center">

                      <p className="text-lg font-semibold">
                        {getScoreLabel(
                          score
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        AI ATS Match Score
                      </p>

                    </div>

                  </div>

                  {/* OVERVIEW */}

                  <div>

                    <div className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-purple-400">

                      <Sparkles size={16} />

                      Match Overview

                    </div>

                    <h3 className="text-xl font-semibold leading-snug sm:text-2xl">
                      How closely your resume aligns
                      with this role
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base">
                      {data.summary}
                    </p>

                    <div className="mt-7 grid gap-3 sm:grid-cols-3">

                      <ScoreMiniCard
                        label="Keyword Match"
                        value={
                          data.keywordMatch
                        }
                        icon={
                          <KeyRound
                            size={16}
                          />
                        }
                      />

                      <ScoreMiniCard
                        label="Skills Match"
                        value={
                          data.skillsMatch
                        }
                        icon={
                          <Target
                            size={16}
                          />
                        }
                      />

                      <ScoreMiniCard
                        label="Experience"
                        value={
                          data.experienceMatch
                        }
                        icon={
                          <BriefcaseBusiness
                            size={16}
                          />
                        }
                      />

                    </div>

                  </div>

                </div>

              </div>

              {/* MATCHED / MISSING SKILLS */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <ResultCard
                  title="Matched Skills"
                  icon={
                    <CheckCircle2
                      size={18}
                    />
                  }
                  iconClass="bg-emerald-500/10 text-emerald-400"
                >

                  {data.matchedSkills?.length ? (

                    <div className="flex flex-wrap gap-2">

                      {data.matchedSkills.map(
                        (
                          skill,
                          index
                        ) => (
                          <Tag
                            key={index}
                            text={skill}
                            positive
                          />
                        )
                      )}

                    </div>

                  ) : (

                    <EmptyText text="No strong skill matches were identified." />

                  )}

                </ResultCard>

                <ResultCard
                  title="Missing / Not Evidenced Skills"
                  icon={
                    <AlertCircle
                      size={18}
                    />
                  }
                  iconClass="bg-red-500/10 text-red-400"
                >

                  {data.missingSkills?.length ? (

                    <div className="flex flex-wrap gap-2">

                      {data.missingSkills.map(
                        (
                          skill,
                          index
                        ) => (
                          <Tag
                            key={index}
                            text={skill}
                            negative
                          />
                        )
                      )}

                    </div>

                  ) : (

                    <EmptyText text="No major missing skills were identified." />

                  )}

                </ResultCard>

              </div>

              {/* KEYWORDS */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <ResultCard
                  title="Matched Keywords"
                  icon={
                    <KeyRound
                      size={18}
                    />
                  }
                  iconClass="bg-purple-500/10 text-purple-400"
                >

                  {data.matchedKeywords?.length ? (

                    <div className="flex flex-wrap gap-2">

                      {data.matchedKeywords.map(
                        (
                          keyword,
                          index
                        ) => (
                          <Tag
                            key={index}
                            text={keyword}
                            positive
                          />
                        )
                      )}

                    </div>

                  ) : (

                    <EmptyText text="No important keyword matches were identified." />

                  )}

                </ResultCard>

                <ResultCard
                  title="Missing Keywords"
                  icon={
                    <AlertCircle
                      size={18}
                    />
                  }
                  iconClass="bg-orange-500/10 text-orange-400"
                >

                  {data.missingKeywords?.length ? (

                    <div className="flex flex-wrap gap-2">

                      {data.missingKeywords.map(
                        (
                          keyword,
                          index
                        ) => (
                          <Tag
                            key={index}
                            text={keyword}
                            negative
                          />
                        )
                      )}

                    </div>

                  ) : (

                    <EmptyText text="No major missing keywords were identified." />

                  )}

                </ResultCard>

              </div>

              {/* STRENGTHS / WEAKNESSES */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                <ResultCard
                  title="Resume Strengths"
                  icon={
                    <CheckCircle2
                      size={18}
                    />
                  }
                  iconClass="bg-emerald-500/10 text-emerald-400"
                >

                  <div className="space-y-4">

                    {data.strengths?.length ? (

                      data.strengths.map(
                        (
                          item,
                          index
                        ) => (
                          <ListItem
                            key={index}
                            type="positive"
                          >
                            {item}
                          </ListItem>
                        )
                      )

                    ) : (

                      <EmptyText text="No specific strengths were returned." />

                    )}

                  </div>

                </ResultCard>

                <ResultCard
                  title="Areas to Improve"
                  icon={
                    <AlertCircle
                      size={18}
                    />
                  }
                  iconClass="bg-red-500/10 text-red-400"
                >

                  <div className="space-y-4">

                    {data.weaknesses?.length ? (

                      data.weaknesses.map(
                        (
                          item,
                          index
                        ) => (
                          <ListItem
                            key={index}
                            type="negative"
                          >
                            {item}
                          </ListItem>
                        )
                      )

                    ) : (

                      <EmptyText text="No major weaknesses were returned." />

                    )}

                  </div>

                </ResultCard>

              </div>

              {/* SUGGESTIONS */}

              <div className="mt-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/[0.08] to-indigo-500/[0.04] p-6 backdrop-blur-xl sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">

                    <Lightbulb
                      size={20}
                      className="text-purple-400"
                    />

                  </div>

                  <div className="flex-1">

                    <h3 className="text-lg font-semibold">
                      How to improve your match
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Specific recommendations based on
                      this job description.
                    </p>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">

                      {data.suggestions?.length ? (

                        data.suggestions.map(
                          (
                            item,
                            index
                          ) => (
                            <ListItem
                              key={index}
                            >
                              {item}
                            </ListItem>
                          )
                        )

                      ) : (

                        <EmptyText text="No suggestions were returned." />

                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* RESUME ISSUES */}

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">

                <div className="mb-6 flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">

                    <FileText
                      size={18}
                      className="text-orange-400"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-semibold">
                      Resume Issues
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Things that may reduce clarity or
                      match quality.
                    </p>

                  </div>

                </div>

                {data.resumeIssues?.length ? (

                  <div className="grid gap-4 md:grid-cols-2">

                    {data.resumeIssues.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          key={index}
                          className="flex gap-3 rounded-2xl border border-white/5 bg-black/20 p-4"
                        >

                          <AlertCircle
                            size={17}
                            className="mt-0.5 shrink-0 text-orange-400"
                          />

                          <p className="text-sm leading-6 text-gray-300">
                            {item}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <EmptyText text="No major resume issues were identified." />

                )}

              </div>

              {/* DISCLAIMER */}

              <div className="mt-6 flex items-start gap-3 px-2">

                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-gray-600"
                />

                <p className="text-xs leading-5 text-gray-600">
                  This analysis is an AI-generated
                  estimate based on the resume and job
                  description you provided. It does not
                  reproduce or guarantee the behavior of
                  any employer's ATS or hiring process.
                </p>

              </div>

            </div>

          )}

        </div>
      </main>
    </div>
  );
};

// ==================================================
// SCORE MINI CARD
// ==================================================

const ScoreMiniCard = ({
  label,
  value,
  icon,
}) => {
  const numericValue = Math.min(
    100,
    Math.max(0, Number(value) || 0)
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 text-gray-500">

          {icon}

          <span className="text-xs">
            {label}
          </span>

        </div>

        <ArrowUpRight
          size={14}
          className="text-gray-700"
        />

      </div>

      <div className="mt-3 flex items-end gap-1">

        <span className="text-2xl font-semibold">
          {numericValue}
        </span>

        <span className="mb-1 text-xs text-gray-600">
          /100
        </span>

      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">

        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
          style={{
            width: `${numericValue}%`,
          }}
        />

      </div>

    </div>
  );
};

// ==================================================
// RESULT CARD
// ==================================================

const ResultCard = ({
  title,
  icon,
  iconClass,
  children,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-7">

      <div className="mb-6 flex items-center gap-3">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <h3 className="text-lg font-semibold">
          {title}
        </h3>

      </div>

      {children}

    </div>
  );
};

// ==================================================
// TAG
// ==================================================

const Tag = ({
  text,
  positive = false,
  negative = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs ${
        positive
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          : negative
          ? "border-red-500/20 bg-red-500/10 text-red-300"
          : "border-white/10 bg-white/5 text-gray-300"
      }`}
    >
      {positive && (
        <CheckCircle2 size={12} />
      )}

      {negative && (
        <AlertCircle size={12} />
      )}

      {text}
    </span>
  );
};

// ==================================================
// EMPTY TEXT
// ==================================================

const EmptyText = ({ text }) => {
  return (
    <p className="text-sm text-gray-600">
      {text}
    </p>
  );
};

export default Resume;