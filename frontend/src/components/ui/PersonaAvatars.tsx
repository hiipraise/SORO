import type { SVGProps } from "react";

// ─── Student ─── Graduation cap with tassel — warm ember tones
export function StudentAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      {...props}
    >
      {/* Mortarboard */}
      <path
        d="M24 6L6 18L24 30L42 18L24 6Z"
        className="text-soro-ember"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tassel */}
      <path
        d="M24 30V38"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="40"
        r="2"
        className="text-soro-gold"
        fill="currentColor"
      />
      {/* Book */}
      <path
        d="M18 24C18 24 16 28 18 32C20 36 24 34 24 34"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
    </svg>
  );
}

// ─── Young Grad ─── Briefcase with growth arrow — gold tones
export function GradAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      {...props}
    >
      {/* Briefcase */}
      <rect
        x="8"
        y="18"
        width="32"
        height="22"
        rx="3"
        className="text-soro-gold"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Briefcase handle */}
      <path
        d="M18 18V13C18 11.9 18.9 11 20 11H28C29.1 11 30 11.9 30 13V18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Growth arrow */}
      <path
        d="M16 30L22 24L27 27L34 20"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 20H34V26"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── In Debt ─── Small sprout growing from a coin — earth tones
export function DebtAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      {...props}
    >
      {/* Coin */}
      <circle
        cx="24"
        cy="32"
        r="10"
        className="text-soro-earth"
        fill="currentColor"
        fillOpacity={0.15}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      {/* Coin ₦ symbol */}
      <text
        x="24"
        y="35"
        textAnchor="middle"
        className="text-soro-earth"
        fill="currentColor"
        fontSize="10"
        fontWeight="bold"
        dominantBaseline="middle"
      >
        ₦
      </text>
      {/* Sprout */}
      <path
        d="M24 22V12"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M24 12C22 14 20 16 20 18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 12C26 14 28 16 28 18"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small leaf */}
      <ellipse
        cx="27"
        cy="14"
        rx="3"
        ry="1.5"
        className="text-soro-ember"
        fill="currentColor"
        fillOpacity={0.4}
        stroke="currentColor"
        strokeWidth={0.8}
        transform="rotate(-20 27 14)"
      />
    </svg>
  );
}

// ─── Grieving ─── Gentle falling leaf — soft info/calm tones
export function GrievingAvatar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      className="text-soro-info"
      {...props}
    >
      {/* Falling leaf */}
      <path
        d="M28 10C28 10 34 14 34 20C34 26 28 30 28 30"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 10C28 10 22 14 22 20C22 26 28 30 28 30"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.5}
      />
      {/* Leaf vein */}
      <path
        d="M28 16V26"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* Gentle ripple lines (calm) */}
      <path
        d="M14 36C14 36 18 40 24 38C30 36 34 40 34 40"
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        opacity={0.4}
      />
      <path
        d="M16 40C16 40 20 43 24 41C28 39 32 43 32 43"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        opacity={0.25}
      />
    </svg>
  );
}
