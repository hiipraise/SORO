export const CRISIS_NUMBER = '08111909909'
export const CRISIS_ORGANIZATION = 'MANI Helpline'

/**
 * Fetches crisis info from the backend config.
 * Falls back to defaults if the server is unreachable.
 */
export async function fetchCrisisInfo(): Promise<{ number: string; organization: string }> {
  try {
    const { api } = await import('./api')
    const data = await api('/crisis-info') as { number: string; organization: string }
    return {
      number: data.number || CRISIS_NUMBER,
      organization: data.organization || CRISIS_ORGANIZATION,
    }
  } catch {
    return { number: CRISIS_NUMBER, organization: CRISIS_ORGANIZATION }
  }
}
