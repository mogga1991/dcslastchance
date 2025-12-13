'use client';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const responsiveButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Mobile-specific sizes
        "mobile-default": "h-12 px-6 py-3 text-base",
        "mobile-sm": "h-10 px-4 text-sm", 
        "mobile-lg": "h-14 px-8 text-lg",
        "mobile-icon": "h-12 w-12",
      },
      touchOptimized: {
        true: "touch-manipulation select-none",
        false: "",
      },
      loading: {
        true: "pointer-events-none",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      touchOptimized: false,
      loading: false,
    },
  }
);

export interface ResponsiveButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof responsiveButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  mobileSize?: "mobile-default" | "mobile-sm" | "mobile-lg" | "mobile-icon";
}

const ResponsiveButton = React.forwardRef<HTMLButtonElement, ResponsiveButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText = "Loading...",
    touchOptimized,
    icon,
    mobileSize,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isMobile = useIsMobile();
    const Comp = asChild ? Slot : "button";
    
    // Auto-optimize for touch on mobile devices
    const shouldOptimizeTouch = touchOptimized ?? isMobile;
    
    // Use mobile-specific size if provided and on mobile
    const finalSize = (isMobile && mobileSize) ? mobileSize : size;

    return (
      <Comp
        className={cn(
          responsiveButtonVariants({ 
            variant, 
            size: finalSize, 
            touchOptimized: shouldOptimizeTouch,
            loading,
            className 
          })
        )}
        ref={ref}
        disabled={disabled || loading}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || loading}
        aria-label={loading ? loadingText : undefined}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
          </>
        )}
      </Comp>
    );
  }
);

ResponsiveButton.displayName = "ResponsiveButton";

export { ResponsiveButton, responsiveButtonVariants };