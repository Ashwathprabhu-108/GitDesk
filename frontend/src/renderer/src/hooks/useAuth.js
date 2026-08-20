import { useState, useEffect, useCallback } from 'react'
import { getUser, getLoginUrl, logout as apiLogout } from '../api/github'

/**
 * Custom hook for managing authentication state.
 * Listens for OAuth callbacks from Electron's main process.
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if already authenticated on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Listen for OAuth callback from Electron main process
  useEffect(() => {
    if (window.api) {
      window.api.onAuthSuccess((userData) => {
        setUser(userData)
        setLoading(false)
        setError(null)
      })

      window.api.onAuthError((err) => {
        setError(err)
        setLoading(false)
      })

      return () => {
        window.api.removeAuthListeners()
      }
    }
  }, [])

  const checkAuth = async () => {
    try {
      setLoading(true)
      const userData = await getUser()
      setUser(userData)
      setError(null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const url = await getLoginUrl()

      // Open in system browser (via Electron IPC) or fallback to window.open
      if (window.api?.openExternal) {
        await window.api.openExternal(url)
      } else {
        window.open(url, '_blank')
      }
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
      setUser(null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }
}
