import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

interface NodeConfig {
  node: { x: number; y: number };
  text: { x: number; y: number; align: "left" | "right" };
  numberOffset: { x: number; y: number };
}

const CANVAS_W = 820;
const CANVAS_H = 360;

// Numbers now sit in dead space — below/left of node 1's text,
// far above node 2's text, and far below-left of node 3's text —
// instead of directly behind any copy.
const layout: NodeConfig[] = [
  { node: { x: 110, y: 250 }, text: { x: 110, y: 288, align: "left" }, numberOffset: { x: 30, y: 130 } },
  { node: { x: 410, y: 90 },  text: { x: 410, y: 20,  align: "left" }, numberOffset: { x: 560, y: 40 } },
  { node: { x: 700, y: 170 }, text: { x: 700, y: 210, align: "right" }, numberOffset: { x: 300, y: 250 } },
];

const WAVE_PATH =
  "M 40 280 C 140 280, 170 110, 260 100 C 330 92, 360 65, 410 90 " +
  "C 470 118, 520 240, 620 200 C 660 184, 660 155, 700 170 C 740 185, 760 155, 790 155";

export default function HowItWorksInfographic({ items }: { items: StepItem[] }) {
  const nodes = items.slice(0, 3).map((item, i) => ({ item, ...layout[i] }));

  return (
    <div className="relative mx-auto" style={{ width: CANVAS_W, height: CANVAS_H }}>
      {/* Wave connector */}
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <linearGradient id="soroWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E8834A" />
            <stop offset="50%" stopColor="#F5C842" />
            <stop offset="100%" stopColor="#E8834A" />
          </linearGradient>
        </defs>
        <motion.path
          d={WAVE_PATH}
          fill="none"
          stroke="url(#soroWaveGradient)"
          strokeWidth={6}
          strokeLinecap="round"
          opacity={0.15}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.path
          d={WAVE_PATH}
          fill="none"
          stroke="url(#soroWaveGradient)"
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>

      {nodes.map((n, i) => (
        <div key={i}>
          {/* Giant number — parked in clear space, never under the text block */}
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="absolute font-display font-black text-soro-fade select-none pointer-events-none"
            style={{
              left: n.numberOffset.x,
              top: n.numberOffset.y,
              fontSize: 96,
              opacity: 0.08,
              lineHeight: 1,
              zIndex: 0,
            }}
          >
            {n.item.step}
          </motion.span>

          {/* Icon node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="absolute w-16 h-16 rounded-2xl bg-soro-surface border border-soro-ember/20 shadow-lg shadow-black/20 flex items-center justify-center"
            style={{
              left: n.node.x - 32,
              top: n.node.y - 32,
              boxShadow: "0 0 24px rgba(232, 131, 74, 0.25)",
              zIndex: 10,
            }}
          >
            <n.item.icon size={26} className="text-soro-ember" strokeWidth={1.75} />
          </motion.div>

          {/* Text block — scrim behind it guarantees contrast no matter what's underneath */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 + 0.1 }}
            className="absolute w-52 rounded-xl px-1 py-1"
            style={{
              left: n.text.align === "left" ? n.text.x : n.text.x - 208,
              top: n.text.y,
              textAlign: n.text.align,
              zIndex: 20,
              background:
                "radial-gradient(ellipse at center, rgba(10,10,14,0.55) 0%, rgba(10,10,14,0) 75%)",
            }}
          >
            <h3 className="text-base font-display font-semibold text-soro-mist mb-1">
              {n.item.title}
            </h3>
            <p className="text-sm text-soro-fade leading-relaxed">
              {n.item.description}
            </p>
          </motion.div>
        </div>
      ))}
    </div>
  );
}