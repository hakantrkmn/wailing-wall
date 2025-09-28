import { useState, useEffect } from "react"

export const useUser = () => {
  const [user, setUser] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  
  // Component mount olduğunda localStorage'dan username'i yükle
  useEffect(() => {
    const savedUsername = localStorage.getItem("username")
    if (savedUsername) {
      setUser(savedUsername)
    }
    setIsLoading(false)
  }, [])

  const setUsername = (username: string) => {
    if (username) {
      localStorage.setItem("username", username)
      setUser(username)
    } else {
      localStorage.removeItem("username")
      setUser("")
    }
  }

  return { user, setUsername, isLoading }
}