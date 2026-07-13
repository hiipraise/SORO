interface MosaicImage {
  src: string;
  alt: string;
}

interface HeroMosaicProps {
  images: MosaicImage[]; // expects 5
  className?: string;
}

const STRIP_COUNT = 5;
const SLANT_PCT = 5;

function getStripClipPath(index: number): string {
  const w = 100 / STRIP_COUNT;

  const cutTop = (i: number) => {
    if (i === 0) return 0;
    if (i === STRIP_COUNT) return 100;
    return i * w + SLANT_PCT;
  };
  const cutBottom = (i: number) => {
    if (i === 0) return 0;
    if (i === STRIP_COUNT) return 100;
    return i * w - SLANT_PCT;
  };

  const topLeft = cutTop(index);
  const topRight = cutTop(index + 1);
  const bottomRight = cutBottom(index + 1);
  const bottomLeft = cutBottom(index);

  return `polygon(${topLeft}% 0%, ${topRight}% 0%, ${bottomRight}% 100%, ${bottomLeft}% 100%)`;
}

// Alternating pan directions/durations per strip index, so the 5 strips
// drift independently instead of pulsing together.
const DRIFT_VARIANTS = [
  { animation: "soro-drift-a 18s ease-in-out infinite", origin: "20% 30%" },
  { animation: "soro-drift-b 22s ease-in-out infinite", origin: "70% 40%" },
  { animation: "soro-drift-a 26s ease-in-out infinite", origin: "50% 20%" },
  { animation: "soro-drift-b 20s ease-in-out infinite", origin: "30% 60%" },
  { animation: "soro-drift-a 24s ease-in-out infinite", origin: "80% 50%" },
];

export default function HeroMosaic({ images, className = "" }: HeroMosaicProps) {
  const strips = images.slice(0, STRIP_COUNT);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Keyframes scoped locally so this component is drop-in anywhere */}
      <style>{`
        @keyframes soro-drift-a {
          0%   { transform: scale(1.08) translate(0%, 0%); }
          50%  { transform: scale(1.16) translate(-2%, 2%); }
          100% { transform: scale(1.08) translate(0%, 0%); }
        }
        @keyframes soro-drift-b {
          0%   { transform: scale(1.1) translate(0%, 0%); }
          50%  { transform: scale(1.18) translate(2%, -2%); }
          100% { transform: scale(1.1) translate(0%, 0%); }
        }
      `}</style>

      {strips.map((img, i) => {
        const variant = DRIFT_VARIANTS[i % DRIFT_VARIANTS.length];
        return (
          <div
            key={i}
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: getStripClipPath(i) }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                animation: variant.animation,
                transformOrigin: variant.origin,
                willChange: "transform",
              }}
              onError={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
