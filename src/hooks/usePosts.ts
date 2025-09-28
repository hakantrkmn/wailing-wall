import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface Post {
  id: string
  content: string
  author: string
  createdAt: string
  updatedAt: string
  clickCount?: number
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Posts'ları yükle
  const fetchPosts = useCallback(async (page = 1, date?: string, append = false, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true)
      } else {
        setIsLoading(true)
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      if (date) {
        params.append('date', date)
      }
      
      const response = await fetch(`/api/posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        const normalized = (data as Post[]).map(p => ({ ...p, clickCount: p.clickCount ?? 0 }))
        
        if (append) {
          setPosts(prev => [...prev, ...normalized])
        } else {
          setPosts(normalized)
        }
        
        setHasMore(normalized.length === 20)
        setCurrentPage(page)
      } else {
        toast.error('Error loading posts')
      }
    } catch {
      toast.error('Error loading posts')
    } finally {
      if (isLoadMore) {
        setIsLoadingMore(false)
      } else {
        setIsLoading(false)
      }
    }
  }, [])

  // Daha fazla post yükle
  const loadMore = useCallback(async (date?: string) => {
    if (!isLoading && !isLoadingMore && hasMore) {
      await fetchPosts(currentPage + 1, date, true, true)
    }
  }, [fetchPosts, currentPage, hasMore, isLoading, isLoadingMore])

  // Yeni post oluştur
  const createPost = useCallback(async (content: string, author?: string) => {
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
        toast.success('Post created successfully!')
        return newPost
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error creating post')
        return null
      }
    } catch {
      toast.error('Error creating post')
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
        toast.success('Post deleted')
        return true
      } else {
        toast.error('Error deleting post')
        return false
      }
    } catch {
      toast.error('Error deleting post')
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
        toast.success('Post updated')
        return updatedPost
      } else {
        toast.error('Error updating post')
        return null
      }
    } catch {
      toast.error('Error updating post')
      return null
    }
  }, [])

  const incrementClick = useCallback(async (postId: string) => {
    try {
      // optimistic update
      console.log('[incrementClick] optimistic +1 for', postId)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, clickCount: (p.clickCount ?? 0) + 1 } : p))
      const res = await fetch(`/api/posts/${postId}`, { method: 'PATCH' })
      if (!res.ok) {
        throw new Error('Increment failed')
      }
      const updated = await res.json()
      console.log('[incrementClick] server updated', postId, 'clickCount:', updated.clickCount)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, clickCount: updated.clickCount ?? (p.clickCount ?? 0) } : p))
    } catch {
      // rollback minimal (optional)
      console.log('[incrementClick] failed, rollback -1 for', postId)
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, clickCount: Math.max(0, (p.clickCount ?? 1) - 1) } : p))
    }
  }, [])

  // Component mount olduğunda posts'ları yükle
  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  return {
    posts,
    isLoading,
    isLoadingMore,
    isCreating,
    hasMore,
    currentPage,
    fetchPosts,
    loadMore,
    createPost,
    deletePost,
    updatePost,
    incrementClick,
    setPosts,
  }
}
