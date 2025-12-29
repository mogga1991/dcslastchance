import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ButtonColorfulProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

export function ButtonColorful({
    className,
    label = "Explore Components",
    ...props
}: ButtonColorfulProps) {
    return (
        <Button
            className={cn(
                "relative h-10 px-4 overflow-hidden",
                "bg-gradient-to-r from-indigo-600 to-indigo-700",
                "hover:from-indigo-700 hover:to-indigo-800",
                "transition-all duration-200",
                "group",
                className
            )}
            {...props}
        >
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                <span className="text-white font-bold">{label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </div>
        </Button>
    );
}
