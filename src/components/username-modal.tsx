"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface UsernameModalProps {
  isOpen: boolean
  onClose: () => void
  onUsernameSet: (username: string) => void
}
import { useUser } from "@/hooks/useUser"

export function UsernameModal({ isOpen, onClose, onUsernameSet }: UsernameModalProps) {
  const { user, setUsername } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user.trim()) {
      setError("Kullanıcı adı boş olamaz")
      return
    }

    if (user.length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalı")
      return
    }

    if (user.length > 20) {
      setError("Kullanıcı adı en fazla 20 karakter olabilir")
      return
    }

    // Geçerli karakter kontrolü (sadece harf, sayı ve alt çizgi)
    if (!/^[a-zA-Z0-9_]+$/.test(user)) {
      setError("Kullanıcı adı sadece harf, sayı ve alt çizgi içerebilir")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      onUsernameSet(user)
      toast.success("Kullanıcı adı başarıyla belirlendi!", {
        description: `Hoş geldin, ${user}!`
      })
    } catch {
      setError("Kullanıcı adı zaten kullanılıyor")
      toast.error("Kullanıcı adı zaten kullanılıyor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="backdrop-blur-sm bg-black/20" />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kullanıcı Adınızı Belirleyin</DialogTitle>
          <DialogDescription>
            Wailing Wall&apos;da kullanmak istediğiniz kullanıcı adını girin. Bu ad diğer kullanıcılar tarafından görülecektir.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              type="text"
              placeholder="kullanici_adi"
              value={user}
              onChange={(e) => {
                setUsername(e.target.value)
                setError("")
              }}
              disabled={isLoading}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Sadece harf, sayı ve alt çizgi kullanabilirsiniz (3-20 karakter)
            </p>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kontrol ediliyor..." : "Kullanıcı Adını Belirle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
