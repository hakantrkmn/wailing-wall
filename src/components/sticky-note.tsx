"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Post } from "@/hooks/usePosts"

interface StickyNoteProps {
  post: Post
  sizeClass?: string
  onClick?: (post: Post) => void
  contentClassName?: string
  truncateAt?: number
}

function hashStringToNumber(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function StickyNote({ post, sizeClass, onClick, contentClassName, truncateAt }: StickyNoteProps) {
  const seed = useMemo(() => hashStringToNumber(post.id), [post.id])

  const rotation = useMemo(() => {
    const deg = (seed % 9) - 4 // -4..+4
    return deg
  }, [seed])

  const palette = useMemo(
    () => [
      { bg: "#f8f9fa", shadow: "#dee2e6" }, // soft grey
      { bg: "#f1f3f4", shadow: "#dadce0" }, // warm grey
      { bg: "#f3f4f6", shadow: "#d1d5db" }, // cool grey
      { bg: "#f9fafb", shadow: "#e5e7eb" }, // light grey
      { bg: "#fefefe", shadow: "#f3f4f6" }, // off-white
      { bg: "#fafafa", shadow: "#e5e5e5" }, // warm white
      { bg: "#f8fafc", shadow: "#e2e8f0" }, // slate grey
      { bg: "#f1f5f9", shadow: "#cbd5e1" }, // blue-grey
      { bg: "#fef7ed", shadow: "#fed7aa" }, // muted peach
      { bg: "#fdf4ff", shadow: "#e9d5ff" }, // soft lavender
      { bg: "#f0f9ff", shadow: "#bae6fd" }, // light blue
      { bg: "#f0fdf4", shadow: "#bbf7d0" }, // muted mint
      { bg: "#fef2f2", shadow: "#fca5a5" }, // soft rose
      { bg: "#fefce8", shadow: "#fde047" }, // cream yellow
      { bg: "#f3f4f6", shadow: "#d1d5db" }, // neutral grey
    ],
    []
  )

  const colorIndex = seed % palette.length
  const colors = palette[colorIndex]

  const baseTransition = useMemo(() => ({
    rotate: {
      duration: 8 + (seed % 3),
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "reverse" as const,
      delay: (seed % 25) / 12,
    },
    y: {
      duration: 6 + (seed % 2),
      repeat: Infinity,
      ease: "easeInOut",
      repeatType: "reverse" as const,
      delay: (seed % 30) / 15,
    },
    x: {
      duration: 0, // No horizontal movement
      repeat: 0,
    },
  }), [seed])

  const keyframes = useMemo(() => ({
    // Pendulum motion - only bottom part swings, top stays fixed
    rotate: [rotation, rotation + 1.2, rotation - 0.8, rotation + 0.6, rotation - 1.0, rotation],
    // Minimal vertical movement - just slight lift
    y: [0, 1, 0, 1.5, 0],
    // No horizontal movement - pendulum swings around fixed point
    x: [0, 0, 0, 0, 0],
  }), [rotation])

  const bodyClasses = sizeClass ?? "min-h-[120px] p-4"

  const tapeStyle = useMemo(() => {
    const rand = (offset: number) => (hashStringToNumber(`${post.id}-tape-${offset}`) % 1000) / 1000
    // Create torn edges effect with clip-path
    const leftTear = `${2 + rand(1) * 3}% ${8 + rand(2) * 4}%`
    const rightTear = `${98 - rand(3) * 3}% ${12 + rand(4) * 4}%`
    const clip = `polygon(${leftTear}, ${rightTear}, 100% ${88 - rand(5) * 8}%, ${90 - rand(6) * 6}% 100%, ${10 + rand(7) * 4}% 100%, 0% ${90 - rand(8) * 8}%)`
    
    return {
      backgroundColor: "#000000",
      boxShadow: "0 8px 16px -8px rgba(0,0,0,0.8)",
      clipPath: clip,
      WebkitClipPath: clip,
    }
  }, [post.id])

  return (
    <motion.div
      layout
      className={`relative cursor-pointer ${sizeClass ? '' : 'min-h-[120px]'}`}
      onClick={() => onClick?.(post)}
    >
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-4 h-7 w-24 opacity-90 z-20"
        style={{
          ...tapeStyle,
          transform: `translateX(-50%) rotate(${(seed % 6) - 3}deg)`
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: -12, rotate: rotation - 5, scale: 0.97 }}
        animate={{ 
          opacity: 1, 
          rotate: keyframes.rotate, 
          y: keyframes.y, 
          x: keyframes.x,
          scale: 1 
        }}
        whileHover={{ y: -8, rotate: rotation + 0.8, scale: 1.02 }}
        transition={baseTransition}
        style={{
          backgroundColor: colors.bg,
          boxShadow: `0 12px 22px -14px ${colors.shadow}`,
          transformOrigin: "top center",
          // Ensure the top part (where tape is) stays fixed
          borderTop: "2px solid transparent",
        }}
        className={`${bodyClasses} rounded-md text-sm text-gray-700 whitespace-pre-wrap relative z-10`}
      >
        <div className={`${contentClassName ?? ""}`}>
          {typeof truncateAt === 'number' && post.content.length > truncateAt
            ? `${post.content.slice(0, truncateAt).trimEnd()}...`
            : post.content}
        </div>
             <div className="mt-3 text-[11px] text-gray-700 flex items-center justify-between">
               <span className="font-semibold">{post.author || "Anonymous"}</span>
          <span>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}


