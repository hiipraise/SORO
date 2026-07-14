import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Trash2, AlertCircle, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageTransition from '@/components/layout/PageTransition'
import Card from '@/components/shared/Card'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import EmptyState from '@/components/shared/EmptyState'
import AdSlot from '@/components/ui/AdSlot'
import { getJournalEntries, deleteJournalEntry } from '@/lib/api'
import { type MoodState, MOOD_COLORS } from '@/stores/checkinStore'
import { useToastStore } from '@/components/shared/Toast'
import { motion } from 'framer-motion'


interface JournalEntryData {
  id: string
  title: string
  content: string
  mood_tag?: string
  created_at: string
  updated_at: string
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function Journal() {
  const [searchQuery, setSearchQuery] = useState('')
  const [allEntries, setAllEntries] = useState<JournalEntryData[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const {
    data: paginated,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => getJournalEntries(0, 20),
  })

  // Sync paginated data into local state (TanStack v5 removed onSuccess callback)
  useEffect(() => {
    if (paginated) {
      setAllEntries(paginated.items)
      setTotal(paginated.total)
      setHasMore(paginated.has_more)
    }
  }, [paginated])

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    },
    onError: () => {
      addToast('Failed to delete journal entry', 'error')
    },
  })

  const handleLoadMore = async () => {
    setIsLoadingMore(true)
    try {
      const data = await getJournalEntries(allEntries.length, 20)
      setAllEntries((prev) => [...prev, ...data.items])
      setTotal(data.total)
      setHasMore(data.has_more)
    } catch {
      addToast('Failed to load more entries', 'error')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const filtered = allEntries.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
              Journal
            </h1>
            <p className="text-sm text-soro-fade mt-1">
              Your thoughts, your space
            </p>
          </div>
          <Link to="/app/journal/new">
            <Button slideFill leftIcon={<Plus size={18} />}>
              New entry
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Input
          placeholder="Search your journal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={16} />}
        />

        {/* Entries */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} padding="md" className="animate-pulse">
                <div className="h-4 bg-soro-surface rounded w-3/4 mb-3" />
                <div className="h-3 bg-soro-surface rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<AlertCircle size={48} />}
            title="Failed to load entries"
            description="Failed to load journal entries. Check your connection and try again."
            action={
              <Button
                slideFill
                onClick={() => refetch()}
                variant="primary"
                leftIcon={<RefreshCw size={18} />}
              >
                Try again
              </Button>
            }
          />
        ) : allEntries.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No entries found' : 'No journal entries yet'}
            description={
              searchQuery
                ? 'Try a different search term.'
                : 'Your journal is empty. Start writing your first entry.'
            }
            action={
              !searchQuery && (
                <Link to="/app/journal/new">
                  <Button slideFill variant="primary" leftIcon={<Plus size={18} />}>
                    Write your first entry
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <>
            <div className="space-y-3">
              {filtered.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={`/app/journal/${entry.id}`}
                  >
                    <Card variant="interactive" className="group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          {entry.mood_tag && (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{
                                backgroundColor: MOOD_COLORS[entry.mood_tag as MoodState] || '#6B7280',
                              }}
                            />
                          )}
                          <h3 className="font-medium text-soro-mist truncate group-hover:text-soro-ember transition-colors">
                            {entry.title || 'Untitled'}
                          </h3>
                        </div>
                        <p className="text-sm text-soro-fade line-clamp-2">
                          {entry.content}
                        </p>
                        <span className="text-xs text-soro-fade/60 mt-2 block">
                          {getRelativeTime(entry.created_at)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(entry.id)
                        }}
                        className="p-1.5 rounded-lg text-soro-fade hover:text-soro-danger hover:bg-soro-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  isLoading={isLoadingMore}
                  leftIcon={<RefreshCw size={16} />}
                >
                  Load more ({allEntries.length} of {total})
                </Button>
              </div>
            )}
          </>
        )}

        {/* Ad Slot */}
        <AdSlot className="mt-8" />
      </div>
    </PageTransition>
  )
}
