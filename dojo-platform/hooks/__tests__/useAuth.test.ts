import { renderHook, act, waitFor } from '@testing-library/react'
import axios from 'axios'
import { useAuth } from '../useAuth'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAuth())
      
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should check for existing token on mount', async () => {
      const mockToken = 'existing-token'
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        organizationId: 'org-456',
      }

      localStorageMock.getItem.mockReturnValue(mockToken)
      mockedAxios.get.mockResolvedValue({ data: mockUser })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(localStorageMock.getItem).toHaveBeenCalledWith('token')
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`)
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me')
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'instructor',
        organizationId: 'org-456',
      }
      const mockToken = 'auth-token'
      
      mockedAxios.post.mockResolvedValue({
        data: { user: mockUser, token: mockToken }
      })

      const { result } = renderHook(() => useAuth())

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123')
      })

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      })
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockToken)
      expect(mockedAxios.defaults.headers.common['Authorization']).toBe(`Bearer ${mockToken}`)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.error).toBeNull()
      expect(loginResult).toEqual({ success: true, user: mockUser })
    })

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials'
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: errorMessage } }
      })

      const { result } = renderHook(() => useAuth())

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword')
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBe(errorMessage)
      expect(loginResult).toEqual({ success: false, error: errorMessage })
    })

    it('should handle network error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth())

      let loginResult: any
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password')
      })

      expect(result.current.error).toBe('Login failed')
      expect(loginResult).toEqual({ success: false, error: 'Login failed' })
    })
  })

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Setup authenticated state
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'student',
        organizationId: 'org-456',
      }
      
      localStorageMock.getItem.mockReturnValue('token')
      mockedAxios.get.mockResolvedValue({ data: mockUser })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Perform logout
      act(() => {
        result.current.logout()
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(mockedAxios.defaults.headers.common['Authorization']).toBeUndefined()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Check Auth', () => {
    it('should verify authentication status', async () => {
      const mockToken = 'valid-token'
      const mockUser = {
        id: 'user-789',
        email: 'verified@example.com',
        firstName: 'Verified',
        lastName: 'User',
        role: 'admin',
        organizationId: 'org-999',
      }

      localStorageMock.getItem.mockReturnValue(mockToken)
      mockedAxios.get.mockResolvedValue({ data: mockUser })

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.checkAuth()
      })

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/auth/me')
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should logout on invalid token', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token')
      mockedAxios.get.mockRejectedValue({ response: { status: 401 } })

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle no token', async () => {
      localStorageMock.getItem.mockReturnValue(null)

      const { result } = renderHook(() => useAuth())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockedAxios.get).not.toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})