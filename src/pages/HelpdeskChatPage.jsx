import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../api/chatApi'
import { getErrorMessage, isNetworkOrUnreachableError } from '../api/errorMessage'
import ServerUnavailableNotice from '../components/ServerUnavailableNotice'

const WELCOME_MESSAGE =
  'Hi! I can help with returns, refunds, orders, and common store questions. What do you need help with today?'

function ChatBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={[
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[75%]',
          isUser
            ? 'rounded-br-md bg-emerald-600 text-white'
            : 'rounded-bl-md border border-slate-200 bg-white text-slate-800',
        ].join(' ')}
      >
        {!isUser ? (
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Support</p>
        ) : null}
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex gap-1" aria-label="Assistant is typing">
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  )
}

export default function HelpdeskChatPage() {
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [offline, setOffline] = useState(false)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  async function submitMessage(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setError('')
    setOffline(false)
    setInput('')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: trimmed }])
    setSending(true)

    try {
      const reply = await sendChatMessage(trimmed)
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: reply.trim() || 'Thanks — we received your message.' },
      ])
    } catch (err) {
      if (isNetworkOrUnreachableError(err)) {
        setOffline(true)
      } else {
        setError(getErrorMessage(err, 'Could not send your message. Please try again.'))
      }
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await submitMessage(input)
  }

  function handleRetry() {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUser) {
      submitMessage(lastUser.content)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-12rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">Support chat</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ask about returns, refunds, delivery, or order issues. We&apos;ll keep it short and help you quickly.
        </p>
      </div>

      {offline ? (
        <div className="mb-4">
          <ServerUnavailableNotice onRetry={handleRetry} retrying={sending} />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {messages.map((message) => (
            <ChatBubble key={message.id} role={message.role} content={message.content} />
          ))}
          {sending ? <TypingIndicator /> : null}
          <div ref={scrollRef} />
        </div>

        {error ? (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-slate-200 bg-slate-50 p-3 sm:p-4"
        >
          <label htmlFor="support-message" className="sr-only">
            Your message
          </label>
          <input
            ref={inputRef}
            id="support-message"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            disabled={sending}
            autoComplete="off"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
