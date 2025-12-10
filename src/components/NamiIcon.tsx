"use client";

import { motion } from "framer-motion";

export function NamiIcon() {
  return (
    <div className="relative w-9 h-10">
      <motion.svg
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Money bag rope/tie */}
        <motion.path
          d="M 35 25 Q 35 15 40 10 Q 50 5 60 10 Q 65 15 65 25"
          stroke="#10b981"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        />
        
        {/* Money bag body with gradient */}
        <motion.g
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <defs>
            <linearGradient id="bagGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="1" />
            </linearGradient>
          </defs>
          
          {/* Main bag shape */}
          <motion.path
            d="M 30 25 Q 20 35 15 50 Q 10 70 20 85 Q 30 100 50 105 Q 70 100 80 85 Q 90 70 85 50 Q 80 35 70 25 Z"
            fill="url(#bagGradient)"
            animate={{
              d: [
                "M 30 25 Q 20 35 15 50 Q 10 70 20 85 Q 30 100 50 105 Q 70 100 80 85 Q 90 70 85 50 Q 80 35 70 25 Z",
                "M 30 25 Q 20 35 15 52 Q 10 70 20 86 Q 30 100 50 106 Q 70 100 80 86 Q 90 70 85 52 Q 80 35 70 25 Z",
                "M 30 25 Q 20 35 15 50 Q 10 70 20 85 Q 30 100 50 105 Q 70 100 80 85 Q 90 70 85 50 Q 80 35 70 25 Z",
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* Dollar sign */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: "backOut" }}
        >
          {/* Dollar $ symbol */}
          <path
            d="M 50 45 L 50 75"
            stroke="#065f46"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 45 50 Q 45 47 48 46 Q 52 45 55 47 Q 58 49 58 52 Q 58 55 55 57 L 45 61 Q 42 63 42 66 Q 42 69 45 71 Q 48 73 52 73 Q 55 73 57 71"
            stroke="#065f46"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        </motion.g>

        {/* Subtle shine effect */}
        <motion.ellipse
          cx="35"
          cy="50"
          rx="8"
          ry="15"
          fill="white"
          opacity="0.15"
          animate={{
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500/10 blur-md"
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

