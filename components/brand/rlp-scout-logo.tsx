import { cn } from "@/lib/utils";

type RLPScoutLogoProps = {
  variant?: "full" | "mark" | "wordmark";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

const WORDMARK_SIZES = {
  xs: "h-6",
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-16",
};

/**
 * RLP SCOUT Logo Component
 * variant: full (icon + text), mark (icon only), wordmark (text only)
 */
export function RLPScoutLogo({
  variant = "full",
  size = "md",
  className,
}: RLPScoutLogoProps) {
  if (variant === "mark") {
    return (
      <div className={cn("flex items-center justify-center", SIZES[size], className)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Scout Radar Mark */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-signal-orange"
            strokeWidth="3"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            className="stroke-signal-orange/40"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="15"
            className="stroke-signal-orange/20"
            strokeWidth="2"
            fill="none"
          />
          {/* Scanning beam */}
          <path
            d="M 50 50 L 50 10"
            className="stroke-signal-orange"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 50 50 L 80 30"
            className="stroke-signal-orange/60"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="4" className="fill-signal-orange" />
          {/* Detection blips */}
          <circle cx="65" cy="25" r="3" className="fill-federal-blue" />
          <circle cx="35" cy="40" r="2.5" className="fill-federal-blue/60" />
          <circle cx="70" cy="55" r="2" className="fill-federal-blue/40" />
        </svg>
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center gap-1.5", WORDMARK_SIZES[size], className)}>
        <span className="font-display font-bold text-navy-deep dark:text-white">
          RLP
        </span>
        <span className="font-display font-bold text-signal-orange">SCOUT</span>
      </div>
    );
  }

  // Full variant
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <RLPScoutLogo variant="mark" size={size} />
      <RLPScoutLogo variant="wordmark" size={size} />
    </div>
  );
}

/**
 * Simple text-based logo for contexts where SVG isn't needed
 */
export function RLPScoutText({ className }: { className?: string }) {
  return (
    <div className={cn("font-display text-xl font-bold", className)}>
      RLP <span className="text-signal-orange">SCOUT</span>
    </div>
  );
}
