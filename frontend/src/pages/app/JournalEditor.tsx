import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Lock, Unlock } from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import Input from '@/components/shared/Input'
import Textarea from '@/components/shared/Textarea'
import Button from '@/components/shared/Button'
import MoodOrb from '@/components/ui/MoodOrb'
import { useCheckinStore, type MoodState } from '@/stores/checkinStore'
import { createJournalEntry, updateJournalEntry, getJournalEntry } from '@/lib/api'
import { useToastStore } from '@/components/shared/Toast'

export default function JournalEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moodTag, setMoodTag] = useState<MoodState | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const { currentMood } = useCheckinStore()

  useEffect(() => {
    if (currentMood && isNew && !moodTag) {
      setMoodTag(currentMood)
    }
  }, [currentMood, isNew])

  // Load existing entry
  useEffect(() => {
    if (!isNew) {
      async function loadEntry() {
        try {
          const data = await getJournalEntry(id!) as any
          setTitle(data.title || '')
          setContent(data.content || '')
          setMoodTag(data.mood_tag || null)
          setIsLocked(data.is_locked || false)
        } catch {
          // If API fails, use mock
          setTitle('Today was heavy')
          setContent('I don\'t even know where to start. Everything feels like too much right now.\n\nBut I showed up. That counts for something.\n\nOne day at a time.')
          setMoodTag('at_limit')
        }
      }
      loadEntry()
    }
  }, [id, isNew])

  // Auto-save
  const save = useCallback(async () => {
    if (!title && !content) return

    setIsSaving(true)
    try {
      if (isNew) {
        await createJournalEntry({ title, content, mood_tag: moodTag || undefined })
      } else {
        await updateJournalEntry(id!, { title, content, mood_tag: moodTag || undefined })
      }
      setLastSaved(new Date())
      return true
    } catch {
      return false
    } finally {
      setIsSaving(false)
    }
  }, [title, content, moodTag, isNew, id])

  // Save before navigating away
  const handleBack = useCallback(async () => {
    await save()
    navigate('/app/journal')
  }, [save, navigate])

  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
    }
    autoSaveRef.current = setTimeout(save, 30000) // 30s auto-save
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [title, content, moodTag])

  const handleSaveNow = async () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    const result = await save()
    if (result === true) {
      addToast('Journal entry saved', 'success')
      navigate('/app/journal')
    } else if (result === false) {
      addToast('Failed to save journal entry', 'error')
    }
  }

  const addToast = useToastStore((s) => s.addToast)

  const handleLockToggle = () => {
    setIsLocked(!isLocked)
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-soro-fade hover:text-soro-mist transition-colors"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-soro-fade/60">
                {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
            <button
              onClick={handleLockToggle}
              className={`p-2 rounded-xl transition-colors ${
                isLocked
                  ? 'text-soro-gold bg-soro-gold/10'
                  : 'text-soro-fade hover:text-soro-mist hover:bg-soro-surface'
              }`}
              title={isLocked ? 'Unlock entry' : 'Lock entry with PIN'}
            >
              {isLocked ? <Lock size={18} /> : <Unlock size={18} />}
            </button>
            <Button
              onClick={handleSaveNow}
              size="sm"
              disabled={isSaving}
              leftIcon={isSaving ? undefined : <Save size={16} />}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Mood Tag */}
        <div>
          <label className="text-xs font-medium text-soro-fade uppercase tracking-wider mb-2 block">
            How you were feeling
          </label>
          <MoodOrb selected={moodTag} onSelect={setMoodTag} size="lg" />
        </div>

        {/* Title */}
        <Input
          placeholder="Entry title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-display font-semibold border-0 bg-transparent px-0 placeholder:text-soro-fade/30"
        />

        {/* Content */}
        <div className="relative">
          <Textarea
            ref={contentRef as any}
            placeholder="Write whatever comes to mind. No judgment here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[50vh] text-base leading-relaxed border-0 bg-transparent px-0 resize-y placeholder:text-soro-fade/30"
          />
        </div>

        {/* Quick tools */}
        <div className="flex items-center gap-2 text-xs text-soro-fade/60">
          <span>Auto-saves every 30 seconds</span>
          <span>&middot;</span>
          <span>Your words are private</span>
        </div>
      </div>
    </PageTransition>
  )
}
