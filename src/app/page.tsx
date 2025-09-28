"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { UsernameModal } from "@/components/username-modal"
import { useUser } from "@/hooks/useUser"
import { usePosts } from "@/hooks/usePosts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreatePost } from "@/components/create-post"

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { user, setUsername, isLoading: userLoading } = useUser()
  const { posts, isLoading: postsLoading, setPosts } = usePosts()

  // Kullanıcı adı yoksa modal aç, varsa kapat (sadece yükleme tamamlandıktan sonra)
  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        setIsModalOpen(true)
      } else {
        setIsModalOpen(false)
      }
    }
  }, [user, userLoading])


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Sayfa yüklenirken loading göster
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wailing Wall
              </h1>
              {user ? (
                <p className="text-gray-600 mt-2">
                  Hoş geldin, {user}! 👋
                </p>
              ) : (
                <p className="text-gray-600 mt-2">
                  Kullanıcı adınızı belirleyin
                </p>
              )}
            </div>
            {user && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setUsername("")
                  setIsModalOpen(true)
                }}
              >
                Kullanıcı Adını Değiştir
              </Button>
            )}
          </div>
        </div>

        {/* Create Post - sadece user varsa göster */}
        {user && <CreatePost onPostCreated={(post) => {
          setPosts([post, ...posts])
        }} />}

        {/* Posts List */}
        <div className="space-y-4">
          {postsLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Posts yükleniyor...</p>
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Henüz hiç post yok.</p>
                <p className="text-sm text-gray-400 mt-2">
                  {user ? "İlk postu sen yaz!" : "Kullanıcı adınızı belirleyin ve ilk postu yazın!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {post.author}
                    </CardTitle>
                    <span className="text-sm text-gray-500">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <UsernameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUsernameSet={setUsername}
      />
    </div>
  )
}