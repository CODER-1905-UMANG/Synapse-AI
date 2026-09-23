


import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot, MeshDistortMaterial } from "@react-three/drei";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

/* =========================================================
   Floating Particle Field
   ========================================================= */

const FloatingParticles = () => {
  const pointsRef = useRef();

  const particleData = useMemo(() => {
    const count = 120;

    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const index = i * 3;

      positions[index] = Math.random() * 20 - 10;
      positions[index + 1] = Math.random() * 20 - 10;
      positions[index + 2] = Math.random() * 20 - 10;

      speeds[i] = Math.random() * 0.002 + 0.0005;
    }

    return {
      positions,
      speeds,
    };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positionAttribute =
      pointsRef.current.geometry.attributes.position;

    const positions = positionAttribute.array;

    for (let i = 0; i < particleData.speeds.length; i++) {
      const yIndex = i * 3 + 1;

      positions[yIndex] += particleData.speeds[i];

      if (positions[yIndex] > 10) {
        positions[yIndex] = -10;
      }
    }

    positionAttribute.needsUpdate = true;

    pointsRef.current.rotation.y += 0.0004;
    pointsRef.current.rotation.x += 0.0002;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleData.positions.length / 3}
          array={particleData.positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#ffffff"
        size={0.045}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/* =========================================================
   Rotating 3D AI Core
   Cursor Controlled + Automatic Rotation
   ========================================================= */

const RotatingTorusKnot = ({ mouseRef }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const mouseX = mouseRef.current.x;
    const mouseY = mouseRef.current.y;

    // Cursor-based target rotation
    const targetX = mouseY * 0.8;
    const targetY = mouseX * 1.2;

    // Smooth cursor movement
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetX,
      0.08
    );

    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetY,
      0.08
    );

    // Slow continuous rotation
    meshRef.current.rotation.z += delta * 0.15;
  });

  return (
    <TorusKnot
      ref={meshRef}
      args={[1.25, 0.32, 64, 24]}
      position={[0, -0.3, 0]}
    >
      <MeshDistortMaterial
        color="#f8f8ff"
        distort={0.35}
        speed={1.8}
        roughness={0.12}
        metalness={0.15}
      />
    </TorusKnot>
  );
};

/* =========================================================
   Hero Component
   ========================================================= */

