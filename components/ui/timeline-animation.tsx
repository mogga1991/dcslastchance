'use client'

import { motion, Variants } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, ElementType } from "react"
import { cn } from "@/lib/utils"

interface TimelineContentProps {
  children: React.ReactNode
  animationNum: number
  timelineRef?: React.RefObject<HTMLElement | null>
  customVariants?: Variants
  className?: string
  as?: ElementType
}

export function TimelineContent({
  children,
  animationNum,
  timelineRef: _timelineRef,
  customVariants,
  className,
  as: Component = "div",
}: TimelineContentProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px",
    amount: 0.3
  })

  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)"
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

  const variants = customVariants || defaultVariants

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      variants={variants}
      className={cn(className)}
    >
      {Component === "div" ? children : <Component className={className}>{children}</Component>}
    </motion.div>
  )
}
