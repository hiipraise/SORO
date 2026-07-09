import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, AlertCircle, RefreshCw } from 'lucide-react'
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
  const queryClient = useQueryClient()
  const isNew = !id || id === 'new'

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [moodTag, setMoodTag] = useState<MoodState | null>(null)
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

  // Load existing entry and sync into local form state
  const { data: entryData, isError: loadError, refetch: loadEntry } = useQuery({
    queryKey: ['journal-entry', id],
    queryFn: () => getJournalEntry(id!) as Promise<any>,
    enabled: !isNew && !!id,
  })

  // Sync server data into local form state (one-way: server → form)
  useEffect(() => {
    if (entryData) {
      setTitle(entryData.title || '')
      setContent(entryData.content || '')
      setMoodTag(entryData.mood_tag || null)
    }
  }, [entryData])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title && !content) return null
      if (isNew) {
        return createJournalEntry({ title, content, mood_tag: moodTag || undefined })
      } else {
        return updateJournalEntry(id!, { title, content, mood_tag: moodTag || undefined })
      }
    },
    onSuccess: () => {
      setLastSaved(new Date())
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      if (!isNew) {
        queryClient.invalidateQueries({ queryKey: ['journal-entry', id] })
      }
    },
  })

  // Auto-save timer
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current)
    }
    autoSaveRef.current = setTimeout(() => {
      if (title || content) {
        saveMutation.mutate()
      }
    }, 30000)
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [title, content, moodTag])

  const addToast = useToastStore((s) => s.addToast)

  const handleSaveNow = async () => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    setIsSaving(true)
    saveMutation.mutate(undefined, {
      onSuccess: () => {
        addToast('Journal entry saved', 'success')
        navigate('/app/journal')
      },
      onError: () => {
        addToast('Failed to save journal entry', 'error')
      },
      onSettled: () => {
        setIsSaving(false)
      },
    })
  }

  // Save before navigating away
  const handleBack = useCallback(async () => {
    if (!isNew && loadError) {
      navigate('/app/journal')
      return
    }
    if (title || content) {
      saveMutation.mutate(undefined, {
        onSettled: () => navigate('/app/journal'),
      })
    } else {
      navigate('/app/journal')
    }
  }, [saveMutation, navigate, isNew, loadError, title, content])

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
                {isSaving || saveMutation.isPending ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
            <Button
              onClick={handleSaveNow}
              size="sm"
              disabled={isSaving || saveMutation.isPending}
              leftIcon={isSaving ? undefined : <Save size={16} />}
            >
              {isSaving || saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Load Error State */}
        {!isNew && loadError && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-4 text-soro-fade/50">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-lg font-display font-semibold text-soro-mist mb-1">
              Could not load entry
            </h3>
            <p className="text-sm text-soro-fade max-w-xs mb-6">
              Failed to load this journal entry. It may have been deleted or you may not have access.
            </p>
            <Button
              onClick={() => loadEntry()}
              variant="primary"
              leftIcon={<RefreshCw size={18} />}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Editor Form — hidden when loadError */}
        {!(isNew) && loadError ? null : (
          <>
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
          </>
        )}
      </div>
    </PageTransition>
  )
}
