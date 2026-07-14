const DEFAULT_API_ORIGIN = 'https://soro-qk1e.onrender.com'

function getApiBase(): string {
  const configuredOrigin = import.meta.env.VITE_API_URL?.trim()
  const origin = configuredOrigin || (import.meta.env.PROD ? DEFAULT_API_ORIGIN : '')

  return origin ? `${origin.replace(/\/+$/, '')}/api` : '/api'
}

const API_BASE = getApiBase()

interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

function getToken(): string | null {
  return localStorage.getItem('soro_token')
}

function setToken(token: string) {
  localStorage.setItem('soro_token', token)
}

function clearToken() {
  localStorage.removeItem('soro_token')
}

export { getToken, setToken, clearToken }

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let url = `${API_BASE}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }))

    // P0.4/P3.16: Central 401 handling — emit event for top-level listener
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('soro:session-expired'))
    }

    throw new ApiError(response.status, error.detail || 'Request failed')
  }

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// ─── Auth API ───

export async function signup(email: string, password: string) {
  const data = await api<{ token: string; user: Record<string, unknown> }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: Record<string, unknown> }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function createAnonymousSession() {
  const data = await api<{ token: string; anonymous_id: string; user: { id: string; is_anonymous: boolean; created_at: string } }>('/auth/anonymous', {
    method: 'POST',
  })
  setToken(data.token)
  return data
}

export async function claimAccount(email: string, password: string) {
  const data = await api<{ token: string; user: Record<string, unknown> }>('/auth/claim-account', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data
}

export async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' })
  } catch {
    // Swallow — we clear locally regardless
  }
  clearToken()
  // Clear PWA cached data on logout
  try {
    if ('caches' in window) {
      const cacheKeys = await caches.keys()
      for (const key of cacheKeys) {
        if (key.includes('api-cache') || key.includes('soro')) {
          await caches.delete(key)
        }
      }
    }
  } catch {
    // Best-effort cache clearing
  }
}

// ─── Check-in API ───

export async function createCheckin(moodState: string, ventText?: string) {
  return api('/checkins/', {
    method: 'POST',
    body: JSON.stringify({ mood_state: moodState, vent_text: ventText }),
  })
}

export async function getCheckins() {
  return api('/checkins/')
}

// ─── Reflection API ───

export async function getReflection(moodState: string, ventText?: string) {
  return api<{ reflection: string }>('/reflect/', {
    method: 'POST',
    body: JSON.stringify({ mood_state: moodState, vent_text: ventText || '' }),
  })
}

export async function getReflections() {
  return api('/reflect/')
}

// ─── Journal API ───

function normalizePagination(skip: unknown, limit: unknown, defaultLimit: number) {
  return {
    skip: typeof skip === 'number' ? skip : 0,
    limit: typeof limit === 'number' ? limit : defaultLimit,
  }
}

export async function getJournalEntries(skip: unknown = 0, limit: unknown = 20) {
  const page = normalizePagination(skip, limit, 20)

  return api<{ items: any[]; total: number; skip: number; limit: number; has_more: boolean }>(
    `/journal/?skip=${page.skip}&limit=${page.limit}`,
  )
}

export async function getJournalEntry(id: string) {
  return api(`/journal/${id}`)
}

export async function createJournalEntry(data: {
  title: string
  content: string
  mood_tag?: string
}) {
  return api('/journal/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateJournalEntry(
  id: string,
  data: { title?: string; content?: string; mood_tag?: string },
) {
  return api(`/journal/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteJournalEntry(id: string) {
  return api(`/journal/${id}`, { method: 'DELETE' })
}

// ─── Anchor API ───

export async function getTodayAnchor() {
  return api('/anchor/today')
}

export async function getAnchorArchive() {
  return api('/anchor/archive')
}

// ─── Finance API ───

export async function getDebts(skip: unknown = 0, limit: unknown = 100) {
  const page = normalizePagination(skip, limit, 100)

  return api<{ items: any[]; total: number; skip: number; limit: number; has_more: boolean }>(
    `/finance/debts/?skip=${page.skip}&limit=${page.limit}`,
  )
}

export async function createDebt(data: {
  label: string
  amount: number
  amount_paid?: number
  due_date?: string
  notes?: string
}) {
  return api('/finance/debts/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateDebt(
  id: string,
  data: {
    label?: string
    amount?: number
    amount_paid?: number
    due_date?: string
    status?: string
    notes?: string
  },
) {
  return api(`/finance/debts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteDebt(id: string) {
  return api(`/finance/debts/${id}`, { method: 'DELETE' })
}

export async function payDebt(debtId: string, amount: number) {
  return api(`/finance/debts/${debtId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export async function getGoals(skip: unknown = 0, limit: unknown = 100) {
  const page = normalizePagination(skip, limit, 100)

  return api<{ items: any[]; total: number; skip: number; limit: number; has_more: boolean }>(
    `/finance/goals/?skip=${page.skip}&limit=${page.limit}`,
  )
}

export async function createGoal(data: {
  title: string
  target_amount: number
  current_amount?: number
  deadline?: string
  priority?: string
}) {
  return api('/finance/goals/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateGoal(
  id: string,
  data: {
    title?: string
    target_amount?: number
    current_amount?: number
    deadline?: string
    priority?: string
  },
) {
  return api(`/finance/goals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ─── Insights API ───

export async function getMoodInsights() {
  return api('/insights/mood')
}

// ─── Settings API ───

export async function getSettings() {
  return api('/settings')
}

export async function updateSettings(data: Record<string, unknown>) {
  return api('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function addGoalProgress(goalId: string, amount: number) {
  return api(`/finance/goals/${goalId}/progress`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export async function deleteAccount() {
  return api('/account', { method: 'DELETE' })
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return api('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}

export async function exportAccountData() {
  return api('/account/export')
}
