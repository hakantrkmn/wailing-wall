import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface Post {
  id: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Posts'ları yükle
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/posts')
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        toast.error('Posts yüklenirken hata oluştu')
      }
    } catch {
      toast.error('Posts yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Yeni post oluştur
  const createPost = useCallback(async (content: string, author: string) => {
    try {
      setIsCreating(true)
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, author }),
      })

      if (response.ok) {
        const newPost = await response.json()
        setPosts(prevPosts => [newPost, ...prevPosts])
        toast.success('Post başarıyla oluşturuldu!')
        return newPost
      } else {
        const error = await response.json()
        toast.error(error.error || 'Post oluşturulurken hata oluştu')
        return null
      }
    } catch {
      toast.error('Post oluşturulurken hata oluştu')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [])

  // Post sil
  const deletePost = useCallback(async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
        toast.success('Post silindi')
        return true
      } else {
        toast.error('Post silinirken hata oluştu')
        return false
      }
    } catch {
      toast.error('Post silinirken hata oluştu')
      return false
    }
  }, [])

  // Post güncelle
  const updatePost = useCallback(async (postId: string, content: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId ? updatedPost : post
          )
        )
        toast.success('Post güncellendi')
        return updatedPost
      } else {
        toast.error('Post güncellenirken hata oluştu')
        return null
      }
    } catch {
      toast.error('Post güncellenirken hata oluştu')
      return null
    }
  }, [])

  // Component mount olduğunda posts'ları yükle
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    isCreating,
    fetchPosts,
    createPost,
    deletePost,
    updatePost,
    setPosts,
  }
}
