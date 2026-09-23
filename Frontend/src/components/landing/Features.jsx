import React, { useRef } from "react";

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

import {
  Bot,
  Image,
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

// --------------------------------------------------
// Features Data
// --------------------------------------------------

const features = [
  {
    title: "Smart AI Chatbot",
    desc: "Get instant answers, creative ideas, and intelligent conversations.",
    icon: <Bot size={40} className="text-purple-400" />,
    route: "/main",
  },
  {
    title: "AI Image Generation",
    desc: "Generate images from text prompts using AI.",
    icon: <Image size={40} className="text-blue-400" />,
    route: "/imagify",
  },
  {
    title: "Seamless Messaging",
    desc: "Fast and smooth AI conversations.",
    icon: <MessageSquare size={40} className="text-green-400" />,
    route: "/main",
  },
  {
    title: "Text Summarizer",
    desc: "Summarize long text into short meaningful content.",
    icon: <MessageSquare size={40} className="text-yellow-400" />,
    route: "/summarizer",
  },
  {
    title: "Resume Analyzer",
    desc: "Upload your resume and get AI-powered insights, ATS score, and improvement suggestions.",
    icon: <FileText size={40} className="text-yellow-400" />,
    route: "/resume",
  },
];

const Features = () => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // --------------------------------------------------
  // Handle feature click
  // --------------------------------------------------

  const handleClick = (route) => {
    if (!localStorage.getItem("token")) {
      localStorage.setItem("redirectAfterLogin", route);
      navigate("/auth");
    } else {
      navigate(route);
    }
  };

  // --------------------------------------------------
  // Carousel controls
  // --------------------------------------------------

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({
      left: -280,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({
      left: 280,
      behavior: "smooth",
    });
  };

  return (
    <div className="py-16 bg-black text-white text-center px-4">
      {/* Heading */}

      <motion.h2
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-bold mb-12"
      >
        <span className="text-purple-400">Next-Gen</span> AI Features
      </motion.h2>

      {/* Carousel */}

      <div className="relative w-full flex justify-center">
        {/* Left Arrow */}

        <button
          type="button"
          onClick={scrollLeft}
          aria-label="Scroll features left"
          className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-black/70 p-2 rounded-full hover:bg-purple-500 transition"
        >
          <ChevronLeft size={26} />
        </button>

        {/* Cards */}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-20 max-w-[900px]"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.05 }}
              onClick={() => handleClick(feature.route)}
              className="cursor-pointer min-w-[260px] bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-purple-400 hover:shadow-purple-400/40 transition-all"
            >
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-300 text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Right Arrow */}

        <button
          type="button"
          onClick={scrollRight}
          aria-label="Scroll features right"
          className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-black/70 p-2 rounded-full hover:bg-purple-500 transition"
        >
          <ChevronRight size={26} />
        </button>
      </div>
    </div>
  );
};

export default Features;