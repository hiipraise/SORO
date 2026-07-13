import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ScribbleProps {
  children: ReactNode;
  className?: string;
}

export function ScribbleCircle({ children, className = "" }: ScribbleProps) {
  return (
    <span className="relative inline-block">
      <span className={`relative z-10 ${className}`}>{children}</span>
      <svg
        viewBox="0 0 300 100"
        preserveAspectRatio="none"
        className="absolute -inset-x-3 -inset-y-2 w-[calc(100%+1.5rem)] h-[calc(100%+1rem)] pointer-events-none"
      >
        <motion.path
          d="M 24,58 C 8,24 58,6 152,8 C 252,10 292,22 282,48
             C 272,80 198,94 138,90 C 66,86 12,72 18,46
             C 20,30 42,12 96,10"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="text-soro-ember"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 1.1,
            ease: "easeInOut",
            delay: 0.5,
            repeat: Infinity,
            repeatType: "mirror",
            repeatDelay: 2.5,
          }}
        />
      </svg>
    </span>
  );
}

export function ScribbleUnderline({ children, className = "" }: ScribbleProps) {
  return (
    <span className="relative inline-block">
      <span className={`relative z-10 ${className}`}>{children}</span>
      <svg
        viewBox="0 0 300 30"
        preserveAspectRatio="none"
        className="absolute left-0 -bottom-1 w-full h-[0.5em] pointer-events-none"
      >
        <motion.path
          d="M 4,16 C 60,6 110,22 160,12 C 210,4 250,20 296,10"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          className="text-soro-ember"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            delay: 0.6,
            repeat: Infinity,
            repeatType: "mirror",
            repeatDelay: 2,
          }}
        />
        {/* second messier pass for that "went over it twice" marker feel */}
        <motion.path
          d="M 6,20 C 70,10 120,24 170,16 C 220,10 260,22 294,14"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-soro-ember/60"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            ease: "easeInOut",
            delay: 0.9,
            repeat: Infinity,
            repeatType: "mirror",
            repeatDelay: 2,
          }}
        />
      </svg>
    </span>
  );
}

export function MarkerHighlightBehind({ children, className = "" }: ScribbleProps) {
  return (
    <span className="relative inline-block px-1">
      <motion.span
        aria-hidden
        className="absolute inset-0 -inset-x-1 rounded-[2px] bg-soro-ember/25 -rotate-1"
        style={{ transformOrigin: "left center" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: 0.55,
          ease: [0.65, 0, 0.35, 1],
          delay: 0.4,
          repeat: Infinity,
          repeatType: "mirror",
          repeatDelay: 2,
        }}
      />
      <span className={`relative z-10 ${className}`}>{children}</span>
    </span>
  );
}
