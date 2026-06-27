import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Users, LogOut, UserPlus } from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Textarea from '@/components/shared/Textarea'
import Spinner from '@/components/shared/Spinner'
import { getCircle, joinCircle, leaveCircle, getCircleMessages, sendCircleMessage } from '@/lib/api'
import { useToastStore } from '@/components/shared/Toast'

interface CircleData {
  id: string
  name: string
  topic?: string
  member_count: number
  max_members: number
  is_full: boolean
  has_joined: boolean
  display_name?: string
  members: Array<{ display_name: string; joined_at: string }>
  created_at: string
}

interface MessageData {
  id: string
  display_name: string
  content: string
  created_at: string
}

const TOPIC_EMOJIS: Record<string, string> = {
  'Student debt': '📚',
  'Lost a parent': '🕯️',
  'First job': '💼',
  'Faith & doubt': '🙏',
  'From zero': '🚀',
  'General': '💬',
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function CircleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [circle, setCircle] = useState<CircleData | null>(null)
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [joining, setJoining] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToastStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadCircle = useCallback(async () => {
    if (!id) return
    try {
      const data = await getCircle(id) as CircleData
      setCircle(data)
      setHasJoined(data.has_joined)
    } catch {
      addToast('Circle not found', 'error')
      navigate('/app/circles')
    } finally {
      setIsLoading(false)
    }
  }, [id, navigate, addToast])

  const loadMessages = useCallback(async () => {
    if (!id) return
    setIsLoadingMessages(true)
    try {
      const data = await getCircleMessages(id) as MessageData[]
      setMessages(data)
    } catch {
      // Silent
    } finally {
      setIsLoadingMessages(false)
    }
  }, [id])

  useEffect(() => {
    loadCircle()
  }, [loadCircle])

  useEffect(() => {
    if (hasJoined) {
      loadMessages()
      // Poll for new messages every 10 seconds
      const interval = setInterval(loadMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [hasJoined, loadMessages])

  const handleJoin = async () => {
    if (!id) return
    setJoining(true)
    try {
      const data = await joinCircle(id) as any
      setHasJoined(true)
      addToast(`Joined as ${data.display_name}`, 'success')
      loadCircle()
      loadMessages()
    } catch (err: any) {
      addToast(err?.message || 'Failed to join', 'error')
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!id) return
    try {
      await leaveCircle(id)
      setHasJoined(false)
      setMessages([])
      addToast('Left circle', 'info')
      loadCircle()
    } catch {
      addToast('Failed to leave circle', 'error')
    }
  }

  const handleSend = async () => {
    if (!id || !newMessage.trim()) return
    setSending(true)
    try {
      const data = await sendCircleMessage(id, newMessage.trim()) as MessageData
      setMessages([...messages, data])
      setNewMessage('')
    } catch {
      addToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <Spinner size="lg" />
        </div>
      </PageTransition>
    )
  }

  if (!circle) return null

  const topicEmoji = circle.topic ? TOPIC_EMOJIS[circle.topic] || '💬' : '💬'

  return (
    <PageTransition>
      <div className="flex flex-col min-h-[calc(100dvh-8rem)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/app/circles')}
            className="flex items-center gap-2 text-sm text-soro-fade hover:text-soro-mist transition-colors"
          >
            <ArrowLeft size={18} />
            Back to circles
          </button>

          {hasJoined && (
            <button
              onClick={handleLeave}
              className="flex items-center gap-1.5 text-xs text-soro-fade hover:text-soro-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-soro-danger/5"
            >
              <LogOut size={14} />
              Leave
            </button>
          )}
        </div>

        {/* Circle info */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-soro-ember/10 flex items-center justify-center shrink-0">
              <Users size={20} className="text-soro-ember" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-display font-bold text-soro-mist">{circle.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-xs text-soro-fade">
                {circle.topic && <span>{topicEmoji} {circle.topic}</span>}
                <span>{circle.member_count}/{circle.max_members} members</span>
              </div>
            </div>
          </div>

          {/* Members preview */}
          {circle.members.length > 0 && (
            <div className="mt-3 pt-3 border-t border-soro-earth/10">
              <p className="text-[10px] uppercase tracking-wider text-soro-fade/60 mb-1.5 font-medium">
                Members
              </p>
              <div className="flex flex-wrap gap-1.5">
                {circle.members.map((m, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-soro-surface text-soro-fade border border-soro-earth/10"
                  >
                    {m.display_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Join CTA if not a member */}
        {!hasJoined ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <Users size={48} className="text-soro-fade/30 mb-4" />
            <h2 className="text-lg font-display font-semibold text-soro-mist mb-2">
              Join this circle
            </h2>
            <p className="text-sm text-soro-fade max-w-xs mb-6">
              You'll get an anonymous name like "Voice 1" or "Voice 2". No one will know who you are.
            </p>
            <Button
              onClick={handleJoin}
              isLoading={joining}
              disabled={circle.is_full}
              leftIcon={<UserPlus size={18} />}
              size="lg"
            >
              {circle.is_full ? 'Circle is full' : 'Join anonymously'}
            </Button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-soro-fade">
                    No messages yet. Be the first to say something.
                  </p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isFirstOfGroup =
                    i === 0 || messages[i - 1].display_name !== msg.display_name

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {isFirstOfGroup && (
                        <p className="text-[10px] font-medium text-soro-ember/70 mb-1 mt-3 first:mt-0">
                          {msg.display_name}
                        </p>
                      )}
                      <div className="glass-card rounded-2xl px-4 py-2.5 inline-block max-w-[85%] border-soro-earth/10">
                        <p className="text-sm text-soro-mist leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
                      </div>
                      <p className="text-[10px] text-soro-fade/40 mt-0.5 ml-1">
                        {getRelativeTime(msg.created_at)}
                      </p>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="sticky bottom-0 pt-2 pb-4 bg-gradient-to-t from-soro-deep via-soro-deep to-transparent">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={1}
                    className="min-h-[44px] max-h-[120px] resize-none text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 rounded-xl bg-soro-ember text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-soro-ember/90 transition-colors shrink-0"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  )
}
