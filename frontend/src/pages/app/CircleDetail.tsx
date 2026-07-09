import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Users, LogOut, UserPlus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  // If the date has no timezone offset, treat it as UTC (backend naive datetimes)
  const hasTz = /[+-]\d{2}:\d{2}$|Z$/i.test(dateStr)
  const date = new Date(hasTz ? dateStr : dateStr + 'Z')
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function CircleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const { data: circle, isLoading } = useQuery<CircleData>({
    queryKey: ['circle', id],
    queryFn: () => getCircle(id!) as Promise<CircleData>,
    enabled: !!id,
  })

  // Track hasJoined from circle data
  useEffect(() => {
    if (circle) {
      setHasJoined(circle.has_joined)
    }
  }, [circle])

  const { data: messages = [], isError: messagesError } = useQuery<MessageData[]>({
    queryKey: ['circle-messages', id],
    queryFn: () => getCircleMessages(id!) as Promise<MessageData[]>,
    enabled: !!hasJoined && !!id,
    refetchInterval: 10000,
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const joinMutation = useMutation({
    mutationFn: () => joinCircle(id!),
    onSuccess: (data: any) => {
      setHasJoined(true)
      queryClient.invalidateQueries({ queryKey: ['circle', id] })
      addToast(`Joined as ${data.display_name}`, 'success')
    },
    onError: (err: any) => {
      addToast(err?.message || 'Failed to join', 'error')
    },
  })

  const leaveMutation = useMutation({
    mutationFn: () => leaveCircle(id!),
    onSuccess: () => {
      setHasJoined(false)
      queryClient.invalidateQueries({ queryKey: ['circle', id] })
      queryClient.invalidateQueries({ queryKey: ['circle-messages', id] })
      addToast('Left circle', 'info')
    },
    onError: () => {
      addToast('Failed to leave circle', 'error')
    },
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendCircleMessage(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-messages', id] })
      setNewMessage('')
    },
    onError: () => {
      addToast('Failed to send message', 'error')
    },
  })

  const handleSend = () => {
    if (!id || !newMessage.trim()) return
    setSending(true)
    sendMutation.mutate(newMessage.trim(), {
      onSettled: () => setSending(false),
    })
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
              onClick={() => leaveMutation.mutate()}
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
              onClick={() => joinMutation.mutate()}
              isLoading={joinMutation.isPending}
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
              {messages.length === 0 && messagesError ? (
                <div className="text-center py-12">
                  <p className="text-sm text-soro-fade">
                    Could not load messages. Check your connection.
                  </p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-soro-fade">
                    No messages yet. Be the first to say something.
                  </p>
                </div>
              ) : (
                <>
                  {messagesError && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <div className="w-2 h-2 rounded-full bg-soro-danger/60" />
                      <p className="text-xs text-soro-fade/60">
                        Could not refresh messages. Your last messages are still shown.
                      </p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
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
                  })}
                </>
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
