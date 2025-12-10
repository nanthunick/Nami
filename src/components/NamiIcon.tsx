"use client";

import { motion } from "framer-motion";
import { Banknote } from "lucide-react";

export function NamiIcon() {
  return (
    <div className="relative w-9 h-9">
      {/* Background note - slightly offset and lighter */}
      <motion.div
        className="absolute"
        style={{ top: 4, left: 4 }}
        initial={{ opacity: 0, x: -4, y: -4 }}
        animate={{ 
          opacity: 0.4,
          x: 0,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.1,
        }}
      >
        <Banknote 
          className="h-9 w-9 text-emerald-500" 
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Middle note */}
      <motion.div
        className="absolute"
        style={{ top: 2, left: 2 }}
        initial={{ opacity: 0, x: -2, y: -2 }}
        animate={{ 
          opacity: 0.6,
          x: 0,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.15,
        }}
      >
        <Banknote 
          className="h-9 w-9 text-emerald-600" 
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Front note - brightest and animated */}
      <motion.div
        className="absolute"
        style={{ top: 0, left: 0 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
          delay: 0.2,
        }}
      >
        <motion.div
          animate={{ 
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Banknote 
            className="h-9 w-9 text-emerald-600" 
            strokeWidth={2}
          />
        </motion.div>
      </motion.div>

      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg bg-emerald-500/10 blur-md"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
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

