

import React, { useState, useEffect, useMemo, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Sample chat messages
const sampleMessages = [
  { type: "user", text: "Explain quantum computing in simple terms." },
  {
    type: "ai",
    text: "Quantum computing uses the principles of quantum mechanics to process information faster than classical computers by leveraging superposition and entanglement.",
  },
  { type: "user", text: "Give me a short Python code to reverse a string." },
  {
    type: "ai",
    text: `# Python code to reverse a string\nmy_string = "Hello AI"\nreversed_string = my_string[::-1]\nprint(reversed_string)`,
  },
];

// Floating particles component
const FloatingParticles = () => {
  const groupRef = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 150; i++) {
      temp.push({
        position: new THREE.Vector3(
          Math.random() * 20 - 10,
          Math.random() * 10 - 5,
          Math.random() * 5 - 2.5
        ),
        speed: Math.random() * 0.002 + 0.0005,
      });
    }
    return temp;
  }, []);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y += particles[i].speed;
        if (child.position.y > 5) child.position.y = -5;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial
            emissive="#ffffff"
            emissiveIntensity={0.6}
            color="#ffffff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
};

const SampleConversation = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const containerRef = useRef(null);

  // Typing effect
  useEffect(() => {
    if (currentIndex < sampleMessages.length) {
      let i = 0;
      const text = sampleMessages[currentIndex].text;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i));
        i++;
        if (i > text.length) {
          clearInterval(interval);
          setTimeout(() => setCurrentIndex(currentIndex + 1), 800);
        }
      }, 25);
      return () => clearInterval(interval);
    }
  }, [currentIndex]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentIndex, displayedText]);

  return (
    <div className="relative w-full bg-black py-16 sm:py-20 flex flex-col items-center px-4 sm:px-6">
      {/* Section Heading */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-8 text-center"
      >
        See Synapse AI in Action
      </motion.h2>

      {/* 3D Particle Background */}
      <div className="absolute inset-0 -z-10">
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <FloatingParticles />
        </Canvas>
      </div>

      {/* Chat Container */}
      <div
        ref={containerRef}
        className="relative bg-black text-white w-full max-w-full sm:max-w-3xl p-4 sm:p-6 md:p-8 rounded-xl shadow-lg space-y-4 overflow-y-auto"
        style={{ maxHeight: "500px" }}
      >
        <AnimatePresence>
          {sampleMessages.slice(0, currentIndex).map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className={`p-3 sm:p-4 rounded-lg max-w-[80%] break-words ${
                msg.type === "user"
                  ? "bg-purple-600 ml-auto text-white"
                  : "bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white"
              }`}
            >
              <pre className="whitespace-pre-wrap font-mono text-sm sm:text-base">{msg.text}</pre>
            </motion.div>
          ))}

          {currentIndex < sampleMessages.length && (
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`p-3 sm:p-4 rounded-lg max-w-[80%] break-words ${
                sampleMessages[currentIndex].type === "user"
                  ? "bg-purple-600 ml-auto text-white"
                  : "bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 text-white"
              }`}
            >
              <pre className="whitespace-pre-wrap font-mono text-sm sm:text-base">
                {displayedText}
                <span className="animate-pulse">|</span>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SampleConversation;
