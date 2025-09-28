"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Post, usePosts } from "@/hooks/usePosts"
import { useUser } from "@/hooks/useUser"

interface CreatePostProps {
  onPostCreated: (post: Post) => void
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const { user } = useUser()
  const { createPost, isCreating } = usePosts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      return
    }

    if (!user) {
      return
    }

    const success = await createPost(content.trim(), user)
    if (success) {
      setContent("")
      console.log(success as Post)
      onPostCreated(success as Post)
    }
  }

  if (!user) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Yeni Post Yaz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Ne düşünüyorsun?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isCreating}
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {content.length}/500 karakter
            </span>
            <Button 
              type="submit" 
              disabled={!content.trim() || isCreating}
            >
              {isCreating ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
