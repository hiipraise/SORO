import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface ProblemItem {
  icon: LucideIcon;
  text: string;
}

interface NodeConfig {
  circle: { x: number; y: number; r: number };
  card: { x: number; y: number; w: number; align: "left" | "right" | "center" };
  bg: string;   // tailwind bg class for the circle
  stroke: string; // hex, used for the SVG line + dots
}

const CANVAS_W = 700;
const CANVAS_H = 460;
const CARD_H = 88;

const layout: NodeConfig[] = [
  {
    circle: { x: 110, y: 90, r: 60 },
    card: { x: 10, y: 250, w: 210, align: "left" },
    bg: "bg-soro-ember",
    stroke: "#E8834A",
  },
  {
    circle: { x: 350, y: 230, r: 54 },
    card: { x: 250, y: 20, w: 200, align: "center" },
    bg: "bg-soro-gold",
    stroke: "#F5C842",
  },
  {
    circle: { x: 590, y: 90, r: 60 },
    card: { x: 480, y: 250, w: 210, align: "right" },
    bg: "bg-soro-ember",
    stroke: "#E8834A",
  },
];

export default function ProblemInfographic({ items }: { items: ProblemItem[] }) {
  const nodes = items.slice(0, 3).map((item, i) => ({ item, ...layout[i] }));

  return (
    <div className="relative mx-auto" style={{ width: CANVAS_W, height: CANVAS_H }}>
      {/* Connector lines */}
      <svg
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {nodes.map((n, i) => {
          const cardBelow = n.card.y > n.circle.y;
          const startY = cardBelow ? n.circle.y + n.circle.r : n.circle.y - n.circle.r;
          const endY = cardBelow ? n.card.y : n.card.y + CARD_H;
          const endX =
            n.card.align === "left"
              ? n.card.x + n.card.w - 24
              : n.card.align === "right"
              ? n.card.x + 24
              : n.card.x + n.card.w / 2;
          const midY = (startY + endY) / 2;
          const d = `M ${n.circle.x} ${startY} C ${n.circle.x} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

          return (
            <g key={i}>
              <motion.path
                d={d}
                fill="none"
                stroke={n.stroke}
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
              />
              <circle cx={n.circle.x} cy={startY} r={5} fill={n.stroke} />
              <circle cx={endX} cy={endY} r={5} fill={n.stroke} />
            </g>
          );
        })}
      </svg>

      {nodes.map((n, i) => (
        <motion.div key={`circle-${i}`}>
          {/* Icon circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className={`absolute rounded-full ${n.bg} shadow-lg shadow-black/20 flex items-center justify-center ring-4 ring-soro-deep`}
            style={{
              left: n.circle.x - n.circle.r,
              top: n.circle.y - n.circle.r,
              width: n.circle.r * 2,
              height: n.circle.r * 2,
            }}
          >
            <n.item.icon size={n.circle.r * 0.55} className="text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Text card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 + 0.1 }}
            className="absolute rounded-2xl bg-soro-surface border border-soro-earth/15 px-4 py-3 shadow-md shadow-black/10"
            style={{ left: n.card.x, top: n.card.y, width: n.card.w }}
          >
            <p className="text-sm text-soro-mist leading-relaxed">{n.item.text}</p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
