import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MessageSquare, Shield, AlertTriangle,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Textarea from '@/components/shared/Textarea'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import AdSlot from '@/components/ui/AdSlot'
import { getCommunityPosts, createCommunityPost, reactToPost } from '@/lib/api'
import { useToastStore } from '@/components/shared/Toast'

interface PostData {
  id: string
  content: string
  topic_tag?: string
  reactions: Record<string, number>
  created_at: string
  expires_at: string
}

const TOPICS = [
  { value: '', label: 'All', emoji: '🌍' },
  { value: 'Money', label: 'Money', emoji: '💰' },
  { value: 'Family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
  { value: 'School', label: 'School', emoji: '📚' },
  { value: 'Grief', label: 'Grief', emoji: '🕯️' },
  { value: 'Relationships', label: 'Relationships', emoji: '💔' },
  { value: 'Faith', label: 'Faith', emoji: '🙏' },
  { value: 'General', label: 'General', emoji: '💬' },
]

const REACTION_LABELS: Record<string, { label: string; icon: string }> = {
  feel_this: { label: 'I feel this', icon: '💙' },
  you_go_make_am: { label: 'You go make am', icon: '💪' },
  dey_with_you: { label: 'I dey with you', icon: '🤝' },
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

export default function Community() {
  const [selectedTopic, setSelectedTopic] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [postContent, setPostContent] = useState('')
  const [postTopic, setPostTopic] = useState('')
  const [crisisWarning, setCrisisWarning] = useState('')
  const { addToast } = useToastStore()
  const queryClient = useQueryClient()

  const { data: posts = [], isLoading } = useQuery<PostData[]>({
    queryKey: ['community-posts', selectedTopic],
    queryFn: () => getCommunityPosts(selectedTopic || undefined) as Promise<PostData[]>,
  })

  const createPostMutation = useMutation({
    mutationFn: (data: { content: string; topic_tag?: string }) => createCommunityPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
    onError: () => {
      addToast('Failed to share. Please try again.', 'error')
    },
  })

  const reactMutation = useMutation({
    mutationFn: ({ postId, reaction }: { postId: string; reaction: string }) =>
      reactToPost(postId, reaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    },
    onError: () => {
      addToast('Could not save reaction. Try again.', 'error')
    },
  })

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      addToast('Please write something to share', 'error')
      return
    }

    setCrisisWarning('')

    try {
      const data = await createPostMutation.mutateAsync({
        content: postContent.trim(),
        topic_tag: postTopic || undefined,
      }) as any

      if (data.crisis) {
        setCrisisWarning(data.message)
        return
      }

      setShowPostModal(false)
      setPostContent('')
      setPostTopic('')
      addToast('Your voice matters. Thank you for sharing.', 'success')
    } catch {
      // Error handled by mutation onError
    }
  }

  const handleReact = async (postId: string, reaction: string) => {
    const label = REACTION_LABELS[reaction]?.label || 'Reaction'
    reactMutation.mutate({ postId, reaction }, {
      onSuccess: () => {
        addToast(`${label} — thank you for showing up`, 'success')
      },
    })
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
            Vent Wall
          </h1>
          <p className="text-sm text-soro-fade mt-1">
            No names, no profiles — just your voice.
          </p>
        </div>

        {/* Guidelines */}
        <div className="glass-card rounded-2xl p-4 border-soro-safe/20 bg-soro-safe/5">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-green-400 shrink-0 mt-0.5" />
            <div className="text-xs text-soro-fade leading-relaxed">
              <p className="font-medium text-soro-mist mb-1">
                This is a safe space
              </p>
              <p>No usernames. No profiles. No judgment.</p>
              <p>Posts expire after 7 days. Crisis posts get redirected to help.</p>
            </div>
          </div>
        </div>

        {/* Compose */}
        <Button
          onClick={() => setShowPostModal(true)}
          fullWidth
          size="lg"
          leftIcon={<MessageSquare size={18} />}
        >
          Share what's on your mind
        </Button>

        {/* Topics filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TOPICS.map((topic) => (
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

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-soro-surface rounded w-3/4 mb-3" />
                <div className="h-3 bg-soro-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            title={selectedTopic ? `No ${selectedTopic.toLowerCase()} posts yet` : 'No posts yet'}
            description={
              selectedTopic
                ? `Be the first to share something about ${selectedTopic.toLowerCase()}.`
                : 'The wall is empty. Be the first to share your voice.'
            }
            action={
              <Button onClick={() => setShowPostModal(true)} leftIcon={<MessageSquare size={18} />}>
                Share something
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="glass-card rounded-2xl p-5 border-soro-earth/10"
              >
                {/* Topic tag */}
                {post.topic_tag && (
                  <span className="inline-block text-[10px] font-medium text-soro-ember bg-soro-ember/5 px-2 py-0.5 rounded-full mb-2">
                    {post.topic_tag}
                  </span>
                )}

                {/* Content */}
                <p className="text-sm text-soro-mist leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                {/* Time */}
                <p className="text-[10px] text-soro-fade/50 mt-2">
                  {getRelativeTime(post.created_at)}
                </p>

                {/* Reactions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-soro-earth/5">
                  {Object.entries(REACTION_LABELS).map(([key, val]) => {
                    const count = post.reactions?.[key] || 0
                    return (
                      <button
                        key={key}
                        onClick={() => handleReact(post.id, key)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-soro-fade hover:text-soro-mist hover:bg-soro-surface transition-colors"
                      >
                        <span>{val.icon}</span>
                        <span>{val.label}</span>
                        {count > 0 && (
                          <span className="font-mono text-soro-ember">{count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ad Slot — after every 10 posts (but at bottom) */}
        {posts.length >= 10 && <AdSlot className="mt-4" />}

        {/* Compose Modal */}
        <Modal
          isOpen={showPostModal}
          onClose={() => { setShowPostModal(false); setPostContent(''); setPostTopic(''); setCrisisWarning('') }}
          title="Share your thoughts"
        >
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex gap-2 flex-wrap">
              {TOPICS.filter((t) => t.value !== '').map((topic) => (
                <button
                  key={topic.value}
                  onClick={() => setPostTopic(topic.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    postTopic === topic.value
                      ? 'bg-soro-ember/10 text-soro-ember border border-soro-ember/30'
                      : 'bg-soro-surface text-soro-fade border border-soro-earth/10'
                  }`}
                >
                  {topic.emoji} {topic.label}
                </button>
              ))}
            </div>

            <Textarea
              placeholder="What's on your mind? No names, no pressure..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={5}
              className="min-h-[120px]"
            />

            {crisisWarning && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-soro-danger/5 border border-soro-danger/20">
                <AlertTriangle size={16} className="text-soro-danger shrink-0 mt-0.5" />
                <p className="text-xs text-soro-danger leading-relaxed">{crisisWarning}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => { setShowPostModal(false); setPostContent(''); setCrisisWarning('') }}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleCreatePost} isLoading={createPostMutation.isPending}>
                Share anonymously
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}
