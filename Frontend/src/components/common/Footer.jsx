import React from "react";
import {
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute
            bottom-0
            left-1/2
            h-64
            w-96
            -translate-x-1/2
            rounded-full
            bg-purple-600/10
            blur-[120px]
          "
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-16">

        {/* ==================================================
            Main Footer Content
        ================================================== */}

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}

          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-purple-500
                  to-indigo-500
                  shadow-lg
                  shadow-purple-500/20
                "
              >
                <Sparkles size={20} className="text-white" />
              </div>

              <span
                className="
                  bg-gradient-to-r
                  from-purple-400
                  to-indigo-400
                  bg-clip-text
                  text-xl
                  font-bold
                  text-transparent
                "
              >
                Synapse AI
              </span>
            </div>

            <p className="max-w-md text-sm leading-7 text-gray-400">
              Your intelligent workspace for conversation,
              creativity, productivity and career growth.
              Explore powerful AI tools, all in one place.
            </p>

            {/* Social Links */}

            <div className="mt-6 flex items-center gap-3">

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-gray-400
                  transition-all
                  hover:border-purple-400/30
                  hover:bg-purple-500/10
                  hover:text-white
                "
              >
                <Github size={18} />
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-gray-400
                  transition-all
                  hover:border-purple-400/30
                  hover:bg-purple-500/10
                  hover:text-white
                "
              >
                <Twitter size={18} />
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  text-gray-400
                  transition-all
                  hover:border-purple-400/30
                  hover:bg-purple-500/10
                  hover:text-white
                "
              >
                <Linkedin size={18} />
              </a>

            </div>
          </div>

          {/* Product */}

          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">
              Product
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">

              <li>
                <a
                  href="#features"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  AI Chat
                  <ArrowUpRight size={13} />
                </a>
              </li>

              <li>
                <a
                  href="#features"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  Image Studio
                  <ArrowUpRight size={13} />
                </a>
              </li>

              <li>
                <a
                  href="#features"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  AI Summarizer
                  <ArrowUpRight size={13} />
                </a>
              </li>

              <li>
                <a
                  href="#features"
                  className="
                    inline-flex
                    items-center
                    gap-1
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  Resume Analyzer
                  <ArrowUpRight size={13} />
                </a>
              </li>

            </ul>
          </div>

          {/* Resources */}

          <div>
            <h3 className="mb-5 text-sm font-semibold text-white">
              Resources
            </h3>

            <ul className="space-y-3 text-sm text-gray-400">

              <li>
                <a
                  href="#features"
                  className="
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  Help & Support
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  Contact
                </a>
              </li>

              <li>
                <a
                  href="#"
                  className="
                    transition-colors
                    hover:text-purple-400
                  "
                >
                  Privacy
                </a>
              </li>

            </ul>
          </div>
        </div>

        {/* ==================================================
            Divider
        ================================================== */}

        <div className="my-10 h-px bg-white/10" />

        {/* ==================================================
            Bottom Footer
        ================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-4
            text-center
            text-xs
            text-gray-500
            md:flex-row
            md:text-left
          "
        >
          <p>
            © {currentYear}{" "}
            <span className="font-medium text-gray-300">
              Synapse AI
            </span>
            . All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#"
              className="transition-colors hover:text-gray-300"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="transition-colors hover:text-gray-300"
            >
              Terms of Service
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;