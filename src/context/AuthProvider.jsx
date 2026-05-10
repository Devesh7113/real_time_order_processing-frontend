import { useCallback, useMemo, useState } from 'react'
import * as authApi from '../api/authApi'
import {
  clearToken,
  getToken,
  getUserEmail,
  setToken,
  setUserEmail,
} from '../api/authStorage'
import { AuthContext } from './authContext'
import { getDisplayNameFromToken, getRolesFromToken } from '../utils/jwtPayload'

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())
  const [userEmail, setUserEmailState] = useState(() => getUserEmail())

  const login = useCallback(async (email, password) => {
    const jwt = await authApi.login(email, password)
    setToken(jwt)
    setUserEmail(email.trim())
    setTokenState(jwt)
    setUserEmailState(email.trim())
  }, [])

  const register = useCallback(async (payload) => {
    await authApi.register(payload)
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setTokenState(null)
    setUserEmailState(null)
  }, [])

  const value = useMemo(() => {
    const roles = getRolesFromToken(token)
    const isAdmin = roles.some((r) => r === 'ROLE_ADMIN' || r === 'ADMIN')
    const displayName = getDisplayNameFromToken(token)
    return {
      token,
      user: userEmail
        ? { email: userEmail, displayName: displayName || undefined }
        : null,
      isAuthenticated: Boolean(token),
      roles,
      isAdmin,
      login,
      register,
      logout,
    }
  }, [token, userEmail, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
