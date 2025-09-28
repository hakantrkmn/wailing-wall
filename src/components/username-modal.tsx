"use client"

import { useState, useMemo } from "react"
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
import { motion } from "framer-motion"

interface UsernameModalProps {
  isOpen: boolean
  onClose: () => void
  onUsernameSet: (username: string) => void
}
import { useUser } from "@/hooks/useUser"

function hashStringToNumber(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function UsernameModal({ isOpen, onClose, onUsernameSet }: UsernameModalProps) {
  const { user, setUsername } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const seed = useMemo(() => hashStringToNumber("modal"), [])
  const rotation = useMemo(() => (seed % 5) - 2, [seed]) // -2 to +2 degrees
  
  const tapeStyle = useMemo(() => {
    const rand = (offset: number) => (hashStringToNumber(`modal-tape-${offset}`) % 1000) / 1000
    const leftTear = `${2 + rand(1) * 3}% ${8 + rand(2) * 4}%`
    const rightTear = `${98 - rand(3) * 3}% ${12 + rand(4) * 4}%`
    const clip = `polygon(${leftTear}, ${rightTear}, 100% ${88 - rand(5) * 8}%, ${90 - rand(6) * 6}% 100%, ${10 + rand(7) * 4}% 100%, 0% ${90 - rand(8) * 8}%)`
    
    return {
      backgroundColor: "#000000",
      boxShadow: "0 8px 16px -8px rgba(0,0,0,0.8)",
      clipPath: clip,
      WebkitClipPath: clip,
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user.trim()) {
      setError("Username cannot be empty")
      return
    }

    if (user.length < 3) {
      setError("Username must be at least 3 characters")
      return
    }

    if (user.length > 20) {
      setError("Username can be at most 20 characters")
      return
    }

    // Valid character check (only letters, numbers and underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(user)) {
      setError("Username can only contain letters, numbers and underscores")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      onUsernameSet(user)
      toast.success("Username set successfully!", {
        description: `Welcome, ${user}!`
      })
    } catch {
      setError("Username is already taken")
      toast.error("Username is already taken")
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
      <DialogContent className="sm:max-w-[425px] p-0 overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: -20, rotate: rotation - 3, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="relative"
          style={{ transformOrigin: "top center" }}
        >
          {/* Black tape at top */}
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-4 h-7 w-24 opacity-90 z-20"
            style={{
              ...tapeStyle,
              transform: `translateX(-50%) rotate(${(seed % 4) - 2}deg)`
            }}
          />
          
          {/* Modal content with weathered paper background */}
          <div 
            className="p-6 rounded-md"
            style={{
              backgroundColor: "#f5f3f0",
              boxShadow: "0 12px 22px -14px #e8e5e0",
            }}
          >
            <DialogHeader className="mb-4">
            <DialogTitle className="text-gray-800">Set Your Username</DialogTitle>
            <DialogDescription className="text-gray-600">
              Enter the username you want to use on Wailing Wall. This name will be visible to other users.
            </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={user}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setError("")
                  }}
                  disabled={isLoading}
                  className={`bg-transparent border-gray-300 focus:border-gray-500 ${error ? "border-red-500" : ""}`}
                />
                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
                <p className="text-xs text-gray-500">
                  Only letters, numbers and underscores allowed (3-20 characters)
                </p>
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {isLoading ? "Checking..." : "Set Username"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
