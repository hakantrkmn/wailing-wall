"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { UsernameModal } from "@/components/username-modal"
import { useUser } from "@/hooks/useUser"
import { usePosts } from "@/hooks/usePosts"
import { Card, CardContent } from "@/components/ui/card"
import { CreatePost } from "@/components/create-post"
import { NotesWall } from "@/components/notes-wall"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, setUsername } = useUser()
  const { posts, isLoading: postsLoading, isLoadingMore, setPosts, incrementClick, hasMore, loadMore, fetchPosts } = usePosts()
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    console.log('[clickCounts]', posts.map(p => ({ id: p.id, c: p.clickCount ?? 0 })))
  }, [posts])

  // Load more handler
  const handleLoadMore = useCallback(async () => {
    if (hasMore && !postsLoading && !isLoadingMore) {
      await loadMore(selectedDate)
    }
  }, [hasMore, postsLoading, isLoadingMore, loadMore, selectedDate])

  // Tarih değiştiğinde filtrele
  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    fetchPosts(1, date)
  }

  // Tarih filtresini temizle
  const clearDateFilter = () => {
    setSelectedDate('')
    fetchPosts(1)
  }


  return (
    <div className="relative min-h-screen py-8 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
      <div className="pointer-events-none absolute inset-0 wind-overlay" aria-hidden />
      <div className="pointer-events-none absolute inset-0 wind-lines" aria-hidden style={{ zIndex: 1 }} />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wailing Wall
              </h1>
              <p className="text-gray-600 mt-2">
                Stick your anonymous notes to the wall.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user ? `User: ${user}` : "User: Anonymous"}
              </span>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
              >
                {user ? "Change" : "Set Username"}
              </Button>
            </div>
          </div>
        </div>

        {/* Create Post - her zaman anonim */}
        <CreatePost onPostCreated={(post) => {
          setPosts(prev => [post, ...(prev ?? posts)])
        }} />
      </div>

      {/* Notes Wall - full width with side padding */}
      <div className="w-full px-4 sm:px-6 md:px-8 mt-6">
        {/* Date Filter */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="date-filter" className="text-sm text-gray-600">
                Filter by date:
              </label>
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            {selectedDate && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearDateFilter}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Select a date to view notes from that specific day. Leave empty to see all notes.
          </p>
        </div>
        {postsLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading notes...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No notes yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Be the first to stick a note!
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <NotesWall onNoteClick={(p) => incrementClick(p.id)} posts={[...posts].sort((a, b) => {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            })} />
            {hasMore && (
              <div className="text-center py-8">
                <Button
                  onClick={handleLoadMore}
                  disabled={postsLoading || isLoadingMore}
                  variant="outline"
                  className="px-6 py-2"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Notes'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUsernameSet={(name) => {
          setUsername(name)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}