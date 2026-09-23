import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const SampleCode = () => {
  const fullCode = `import { sendChatMessage } from "./services/chatService";

const response = await sendChatMessage(
  "demo-thread",
  "Explain AI in simple words"
);

console.log(response.reply);`;

  const [displayedCode, setDisplayedCode] = useState("");

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setDisplayedCode(fullCode.slice(0, i));
      i++;

      if (i > fullCode.length) {
        i = 0;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [fullCode]);

  return (
    <div className="bg-black text-white py-16 sm:py-20 px-4 sm:px-6 text-center">
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6"
      >
        Try it with Code
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-gray-400 max-w-xl sm:max-w-2xl mx-auto mb-10 text-sm sm:text-base"
      >
        Integrate Synapse AI into your applications with just a few
        lines of code.
      </motion.p>

      <motion.pre
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-4 sm:p-6 rounded-xl text-left shadow-lg max-w-full sm:max-w-3xl mx-auto overflow-x-auto border border-gray-700"
      >
        <code className="text-green-400 font-mono text-xs sm:text-sm md:text-base leading-relaxed">
          {displayedCode}
          <span className="animate-pulse">|</span>
        </code>
      </motion.pre>
    </div>
  );
};

export default SampleCode;