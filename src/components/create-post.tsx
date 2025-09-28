"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Post, usePosts } from "@/hooks/usePosts"
import { motion } from "framer-motion"

interface CreatePostProps {
  onPostCreated: (post: Post) => void
  currentUser?: string
}

export function CreatePost({ onPostCreated, currentUser }: CreatePostProps) {
  const [content, setContent] = useState("")
  const { createPost, isCreating } = usePosts()


  function hashStringToNumber(input: string): number {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  const seed = hashStringToNumber("composer")
  const palette = [
    { bg: "#f8f9fa", shadow: "#dee2e6" }, // soft grey
    { bg: "#f1f3f4", shadow: "#dadce0" }, // warm grey
    { bg: "#f3f4f6", shadow: "#d1d5db" }, // cool grey
    { bg: "#f9fafb", shadow: "#e5e7eb" }, // light grey
    { bg: "#fefefe", shadow: "#f3f4f6" }, // off-white
  ]
  const colors = palette[seed % palette.length]
  const rotation = (seed % 7) - 3 // -3..+3

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      return
    }

    const success = await createPost(content.trim(), currentUser || undefined)
    if (success) {
      setContent("")
      onPostCreated(success as Post)
    }
  }, [content, currentUser, createPost, onPostCreated])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, rotate: rotation - 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
      whileHover={{ y: -4, rotate: rotation + 1, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative p-4 rounded-md shadow-lg mb-6"
      style={{ backgroundColor: colors.bg, boxShadow: `0 10px 20px -10px ${colors.shadow}` }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2 -top-3 h-5 w-16 opacity-90"
        style={{ 
          backgroundColor: "#000000",
          boxShadow: "0 8px 16px -8px rgba(0,0,0,0.8)",
          clipPath: "polygon(5% 10%, 95% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 90%)",
          WebkitClipPath: "polygon(5% 10%, 95% 15%, 100% 85%, 90% 100%, 10% 100%, 0% 90%)",
          rotate: `${(seed % 10) - 5}deg` 
        }}
      />
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Write whatever comes to mind. It will be shared anonymously."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isCreating}
          className="min-h-[100px] resize-none bg-transparent border-none focus-visible:ring-0 placeholder:text-gray-600 text-gray-800"
          maxLength={3000}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {content.length}/3000 characters
          </span>
          <Button 
            type="submit" 
            disabled={!content.trim() || isCreating}
          >
            {isCreating ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
