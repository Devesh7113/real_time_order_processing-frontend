import { apiClient } from './client'

/**
 * Backend signs in with email: AuthRequest.username is matched to UserDetails by email.
 */
export async function login(email, password) {
  const { data } = await apiClient.post('/api/auth/generateToken', {
    username: email.trim(),
    password,
  })
  return typeof data === 'string' ? data : String(data)
}

/** Registers a new user; server encodes password and sets ROLE_USER. */
export async function register({ userName, email, password }) {
  const { data } = await apiClient.post('/api/auth/addNewUser', {
    userName: userName.trim(),
    email: email.trim(),
    password,
  })
  return typeof data === 'string' ? data : String(data)
}
