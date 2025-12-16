import { cn } from "@/lib/utils";

type FedSpaceLogoProps = {
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

const _FULL_LOGO_SIZES = {
  xs: { width: 120, height: 24 },
  sm: { width: 160, height: 32 },
  md: { width: 200, height: 40 },
  lg: { width: 240, height: 48 },
  xl: { width: 300, height: 60 },
};

const WORDMARK_SIZES = {
  xs: "h-6",
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-16",
};

/**
 * FedSpace Logo Component
 * variant: full (icon + text), mark (icon only), wordmark (text only)
 */
export function FedSpaceLogo({
  variant = "full",
  size = "md",
  className,
}: FedSpaceLogoProps) {
  if (variant === "mark") {
    return (
      <div className={cn("flex items-center justify-center", SIZES[size], className)}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          {/* Circular Badge */}
          <circle
            cx="50"
            cy="50"
            r="45"
            className="fill-[#5B3FD9]"
          />

          {/* Rocket Body */}
          <path
            d="M 50 25 L 45 55 L 55 55 Z"
            className="fill-white"
          />

          {/* Rocket Nose */}
          <path
            d="M 50 20 L 45 25 L 55 25 Z"
            className="fill-white"
          />

          {/* Left Fin */}
          <path
            d="M 45 45 L 40 55 L 45 55 Z"
            className="fill-white/80"
          />

          {/* Right Fin */}
          <path
            d="M 55 45 L 60 55 L 55 55 Z"
            className="fill-white/80"
          />

          {/* Rocket Window */}
          <circle
            cx="50"
            cy="35"
            r="4"
            className="fill-[#5B3FD9] stroke-white"
            strokeWidth="1"
          />

          {/* Flame - Left */}
          <path
            d="M 45 55 L 43 65 L 45 58 Z"
            className="fill-[#FF6B35]"
          />

          {/* Flame - Center */}
          <path
            d="M 48 55 L 50 70 L 52 55 Z"
            className="fill-[#FFB347]"
          />

          {/* Flame - Right */}
          <path
            d="M 55 55 L 57 65 L 55 58 Z"
            className="fill-[#FF6B35]"
          />

          {/* Stars around rocket */}
          <circle cx="35" cy="30" r="1.5" className="fill-white/60" />
          <circle cx="65" cy="35" r="1.5" className="fill-white/60" />
          <circle cx="70" cy="50" r="1" className="fill-white/40" />
          <circle cx="30" cy="50" r="1" className="fill-white/40" />
        </svg>
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={cn("flex items-center gap-0", WORDMARK_SIZES[size], className)}>
        <span className="font-display font-bold text-navy-deep dark:text-white">
          FedSpace
        </span>
      </div>
    );
  }

  // Full variant - simple text-based logo
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span className="font-display text-3xl font-bold text-white">
        FedSpace
      </span>
    </div>
  );
}

/**
 * Simple text-based logo for contexts where SVG isn't needed
 */
export function FedSpaceText({ className }: { className?: string }) {
  return (
    <div className={cn("font-display text-xl font-bold text-gray-900", className)}>
      FedSpace
    </div>
  );
}
