import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  organizationId: string
  schoolId?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
      
      return { success: true, user }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    })
  }, [])

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
      return
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await axios.get('/api/auth/me')
      
      setAuthState({
        user: response.data,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
    } catch (error) {
      logout()
    }
  }, [logout])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  }
}