"use client";

import React from "react"
import { motion } from "framer-motion"

import { AnimatedGradient } from "@/components/ui/animated-gradient-with-svg"

interface BentoCardProps {
  title: string
  value: string | number
  subtitle?: string
  colors: string[]
  delay: number
}

const BentoCard: React.FC<BentoCardProps> = ({
  title,
  value,
  subtitle,
  colors,
  delay,
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay + 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="relative overflow-hidden h-full bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <AnimatedGradient colors={colors} speed={0.05} blur="medium" />
      <motion.div
        className="relative z-10 p-3 sm:p-5 md:p-8 text-foreground backdrop-blur-sm"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h3
          className="text-sm sm:text-base md:text-lg text-foreground"
          variants={item}
        >
          {title}
        </motion.h3>
        <motion.p
          className="text-2xl sm:text-4xl md:text-5xl font-medium mb-4 text-foreground"
          variants={item}
        >
          {value}
        </motion.p>
        {subtitle && (
          <motion.p
            className="text-sm text-foreground/80"
            variants={item}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}

const AnimatedStatsSection: React.FC = () => {
  return (
    <div className="w-full bg-white h-full py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Platform Performance Metrics
          </h2>
          <p className="text-lg text-gray-600">
            Real-time data from our enterprise intelligence platform serving government contractors and commercial organizations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 min-h-[600px]">
          <div className="md:col-span-2">
            <BentoCard
              title="Federal Contract Opportunities Tracked"
              value="$700B+"
              subtitle="Annual procurement spend monitored across all federal agencies"
              colors={["#3B82F6", "#60A5FA", "#93C5FD"]}
              delay={0.2}
            />
          </div>
          <BentoCard
            title="Analysis Time Saved"
            value="10+ hrs"
            subtitle="Per RFP analysis vs manual review"
            colors={["#60A5FA", "#34D399", "#93C5FD"]}
            delay={0.4}
          />
          <BentoCard
            title="Extraction Accuracy"
            value="95%+"
            subtitle="AI-powered requirement extraction confidence"
            colors={["#F59E0B", "#A78BFA", "#FCD34D"]}
            delay={0.6}
          />
          <div className="md:col-span-2">
            <BentoCard
              title="Data Points Extracted Per Document"
              value="50+"
              subtitle="From requirements to evaluation criteria to competitive intelligence"
              colors={["#3B82F6", "#A78BFA", "#FBCFE8"]}
              delay={0.8}
            />
          </div>
          <div className="md:col-span-3">
            <BentoCard
              title="Multi-Vertical Coverage"
              value="6+ Industries"
              subtitle="Federal contracting • Commercial RE • Grants • Legal • BD • Supply Chain"
              colors={["#EC4899", "#F472B6", "#3B82F6"]}
              delay={1}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedStatsSection
