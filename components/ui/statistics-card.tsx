"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const css = `
.candy-bg {
    background-color: hsl(0 0% 96%, 2%);
    background-image: linear-gradient(
      135deg,
      hsl(0 0% 96%) 25%,
      transparent 25.5%,
      transparent 50%,
      hsl(0 0% 96%) 50.5%,
      hsl(0 0% 96%) 75%,
      transparent 75.5%,
      transparent
    );
    background-size: 10px 10px;
  }`;

const Stats = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-white to-gray-50 w-full">
      <style>{css}</style>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Primary Headline */}
        <div className="mx-auto max-w-4xl text-center mb-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Most GovCon AI Tools Assist.{" "}
            <span className="text-blue-600">Ours Delivers Outcomes.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            While other platforms optimize pieces of the process, our system intelligence orchestrates the entire government contracting lifecycle — from opportunity discovery to final submission and beyond.
          </p>
        </div>

        {/* Chart Title */}
        <div className="mx-auto max-w-4xl text-center mt-20 mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">
            Comparative Impact of GovCon AI Platforms
          </h2>
          <p className="text-base text-gray-500">
            Metric: Real-World Win Acceleration & Decision Accuracy
          </p>
        </div>

        {/* Chart */}
        <div className="relative mx-auto mt-12 flex h-112 max-w-6xl items-center justify-center gap-4 px-4">
          {[
            { value: 35, label: "Template-Driven AI", sublabel: "(Sweetspot)", delay: 0.2 },
            { value: 25, label: "Advisory AI", sublabel: "(GovDash)", delay: 0.4 },
            {
              value: 99,
              label: "System Intelligence",
              sublabel: "(FedSpace)",
              className: "bg-sky-400",
              showToolTip: true,
              delay: 0.6,
            },
            { value: 37, label: "Writing-Only AI", sublabel: "(Unanet)", delay: 0.8 },
          ].map((props, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.2,
                type: "spring",
                damping: 10,
              }}
              className="h-full w-full"
            >
              <BarChart {...props} />
            </motion.div>
          ))}
        </div>

        {/* Why the Gap Is So Large */}
        <div className="mx-auto max-w-4xl mt-24 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Why the Gap Is So Large
          </h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Most government contracting AI tools were built to <strong>assist humans</strong>.
            <br />
            Ours was built to <strong>run the system</strong>.
          </p>

          <div className="grid md:grid-cols-2 gap-12 mt-12 text-left">
            <div>
              <h3 className="text-lg font-semibold text-gray-500 mb-4">
                While others focus on:
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Drafting responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Searching opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Organizing documents</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-600 mb-4">
                Our platform:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Ingests and understands full solicitations (PDFs, attachments, amendments)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Scores opportunities against your actual capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Produces defensible bid / no-bid recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Orchestrates proposal assembly, compliance, and execution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Learns from every submission to improve future outcomes</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-lg text-gray-600 mt-12 italic">
            That's why the performance difference isn't incremental — it's <strong>structural</strong>.
          </p>
        </div>

        {/* Authority Statement */}
        <div className="mx-auto max-w-3xl mt-16 text-center">
          <blockquote className="text-2xl md:text-3xl font-medium text-gray-800 italic border-l-4 border-blue-600 pl-6 py-4">
            "This isn't AI layered onto government contracting — it's government contracting rebuilt around intelligence."
          </blockquote>
        </div>

        {/* CTAs */}
        <div className="mx-auto max-w-2xl mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6">
            See How System Intelligence Changes Your Win Rate
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base">
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="gap-2 text-base">
                View a Real Opportunity Walkthrough
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Stats };

const BarChart = ({
  value,
  label,
  sublabel,
  className = "",
  showToolTip = false,
  delay = 0,
}: {
  value: number;
  label: string;
  sublabel?: string;
  className?: string;
  showToolTip?: boolean;
  delay?: number;
}) => {
  return (
    <div className="group relative h-full w-full">
      <div className="candy-bg relative h-full w-full overflow-hidden rounded-[40px]">
        <motion.div
          initial={{ opacity: 0, y: 100, height: 0 }}
          animate={{ opacity: 1, y: 0, height: `${value}%` }}
          transition={{ duration: 0.5, type: "spring", damping: 20, delay }}
          className={cn(
            "absolute bottom-0 mt-auto w-full rounded-[40px] bg-primary/80 p-3 text-white",
            className,
          )}
        >
          <div className="relative flex h-15 w-full items-center justify-center gap-2 rounded-full bg-muted/20 tracking-tighter">
            <NumberFlow value={value} suffix="%" />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 100, height: 0 }}
        animate={{ opacity: 1, y: 0, height: `${value}%` }}
        transition={{ duration: 0.5, type: "spring", damping: 15, delay }}
        className="absolute bottom-0 w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: showToolTip ? 1 : 0, y: showToolTip ? 0 : 100 }}
          transition={{ duration: 0.5, type: "spring", damping: 15, delay }}
          className={cn(
            "absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-muted-foreground px-3 py-1.5 text-sm text-white font-medium",
            className,
          )}
        >
          <div
            className={cn(
              "absolute -bottom-9 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-muted-foreground transition-all duration-300 ease-in-out",
              className,
            )}
          />
          <svg
            className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2",
              className.includes("bg-sky-400")
                ? "text-sky-400"
                : "text-muted-foreground",
            )}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.83855 8.41381C4.43827 9.45255 5.93756 9.45255 6.53728 8.41381L9.65582 3.01233C10.2555 1.97359 9.50589 0.675159 8.30646 0.675159H2.06937C0.869935 0.675159 0.120287 1.97359 0.720006 3.01233L3.83855 8.41381Z"
              fill="currentColor"
            />
          </svg>
          Win Rate
        </motion.div>
      </motion.div>
      <div className="mx-auto mt-3 text-center">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
};