const Hero = () => {
  const navigate = useNavigate();

  /*
    Using useRef instead of useState prevents unnecessary
    React re-renders whenever the mouse moves.
  */
  const mouseRef = useRef({
    x: 0,
    y: 0,
  });

  /* =======================================================
     Mouse Tracking
     ======================================================= */

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseRef.current.x =
        (event.clientX / window.innerWidth - 0.5) * 2;

      mouseRef.current.y =
        (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  /* =======================================================
     Features
     ======================================================= */

  const features = [
    {
      icon: "💬",
      title: "AI Chat",
      description:
        "Ask questions, brainstorm ideas and get intelligent real-time responses.",
    },
    {
      icon: "🎨",
      title: "Image Studio",
      description:
        "Turn natural-language ideas into creative AI-generated visuals.",
    },
    {
      icon: "📝",
      title: "AI Tools",
      description:
        "Summarize content and analyze resumes using powerful AI tools.",
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* ===================================================
          Background Glow
      =================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className="
            absolute
            -left-40
            -top-40
            h-[500px]
            w-[500px]
            rounded-full
            bg-purple-700/15
            blur-[140px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-1/3
            h-[500px]
            w-[500px]
            rounded-full
            bg-indigo-600/10
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-1/2
            h-[350px]
            w-[700px]
            -translate-x-1/2
            rounded-full
            bg-purple-600/10
            blur-[160px]
          "
        />
      </div>

      {/* ===================================================
          Help & Support
      =================================================== */}

      <motion.button
        onClick={() => navigate("/auth")}
        whileHover={{
          scale: 1.04,
        }}
        whileTap={{
          scale: 0.97,
        }}
        className="
          absolute
          right-4
          top-4
          z-50
          rounded-xl
          border
          border-white/20
          bg-white/[0.03]
          px-4
          py-2.5
          text-sm
          font-medium
          text-white
          backdrop-blur-md
          transition-all
          hover:bg-white/[0.07]
          sm:right-8
          sm:top-7
          sm:px-5
        "
      >
        Help & Support
      </motion.button>

      {/* ===================================================
          Hero Section
      =================================================== */}

      <section
        className="
          relative
          z-10
          flex
          min-h-screen
          flex-col
          items-center
          px-5
          pt-28
          sm:px-8
          sm:pt-32
        "
      >

        {/* AI Badge */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            mb-6
            flex
            items-center
            gap-2
            rounded-full
            border
            border-purple-400/20
            bg-purple-500/10
            px-4
            py-2
            text-xs
            font-medium
            text-purple-300
            backdrop-blur-md
            sm:text-sm
          "
        >
          <span
            className="
              h-2
              w-2
              rounded-full
              bg-purple-400
              shadow-[0_0_10px_#a855f7]
            "
          />

          AI-powered productivity workspace
        </motion.div>

        {/* =================================================
            Main Heading
        ================================================= */}

        <motion.h1
          initial={{
            opacity: 0,
            y: -30,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          className="
            max-w-5xl
            text-center
            text-4xl
            font-bold
            leading-tight
            tracking-tight
            sm:text-5xl
            md:text-6xl
            lg:text-7xl
          "
        >
          One workspace.
          <br />

          <span
            className="
              bg-gradient-to-r
              from-purple-400
              via-violet-400
              to-indigo-400
              bg-clip-text
              text-transparent
            "
          >
            Limitless AI.
          </span>
        </motion.h1>

        {/* =================================================
            Description
        ================================================= */}

        <motion.p
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="
            mt-6
            max-w-2xl
            text-center
            text-sm
            leading-7
            text-gray-400
            sm:text-base
            md:text-lg
          "
        >
          Chat with AI, generate images, summarize content,
          analyze resumes and explore powerful AI tools —
          all from one unified workspace.
        </motion.p>

        {/* =================================================
            CTA Buttons
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.35,
          }}
          className="
            mt-8
            flex
            flex-col
            items-center
            gap-3
            sm:flex-row
          "
        >

          <motion.button
            whileHover={{
              scale: 1.04,
              boxShadow:
                "0 0 35px rgba(168,85,247,0.35)",
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={() => navigate("/auth")}
            className="
              rounded-xl
              bg-gradient-to-r
              from-purple-500
              to-indigo-500
              px-7
              py-3.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-purple-500/20
              transition-all
              sm:px-8
            "
          >
            Get Started
          </motion.button>

          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
            className="
              rounded-xl
              border
              border-white/10
              bg-white/[0.03]
              px-7
              py-3.5
              text-sm
              font-medium
              text-gray-300
              backdrop-blur-md
              transition-all
              hover:border-purple-400/30
              hover:bg-white/[0.06]
            "
          >
            Explore Features
          </button>
        </motion.div>

        {/* =================================================
            3D AI Core
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.2,
            delay: 0.4,
          }}
          className="
            relative
            mt-6
            h-[330px]
            w-full
            max-w-5xl
            sm:h-[400px]
            md:h-[460px]
          "
        >

          {/* Glow */}

          <div
            className="
              pointer-events-none
              absolute
              left-1/2
              top-1/2
              h-40
              w-40
              -translate-x-1/2
              -translate-y-1/2
              rounded-full
              bg-purple-500/20
              blur-[90px]
              sm:h-56
              sm:w-56
            "
          />

          <Canvas
            camera={{
              position: [0, 0, 7],
              fov: 50,
            }}
            dpr={[1, 1.25]}
            gl={{
              antialias: true,
              alpha: true,
            }}
          >

            <fog
              attach="fog"
              args={["#000000", 8, 18]}
            />

            <ambientLight intensity={0.8} />

            <directionalLight
              position={[3, 5, 4]}
              intensity={1.4}
            />

            <pointLight
              position={[-3, 2, 4]}
              intensity={2}
              color="#8b5cf6"
            />

            <FloatingParticles />

            <RotatingTorusKnot
              mouseRef={mouseRef}
            />

          </Canvas>
        </motion.div>
      </section>

      {/* ===================================================
          Features
      =================================================== */}

      <section
        id="features"
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-6xl
          px-5
          pb-24
          sm:px-8
        "
      >

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mb-10 text-center"
        >

          <p className="mb-3 text-sm font-medium text-purple-400">
            POWERFUL AI TOOLS
          </p>

          <h2
            className="
              text-2xl
              font-bold
              sm:text-3xl
              md:text-4xl
            "
          >
            Everything you need in one place
          </h2>

          <p
            className="
              mx-auto
              mt-3
              max-w-xl
              text-sm
              text-gray-400
            "
          >
            Explore a collection of AI-powered tools
            designed for productivity, creativity and
            career growth.
          </p>

        </motion.div>

        {/* Feature Cards */}

        <div
          className="
            grid
            gap-4
            md:grid-cols-3
          "
        >

          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -5,
              }}
              className="
                group
                rounded-2xl
                border
                border-white/10
                bg-white/[0.03]
                p-6
                backdrop-blur-md
                transition-all
                hover:border-purple-400/30
                hover:bg-white/[0.05]
              "
            >

              <div
                className="
                  mb-5
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-500/10
                  text-xl
                  transition-transform
                  group-hover:scale-110
                "
              >
                {feature.icon}
              </div>

              <h3 className="text-lg font-semibold">
                {feature.title}
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-gray-400
                "
              >
                {feature.description}
              </p>

            </motion.div>
          ))}

        </div>
      </section>

    </main>
  );
};

export default Hero;