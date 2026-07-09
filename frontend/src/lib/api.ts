const API_BASE = '/api'

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

function getAnonymousId(): string | null {
  return localStorage.getItem('soro_anonymous_id')
}

function setAnonymousId(id: string) {
  localStorage.setItem('soro_anonymous_id', id)
}

export { getToken, setToken, clearToken, getAnonymousId, setAnonymousId }

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

  const anonymousId = getAnonymousId()
  if (anonymousId) {
    headers['X-Anonymous-Id'] = anonymousId
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
  const data = await api<{ token: string; anonymous_id: string }>('/auth/anonymous', {
    method: 'POST',
  })
  setToken(data.token)
  setAnonymousId(data.anonymous_id)
  return data
}

export async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' })
  } catch {
    // Swallow — we clear locally regardless
  }
  clearToken()
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

export async function getJournalEntries() {
  return api('/journal/')
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

export async function getDebts() {
  return api('/finance/debts/')
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

export async function getGoals() {
  return api('/finance/goals/')
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

// ─── Community API ───

export async function getCommunityPosts(topic?: string) {
  const params: Record<string, string> = {}
  if (topic) params.topic = topic
  return api('/community/posts/', { params })
}

export async function createCommunityPost(data: {
  content: string
  topic_tag?: string
}) {
  return api('/community/posts/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function reactToPost(postId: string, reaction: string) {
  return api(`/community/posts/${postId}/react`, {
    method: 'POST',
    body: JSON.stringify({ reaction }),
  })
}

// ─── Insights API ───

export async function getMoodInsights() {
  return api('/insights/mood')
}

// ─── Circles API ───

export async function getCircles(topic?: string) {
  const params: Record<string, string> = {}
  if (topic) params.topic = topic
  return api('/circles/', { params })
}

export async function getCircle(id: string) {
  return api(`/circles/${id}`)
}

export async function createCircle(data: {
  name: string
  topic?: string
  max_members?: number
}) {
  return api('/circles/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function joinCircle(id: string) {
  return api(`/circles/${id}/join`, { method: 'POST' })
}

export async function leaveCircle(id: string) {
  return api(`/circles/${id}/leave`, { method: 'POST' })
}

export async function getCircleMessages(id: string) {
  return api(`/circles/${id}/messages`)
}

export async function sendCircleMessage(id: string, content: string) {
  return api(`/circles/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
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
