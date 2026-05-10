const TOKEN_KEY = 'rtop_token'
const EMAIL_KEY = 'rtop_user_email'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUserEmail() {
  return localStorage.getItem(EMAIL_KEY)
}

export function setUserEmail(email) {
  localStorage.setItem(EMAIL_KEY, email)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}
