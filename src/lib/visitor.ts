const VISITOR_ID_KEY = 'dinner-plans-visitor-id'
const VISITOR_NAME_KEY = 'dinner-plans-visitor-name'

export function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let id = localStorage.getItem(VISITOR_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(VISITOR_ID_KEY, id)
  }
  return id
}

export function getVisitorName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(VISITOR_NAME_KEY)
}

export function setVisitorName(name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(VISITOR_NAME_KEY, name)
}

export function clearVisitor(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(VISITOR_ID_KEY)
  localStorage.removeItem(VISITOR_NAME_KEY)
}
