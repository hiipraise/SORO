import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowLeft, Target, Zap, Clock, Sparkles, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import ProgressBar from '@/components/shared/ProgressBar'
import AdSlot from '@/components/ui/AdSlot'
import CelebrationModal from '@/components/ui/CelebrationModal'
import { getGoals, createGoal, updateGoal } from '@/lib/api'
import { useToastStore } from '@/components/shared/Toast'

interface GoalData {
  id: string
  title: string
  target_amount: number
  current_amount: number
  deadline?: string
  priority: string
  status: string
  progress: number
}

const priorities = [
  { value: 'urgent', label: 'Urgent', icon: Zap, color: 'text-soro-danger' },
  { value: 'soon', label: 'Soon', icon: Clock, color: 'text-soro-ember' },
  { value: 'eventually', label: 'Eventually', icon: Sparkles, color: 'text-soro-gold' },
]

const defaultForm = {
  title: '',
  target_amount: 0,
  current_amount: 0,
  deadline: '',
  priority: 'eventually',
}

export default function GoalTracker() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<GoalData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebratedGoal, setCelebratedGoal] = useState('')
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [progressForm, setProgressForm] = useState<{ id: string; amount: number } | null>(null)
  const { addToast } = useToastStore()

  const loadGoals = useCallback(async () => {
    try {
      const data = await getGoals() as GoalData[]
      setGoals(data)
    } catch {
      // Empty
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadGoals() }, [loadGoals])

  const handleCreate = async () => {
    if (!form.title || form.target_amount <= 0) {
      addToast('Please fill in the title and target amount', 'error')
      return
    }
    setSaving(true)
    try {
      const data = await createGoal(form)
      setGoals([data as GoalData, ...goals])
      setShowModal(false)
      setForm(defaultForm)
      addToast('Goal created!', 'success')
    } catch {
      addToast('Failed to create goal', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleProgressUpdate = async (goalId: string, amount: number) => {
    const goal = goals.find((g) => g.id === goalId)
    if (!goal) return

    const newAmount = goal.current_amount + amount
    const wasCompleted = newAmount >= goal.target_amount

    try {
      const updated = await updateGoal(goalId, { current_amount: newAmount })
      setGoals(goals.map((g) => (g.id === goalId ? (updated as GoalData) : g)))
      setProgressForm(null)

      if (wasCompleted) {
        setCelebratedGoal(goal.title)
        setShowCelebration(true)
      } else {
        addToast(`₦${amount.toLocaleString()} added to "${goal.title}"`, 'success')
      }
    } catch {
      addToast('Failed to update progress', 'error')
    }
  }

  const getPriorityLabel = (p: string) => {
    const found = priorities.find((pr) => pr.value === p)
    return found ? found.label : p
  }

  const activeGoals = goals.filter((g) => g.status === 'active')
  const completedGoals = goals.filter((g) => g.status === 'completed')

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl">
        {/* Back */}
        <button
          onClick={() => navigate('/app/finance')}
          className="flex items-center gap-2 text-sm text-soro-fade hover:text-soro-mist transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Finance
        </button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-soro-mist">
              Micro-Goals
            </h1>
            <p className="text-sm text-soro-fade mt-1">
              Small goals. Big progress. One step at a time.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>
            New goal
          </Button>
        </div>

        {/* Stats */}
        {goals.length > 0 && (
          <div className="flex gap-3">
            <div className="flex-1 glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-soro-fade mb-1">Active</p>
              <p className="text-xl font-display font-bold text-soro-ember">{activeGoals.length}</p>
            </div>
            <div className="flex-1 glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-soro-fade mb-1">Completed</p>
              <p className="text-xl font-display font-bold text-green-400">{completedGoals.length}</p>
            </div>
            <div className="flex-1 glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-soro-fade mb-1">Total saved</p>
              <p className="text-xl font-display font-bold text-soro-gold">
                ₦{goals.reduce((s, g) => s + g.current_amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Active Goals */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-soro-surface rounded w-3/4 mb-3" />
                <div className="h-3 bg-soro-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeGoals.length === 0 && completedGoals.length === 0 ? (
          <EmptyState
            title="No goals yet"
            description="Create your first micro-goal. Big things start small."
            action={
              <Button onClick={() => setShowModal(true)} leftIcon={<Target size={18} />}>
                Create your first goal
              </Button>
            }
          />
        ) : (
          <>
            {activeGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider">
                  Active goals ({activeGoals.length})
                </h2>
                {activeGoals.map((goal, i) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-5 border-soro-ember/10"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Target size={16} className="text-soro-ember" />
                          <h3 className="font-medium text-soro-mist">{goal.title}</h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-soro-fade ml-6">
                          <span>Priority: {getPriorityLabel(goal.priority)}</span>
                          {goal.deadline && <span>Due: {goal.deadline}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-mono font-semibold text-soro-mist">
                          ₦{goal.current_amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-soro-fade">
                          of ₦{goal.target_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <ProgressBar
                      progress={goal.progress}
                      size="md"
                      color="gold"
                      showPercent
                    />

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setProgressForm({ id: goal.id, amount: 0 })}
                        className="px-3 py-1.5 rounded-lg bg-soro-gold/10 text-soro-gold text-xs font-medium hover:bg-soro-gold/20 transition-colors"
                      >
                        Add progress
                      </button>
                    </div>

                    {/* Inline progress form */}
                    {progressForm?.id === goal.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2 mt-3 pt-3 border-t border-soro-earth/10"
                      >
                        <Input
                          type="number"
                          placeholder="Amount saved (₦)"
                          value={progressForm.amount || ''}
                          onChange={(e) => setProgressForm({ ...progressForm, amount: Number(e.target.value) })}
                          className="text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleProgressUpdate(goal.id, progressForm.amount)}
                          disabled={!progressForm.amount || progressForm.amount <= 0}
                        >
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProgressForm(null)}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-soro-fade uppercase tracking-wider">
                  Completed ✨ ({completedGoals.length})
                </h2>
                {completedGoals.map((goal, i) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card rounded-2xl p-4 border-green-500/20 bg-soro-safe/10"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-soro-gold shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-400 line-through">
                          {goal.title}
                        </p>
                        <p className="text-xs text-soro-fade">
                          ₦{goal.target_amount.toLocaleString()} — {goal.priority}
                        </p>
                      </div>
                      <CheckCircle size={20} className="text-green-400 shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Ad */}
        <AdSlot className="mt-8" />

        {/* Create Goal Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setForm(defaultForm) }}
          title="Create micro-goal"
        >
          <div className="flex flex-col gap-4 mt-2">
            <Input
              label="Goal"
              placeholder="e.g. Save for new laptop, Pay off debt..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Input
              label="Target amount (₦)"
              type="number"
              placeholder="0"
              value={form.target_amount || ''}
              onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })}
            />
            <Input
              label="Already saved? (₦)"
              type="number"
              placeholder="0"
              value={form.current_amount || ''}
              onChange={(e) => setForm({ ...form, current_amount: Number(e.target.value) })}
            />
            <Input
              label="Deadline (optional)"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />

            <div>
              <label className="text-sm font-medium text-soro-mist/80 mb-2 block">Priority</label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                      form.priority === p.value
                        ? 'border-soro-ember bg-soro-ember/10'
                        : 'border-soro-earth/20 hover:border-soro-earth/40'
                    }`}
                  >
                    <p.icon size={18} className={p.color} />
                    <span className="text-[10px] font-medium text-soro-mist">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Button variant="ghost" fullWidth onClick={() => { setShowModal(false); setForm(defaultForm) }}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleCreate} isLoading={saving}>
                Create goal
              </Button>
            </div>
          </div>
        </Modal>

        {/* Celebration */}
        <CelebrationModal
          isOpen={showCelebration}
          onClose={() => {
            setShowCelebration(false)
            loadGoals() // Refresh to update status
          }}
          title={celebratedGoal}
          emoji="💰"
        />
      </div>
    </PageTransition>
  )
}


