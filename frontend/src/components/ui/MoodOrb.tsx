import { motion } from "framer-motion";
import { Flame, Wind, Shuffle, Minus, Sun, type LucideIcon } from "lucide-react";
import type { MoodState } from "@/stores/checkinStore";
import { MOOD_LABELS, MOOD_COLORS } from "@/stores/checkinStore";

interface MoodOrbProps {
  selected: MoodState | null;
  onSelect: (mood: MoodState) => void;
  size?: "sm" | "lg";
}

const moods: MoodState[] = ["at_limit", "managing", "mixed", "okay", "good"];

const moodIcons: Record<MoodState, LucideIcon> = {
  at_limit: Flame,
  managing: Wind,
  mixed: Shuffle,
  okay: Minus,
  good: Sun,
};

// Slight fan rotation per card, mirroring the reference image's spread
const cardRotation: Record<MoodState, number> = {
  at_limit: -8,
  managing: -4,
  mixed: 0,
  okay: 4,
  good: 8,
};

const sizeStyles: Record<string, { card: string; icon: number }> = {
  sm: { card: "w-16 h-20", icon: 20 },
  lg: { card: "w-20 h-28 md:w-24 md:h-32", icon: 28 },
};

export default function MoodOrb({
  selected,
  onSelect,
  size = "lg",
}: MoodOrbProps) {
  const { card, icon: iconSize } = sizeStyles[size];

  return (
    <div className="flex items-center justify-center">
      {moods.map((mood, i) => {
        const isSelected = selected === mood;
        const color = MOOD_COLORS[mood];
        const Icon = moodIcons[mood];
        const rotation = cardRotation[mood];

        return (
          <motion.button
            key={mood}
            onClick={() => onSelect(mood)}
            initial={false}
            animate={{
              rotate: isSelected ? 0 : rotation,
              y: isSelected ? -14 : 0,
              scale: isSelected ? 1.08 : 1,
            }}
            whileHover={{ y: -10, scale: 1.05, rotate: 0 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            style={{
              marginLeft: i === 0 ? 0 : -14,
              zIndex: isSelected ? 20 : i,
            }}
            className={`
              relative flex flex-col items-center justify-center gap-2
              rounded-2xl bg-soro-deep/90 backdrop-blur-sm
              border transition-colors duration-300
              ${card}
              ${isSelected ? "border-white/10" : "border-white/5"}
            `}
          >
            {/* Ambient glow behind icon */}
            <div
              className="absolute inset-0 rounded-2xl transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${color}${isSelected ? "35" : "18"}, transparent 70%)`,
                opacity: isSelected ? 1 : 0.7,
              }}
            />

            {/* Glowing icon */}
            <div className="relative z-10 flex items-center justify-center">
              <Icon
                size={iconSize}
                strokeWidth={1.75}
                style={{
                  color,
                  filter: isSelected
                    ? `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}80)`
                    : `drop-shadow(0 0 6px ${color}60)`,
                }}
              />
            </div>

            {/* Label */}
            <span
              className="relative z-10 font-medium text-center leading-tight px-1"
              style={{
                color: isSelected ? color : "rgba(255,255,255,0.55)",
                fontSize: size === "lg" ? "10px" : "8px",
              }}
            >
              {MOOD_LABELS[mood]}
            </span>

            {/* Bottom edge highlight when selected, echoes the lit border in the reference */}
            {isSelected && (
              <motion.div
                layoutId="mood-selected-border"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ boxShadow: `0 0 0 1.5px ${color}, 0 8px 24px -4px ${color}50` }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
