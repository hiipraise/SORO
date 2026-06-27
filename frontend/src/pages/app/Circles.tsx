import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Plus, ArrowRight, Shield, UserPlus,
} from 'lucide-react'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import AdSlot from '@/components/ui/AdSlot'
import { getCircles, joinCircle, createCircle } from '@/lib/api'
import { useToastStore } from '@/components/shared/Toast'

interface CircleData {
  id: string
  name: string
  topic?: string
  member_count: number
  max_members: number
  is_full: boolean
  has_joined: boolean
  members: Array<{ display_name: string; joined_at: string }>
  created_at: string
}

const CIRCLE_TOPICS = [
  { value: '', label: 'All circles', emoji: '🌍' },
  { value: 'Student debt', label: 'Student debt', emoji: '📚' },
  { value: 'Lost a parent', label: 'Lost a parent', emoji: '🕯️' },
  { value: 'First job', label: 'First job', emoji: '💼' },
  { value: 'Faith & doubt', label: 'Faith & doubt', emoji: '🙏' },
  { value: 'From zero', label: 'From zero', emoji: '🚀' },
  { value: 'General', label: 'General', emoji: '💬' },
]

const EMOJI_MAP: Record<string, string> = {
  'Student debt': '📚',
  'Lost a parent': '🕯️',
  'First job': '💼',
  'Faith & doubt': '🙏',
  'From zero': '🚀',
  'General': '💬',
}


