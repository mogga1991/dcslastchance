import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
}

export function Section({ children, className, dark = false, id }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "py-20",
        dark ? "bg-[var(--color-fedspace-navy)] text-white" : "bg-white",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("text-center mb-16", className)}>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
