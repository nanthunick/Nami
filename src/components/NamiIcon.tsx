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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Money bag rope/tie */}
        <motion.path
          d="M 32 28 Q 32 18 38 12 Q 50 6 62 12 Q 68 18 68 28"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        />
        
        {/* Money bag body */}
        <motion.g
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          {/* Main bag shape - clean and solid */}
          <motion.path
            d="M 28 28 Q 18 38 14 52 Q 10 68 18 84 Q 28 98 50 104 Q 72 98 82 84 Q 90 68 86 52 Q 82 38 72 28 Z"
            fill="currentColor"
            className="text-foreground"
            animate={{
              d: [
                "M 28 28 Q 18 38 14 52 Q 10 68 18 84 Q 28 98 50 104 Q 72 98 82 84 Q 90 68 86 52 Q 82 38 72 28 Z",
                "M 28 28 Q 18 38 14 54 Q 10 68 18 85 Q 28 98 50 105 Q 72 98 82 85 Q 90 68 86 54 Q 82 38 72 28 Z",
                "M 28 28 Q 18 38 14 52 Q 10 68 18 84 Q 28 98 50 104 Q 72 98 82 84 Q 90 68 86 52 Q 82 38 72 28 Z",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* Dollar sign - crisp and clean */}
        <motion.g
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.4, ease: "backOut" }}
        >
          {/* Vertical line of $ */}
          <path
            d="M 50 48 L 50 76"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* S curve of $ */}
          <path
            d="M 43 54 Q 43 51 46 50 Q 50 48 54 50 Q 58 52 58 55 Q 58 58 54 60 L 46 64 Q 42 66 42 70 Q 42 73 46 75 Q 50 77 54 75 Q 57 73 57 70"
            stroke="white"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>
      </motion.svg>
    </div>
  );
}