export default function Circles() {
  const navigate = useNavigate()
  const [circles, setCircles] = useState<CircleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', topic: 'General', max_members: 20 })
  const [isCreating, setIsCreating] = useState(false)
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const { addToast } = useToastStore()

  const loadCircles = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getCircles(selectedTopic || undefined) as CircleData[]
      setCircles(data)
    } catch {
      // Empty
    } finally {
      setIsLoading(false)
    }
  }, [selectedTopic])

  useEffect(() => { loadCircles() }, [loadCircles])

  const handleJoin = async (circleId: string) => {
    setJoiningId(circleId)
    try {
      const data = await joinCircle(circleId) as any
      addToast(`Joined as ${data.display_name}`, 'success')
      loadCircles()
    } catch (err: any) {
      addToast(err?.message || 'Failed to join circle', 'error')
    } finally {
      setJoiningId(null)
    }
  }

  const handleCreate = async () => {
    if (!createForm.name.trim()) {
      addToast('Please give the circle a name', 'error')
      return
    }
    setIsCreating(true)
    try {
      const data = await createCircle(createForm) as any
      setShowCreateModal(false)
      setCreateForm({ name: '', topic: 'General', max_members: 20 })
      addToast(`Circle created! You're ${data.display_name}`, 'success')
      navigate(`/app/circles/${data.id}`)
    } catch (err: any) {
      addToast(err?.message || 'Failed to create circle', 'error')
    } finally {
      setIsCreating(false)
    }
  }

  const myCircles = circles.filter((c) => c.has_joined)
  const otherCircles = circles.filter((c) => !c.has_joined)

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
              Peer Circles
            </h1>
            <p className="text-sm text-soro-fade mt-1">
              Small, anonymous groups around shared experiences
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
            Create
          </Button>
        </div>

        {/* Info card */}
        <div className="glass-card rounded-2xl p-4 border-soro-safe/20 bg-soro-safe/5">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-green-400 shrink-0 mt-0.5" />
            <div className="text-xs text-soro-fade leading-relaxed">
              <p className="font-medium text-soro-mist mb-1">How peer circles work</p>
              <p>• Max 20 members per circle — intimate and safe</p>
              <p>• Everyone is anonymous — you're "Voice 1", "Voice 2", etc.</p>
              <p>• Weekly moderator prompts guide the conversation</p>
            </div>
          </div>
        </div>

        {/* Topic filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CIRCLE_TOPICS.map((topic) => (
            <button
              key={topic.value}
              onClick={() => setSelectedTopic(topic.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedTopic === topic.value
                  ? 'bg-soro-ember/10 text-soro-ember border border-soro-ember/30'
                  : 'bg-soro-surface text-soro-fade border border-soro-earth/10 hover:border-soro-earth/30'
              }`}
            >
              <span>{topic.emoji}</span>
              {topic.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-soro-surface rounded w-3/4 mb-3" />
                <div className="h-3 bg-soro-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : circles.length === 0 ? (
          <EmptyState
            title={selectedTopic ? `No ${selectedTopic.toLowerCase()} circles yet` : 'No circles yet'}
            description="Be the first to create a circle around a topic that matters to you."
            action={
              <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
                Create the first circle
              </Button>
            }
          />
        ) : (
          <>
            {/* My Circles */}
            {myCircles.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider">
                  Your circles ({myCircles.length})
                </h2>
                {myCircles.map((circle) => (
                  <CircleCard
                    key={circle.id}
                    circle={circle}
                    onOpen={() => navigate(`/app/circles/${circle.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Other circles */}
            {otherCircles.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider">
                  {myCircles.length > 0 ? 'Discover more' : 'All circles'}
                </h2>
                {otherCircles.map((circle, i) => (
                  <motion.div
                    key={circle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="glass-card rounded-2xl p-5 border-soro-earth/10 hover:border-soro-ember/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Users size={16} className="text-soro-ember shrink-0" />
                          <h3 className="font-medium text-soro-mist truncate">{circle.name}</h3>
                        </div>
                        <div className="flex items-center gap-3 ml-6 text-xs text-soro-fade">
                          {circle.topic && (
                            <span>{EMOJI_MAP[circle.topic] || '💬'} {circle.topic}</span>
                          )}
                          <span>
                            {circle.member_count}/{circle.max_members} members
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleJoin(circle.id)}
                        isLoading={joiningId === circle.id}
                        disabled={circle.is_full || joiningId === circle.id}
                        leftIcon={circle.is_full ? undefined : <UserPlus size={14} />}
                      >
                        {circle.is_full ? 'Full' : 'Join'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Ad Slot */}
        <AdSlot className="mt-8" />

        {/* Create Circle Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); setCreateForm({ name: '', topic: 'General', max_members: 20 }) }}
          title="Create a peer circle"
        >
          <div className="flex flex-col gap-4 mt-2">
            <Input
              label="Circle name"
              placeholder="e.g. Student debt support"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <div>
              <label className="text-sm font-medium text-soro-mist/80 mb-2 block">Topic</label>
              <div className="flex gap-2 flex-wrap">
                {CIRCLE_TOPICS.filter((t) => t.value !== '').map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setCreateForm({ ...createForm, topic: topic.value })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      createForm.topic === topic.value
                        ? 'bg-soro-ember/10 text-soro-ember border border-soro-ember/30'
                        : 'bg-soro-surface text-soro-fade border border-soro-earth/10'
                    }`}
                  >
                    {topic.emoji} {topic.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button variant="ghost" fullWidth onClick={() => { setShowCreateModal(false); setCreateForm({ name: '', topic: 'General', max_members: 20 }) }}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleCreate} isLoading={isCreating}>
                Create circle
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}

function CircleCard({ circle, onOpen }: { circle: CircleData; onOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-5 border-soro-ember/10 hover:border-soro-ember/20 transition-all cursor-pointer"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-soro-ember shrink-0" />
            <h3 className="font-medium text-soro-mist truncate">{circle.name}</h3>
          </div>
          <div className="flex items-center gap-3 ml-6 text-xs text-soro-fade">
            {circle.topic && (
              <span>{EMOJI_MAP[circle.topic] || '💬'} {circle.topic}</span>
            )}
            <span>{circle.member_count}/{circle.max_members} members</span>
          </div>
        </div>
        <ArrowRight size={18} className="text-soro-fade shrink-0 mt-1" />
      </div>
    </motion.div>
  )
}
