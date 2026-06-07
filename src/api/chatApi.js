import { apiClient } from './client'

/**
 * Send a message to the helpdesk AI assistant.
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function sendChatMessage(message) {
  const { data } = await apiClient.post('/api/ai/chat', { message })
  if (typeof data === 'string') {
    return data
  }
  if (data != null && typeof data === 'object' && typeof data.message === 'string') {
    return data.message
  }
  return String(data ?? '')
}
