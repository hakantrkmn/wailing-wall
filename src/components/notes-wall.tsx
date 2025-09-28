"use client"

import { Post } from "@/hooks/usePosts"
import { StickyNote } from "./sticky-note"
import { LayoutGroup, motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

interface NotesWallProps {
  posts: Post[]
  onNoteClick?: (post: Post) => void
}

export function NotesWall({ posts, onNoteClick }: NotesWallProps) {
  const [selected, setSelected] = useState<Post | null>(null)

  return (
    <LayoutGroup>
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
      >
        {posts.map((post) => (
          <motion.div key={post.id} layout>
            <StickyNote post={post} onClick={(p) => { console.log('[note click]', p.id, 'clickCount:', p.clickCount); onNoteClick?.(p); setSelected(p) }} truncateAt={220} />
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-[60] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0"
              onClick={() => setSelected(null)}
              initial={{ 
                backdropFilter: "blur(0px)",
                backgroundColor: "rgba(0, 0, 0, 0)"
              }}
              animate={{ 
                backdropFilter: "blur(8px)",
                backgroundColor: "rgba(0, 0, 0, 0.4)"
              }}
              exit={{ 
                backdropFilter: "blur(0px)",
                backgroundColor: "rgba(0, 0, 0, 0)"
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
            <motion.div
              layout
              className="relative z-[61] max-w-2xl w-[92vw]"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <StickyNote
                post={selected}
                sizeClass="min-h-[200px] p-6"
                contentClassName="max-h-[50vh] overflow-y-auto"
                onClick={() => {}}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}


