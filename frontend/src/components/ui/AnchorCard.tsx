import { Bookmark, Share2, Check, Copy, ExternalLink } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Modal from '@/components/shared/Modal'
import { useToastStore } from '@/components/shared/Toast'

const BOOKMARKS_KEY = 'soro_anchor_bookmarks'

function getBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function toggleBookmark(content: string): boolean {
  const bookmarks = getBookmarks()
  const index = bookmarks.indexOf(content)
  if (index >= 0) {
    bookmarks.splice(index, 1)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
    return false
  } else {
    bookmarks.push(content)
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks))
    return true
  }
}

function isBookmarked(content: string): boolean {
  return getBookmarks().includes(content)
}

interface AnchorCardProps {
  content: string
  source?: string
  dayLabel: string
  type?: 'verse' | 'quote' | 'prompt' | 'story'
}

export default function AnchorCard({
  content,
  source,
  dayLabel,
  type = 'quote',
}: AnchorCardProps) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(content))
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup copy timer on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  // Sync bookmark state if content changes (e.g., different anchor loaded)
  useEffect(() => {
    setBookmarked(isBookmarked(content))
  }, [content])

  // Sync bookmark state across tabs via storage event
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === BOOKMARKS_KEY) {
        setBookmarked(isBookmarked(content))
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [content])

  const handleBookmark = useCallback(() => {
    const nowBookmarked = toggleBookmark(content)
    setBookmarked(nowBookmarked)
    addToast(
      nowBookmarked ? 'Anchor bookmarked!' : 'Bookmark removed',
      nowBookmarked ? 'success' : 'info',
    )
  }, [content, addToast])

  const handleShare = useCallback(async () => {
    const shareText = `"${content}"${source ? ` — ${source}` : ''}\n\nvia SORO — Daily Anchor`

    // Try native Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SORO — Daily Anchor',
          text: shareText,
        })
        return
      } catch {
        // User cancelled or API failed — fall through to modal
      }
    }

    // Fall back to modal
    setShareOpen(true)
  }, [content, source])

  const handleCopy = useCallback(async () => {
    const shareText = `"${content}"${source ? ` — ${source}` : ''}\n\nvia SORO — Daily Anchor`
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      addToast('Copied to clipboard', 'success')
      copyTimerRef.current = setTimeout(() => {
        setCopied(false)
        setShareOpen(false)
      }, 800)
    } catch {
      addToast('Failed to copy', 'error')
    }
  }, [content, source, addToast])

  const typeLabels: Record<string, string> = {
    verse: 'Scripture',
    quote: 'Wisdom',
    prompt: 'Reflection',
    story: 'Story',
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-soro-earth/5 rounded-full blur-3xl pointer-events-none" />

        {/* Day label */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-soro-ember uppercase tracking-wider">
            {dayLabel} &middot; {typeLabels[type]}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg transition-colors ${
                bookmarked
                  ? 'text-soro-gold bg-soro-gold/10'
                  : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this anchor'}
            >
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-soro-fade hover:text-soro-mist hover:bg-soro-surface transition-colors"
              title="Share this anchor"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <blockquote className="text-lg md:text-xl font-display text-soro-mist leading-relaxed italic">
          "{content}"
        </blockquote>

        {/* Source */}
        {source && (
          <p className="mt-4 text-sm text-soro-fade">— {source}</p>
        )}
      </motion.div>

      {/* Share Modal */}
      <Modal isOpen={shareOpen} onClose={() => setShareOpen(false)} title="Share this Anchor">
        <div className="space-y-3 pt-1">
          <p className="text-sm text-soro-fade leading-relaxed italic">
            "{content}"{source && <span className="not-italic"> — {source}</span>}
          </p>

          <div className="border-t border-soro-earth/10 pt-3 space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-soro-mist hover:bg-soro-earth/10 transition-colors text-left"
            >
              {copied ? (
                <Check size={18} className="text-green-400 shrink-0" />
              ) : (
                <Copy size={18} className="text-soro-fade shrink-0" />
              )}
              <span>{copied ? 'Copied!' : 'Copy to clipboard'}</span>
            </button>

            {typeof navigator.share !== 'undefined' && (
              <button
                onClick={() => {
                  setShareOpen(false)
                  handleShare()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-soro-mist hover:bg-soro-earth/10 transition-colors text-left"
              >
                <ExternalLink size={18} className="text-soro-fade shrink-0" />
                <span>Share via system</span>
              </button>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
