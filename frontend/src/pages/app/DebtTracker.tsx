import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, CheckCircle, Circle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '@/components/layout/PageTransition'
import Button from '@/components/shared/Button'
import Input from '@/components/shared/Input'
import Textarea from '@/components/shared/Textarea'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import ProgressBar from '@/components/shared/ProgressBar'
import AdSlot from '@/components/ui/AdSlot'
import { getDebts, createDebt, updateDebt, deleteDebt } from '@/lib/api'
import { useToastStore } from '@/components/shared/Toast'

interface DebtData {
  id: string
  label: string
  amount: number
  amount_paid: number
  due_date?: string
  status: string
  notes?: string
}

const defaultForm = { label: '', amount: 0, amount_paid: 0, due_date: '', notes: '' }

export default function DebtTracker() {
  const navigate = useNavigate()
  const [debts, setDebts] = useState<DebtData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const { addToast } = useToastStore()

  const loadDebts = useCallback(async () => {
    try {
      const data = await getDebts() as DebtData[]
      setDebts(data)
    } catch {
      // Empty
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadDebts() }, [loadDebts])

  const handleCreate = async () => {
    if (!form.label || form.amount <= 0) {
      addToast('Please fill in the label and amount', 'error')
      return
    }
    setSaving(true)
    try {
      const data = await createDebt(form)
      setDebts([data as DebtData, ...debts])
      setShowModal(false)
      setForm(defaultForm)
      addToast('Debt added', 'success')
    } catch {
      addToast('Failed to add debt', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePay = async (debt: DebtData, amount: number) => {
    const newPaid = debt.amount_paid + amount
    try {
      const updated = await updateDebt(debt.id, { amount_paid: newPaid })
      setDebts(debts.map((d) => (d.id === debt.id ? (updated as DebtData) : d)))
      if (newPaid >= debt.amount) {
        addToast(`${debt.label} — cleared! E don clear!`, 'success')
      } else {
        addToast(`₦${amount.toLocaleString()} paid toward ${debt.label}`, 'success')
      }
    } catch {
      addToast('Failed to update debt', 'error')
    }
  }

  const handleClear = async (debt: DebtData) => {
    try {
      const updated = await updateDebt(debt.id, { amount_paid: debt.amount, status: 'cleared' })
      setDebts(debts.map((d) => (d.id === debt.id ? (updated as DebtData) : d)))
      addToast(`${debt.label} — cleared! 🎉`, 'success')
    } catch {
      addToast('Failed to clear debt', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDebt(id)
      setDebts(debts.filter((d) => d.id !== id))
      addToast('Debt removed', 'info')
    } catch {
      addToast('Failed to delete debt', 'error')
    }
  }

  const totalRemaining = debts.reduce((sum, d) => sum + (d.amount - d.amount_paid), 0)
  const clearedDebts = debts.filter((d) => d.status === 'cleared')

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
              Debt Tracker
            </h1>
            <p className="text-sm text-soro-fade mt-1">
              Track your debts without judgment
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>
            Add debt
          </Button>
        </div>

        {/* Summary */}
        {debts.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-soro-fade mb-1">Total remaining</p>
              <p className="text-xl font-display font-bold text-soro-ember">
                ₦{totalRemaining.toLocaleString()}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-soro-fade mb-1">Cleared</p>
              <p className="text-xl font-display font-bold text-green-400">
                {clearedDebts.length}
              </p>
              <p className="text-[10px] text-soro-fade/60">debts</p>
            </div>
          </div>
        )}

        {/* Debt List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-soro-surface rounded w-3/4 mb-3" />
                <div className="h-3 bg-soro-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : debts.length === 0 ? (
          <EmptyState
            title="No debts tracked"
            description="Add your first debt to start tracking. No judgment — just progress."
            action={
              <Button onClick={() => setShowModal(true)} leftIcon={<Plus size={18} />}>
                Add your first debt
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {/* Sort: unpaid first, then cleared */}
            {[...debts]
              .sort((a, b) => {
                if (a.status === 'cleared' && b.status !== 'cleared') return 1
                if (a.status !== 'cleared' && b.status === 'cleared') return -1
                return 0
              })
              .map((debt, i) => {
                const progress = debt.amount > 0 ? (debt.amount_paid / debt.amount) * 100 : 0
                const isCleared = debt.status === 'cleared'

                return (
                  <motion.div
                    key={debt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`glass-card rounded-2xl p-5 transition-all ${
                      isCleared ? 'border-green-500/20 bg-soro-safe/10' : 'border-soro-earth/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isCleared ? (
                            <CheckCircle size={16} className="text-green-400 shrink-0" />
                          ) : (
                            <Circle size={16} className="text-soro-ember shrink-0" />
                          )}
                          <h3 className={`font-medium ${isCleared ? 'text-green-400 line-through' : 'text-soro-mist'}`}>
                            {debt.label}
                          </h3>
                        </div>

                        <div className="flex items-baseline gap-2 ml-6 mb-2">
                          <span className="text-lg font-mono font-semibold text-soro-mist">
                            ₦{(debt.amount - debt.amount_paid).toLocaleString()}
                          </span>
                          <span className="text-xs text-soro-fade">
                            of ₦{debt.amount.toLocaleString()}
                          </span>
                          {debt.due_date && !isCleared && (
                            <span className="text-[10px] text-soro-fade/60">
                              Due: {debt.due_date}
                            </span>
                          )}
                        </div>

                        <div className="ml-6">
                          <ProgressBar
                            progress={progress}
                            size="sm"
                            color={isCleared ? 'safe' : 'ember'}
                            showPercent
                          />
                        </div>

                        {debt.notes && (
                          <p className="text-xs text-soro-fade/70 mt-2 ml-6 italic">{debt.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        {!isCleared && (
                          <>
                            <button
                              onClick={() => handlePay(debt, 1000)}
                              className="px-3 py-1 rounded-lg bg-soro-safe/20 text-green-400 text-xs font-medium hover:bg-soro-safe/30 transition-colors"
                            >
                              +₦1,000
                            </button>
                            <button
                              onClick={() => handlePay(debt, 5000)}
                              className="px-3 py-1 rounded-lg bg-soro-safe/20 text-green-400 text-xs font-medium hover:bg-soro-safe/30 transition-colors"
                            >
                              +₦5,000
                            </button>
                            <button
                              onClick={() => handleClear(debt)}
                              className="px-3 py-1 rounded-lg bg-soro-ember/10 text-soro-ember text-xs font-medium hover:bg-soro-ember/20 transition-colors"
                            >
                              Clear all
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(debt.id)}
                          className="p-1.5 rounded-lg text-soro-fade hover:text-soro-danger hover:bg-soro-danger/10 transition-colors mt-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
          </div>
        )}

        {/* Ad */}
        <AdSlot className="mt-8" />

        {/* Add Debt Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setForm(defaultForm) }}
          title="Add debt"
        >
          <div className="flex flex-col gap-4 mt-2">
            <Input
              label="What is this debt for?"
              placeholder="e.g. School fees, Airtime loan..."
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <Input
              label="Total amount (₦)"
              type="number"
              placeholder="0"
              value={form.amount || ''}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
            <Input
              label="Already paid? (₦)"
              type="number"
              placeholder="0"
              value={form.amount_paid || ''}
              onChange={(e) => setForm({ ...form, amount_paid: Number(e.target.value) })}
            />
            <Input
              label="Due date (optional)"
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
            <Textarea
              label="Notes (optional)"
              placeholder="Any details you want to remember..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
            <div className="flex gap-3 mt-2">
              <Button variant="ghost" fullWidth onClick={() => { setShowModal(false); setForm(defaultForm) }}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleCreate} isLoading={saving}>
                Add debt
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  )
}
