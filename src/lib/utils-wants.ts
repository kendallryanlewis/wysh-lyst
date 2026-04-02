import type { WantCategory, WantStatus, Priority, WantItem } from '@/types'

export const WANT_CATEGORIES: { value: WantCategory; label: string; icon: string }[] = [
  { value: 'products', label: 'Products', icon: 'ShoppingBag' },
  { value: 'experiences', label: 'Experiences', icon: 'Compass' },
  { value: 'goals', label: 'Goals', icon: 'Target' },
  { value: 'career', label: 'Career', icon: 'Briefcase' },
  { value: 'home', label: 'Home', icon: 'House' },
  { value: 'travel', label: 'Travel', icon: 'Airplane' },
  { value: 'wellness', label: 'Wellness', icon: 'HeartPulse' },
  { value: 'learning', label: 'Learning', icon: 'GraduationCap' },
  { value: 'style', label: 'Style', icon: 'Sparkles' },
  { value: 'business_ideas', label: 'Business Ideas', icon: 'Lightbulb' },
  { value: 'relationships', label: 'Relationships', icon: 'Users' },
  { value: 'lifestyle_upgrades', label: 'Lifestyle Upgrades', icon: 'TrendingUp' },
  { value: 'custom', label: 'Custom', icon: 'Plus' },
]

export const WANT_STATUSES: { value: WantStatus; label: string; color: string }[] = [
  { value: 'dreaming', label: 'Dreaming', color: 'text-purple-400' },
  { value: 'planning', label: 'Planning', color: 'text-blue-400' },
  { value: 'in_progress', label: 'In Progress', color: 'text-amber-400' },
  { value: 'saved_for_later', label: 'Saved for Later', color: 'text-gray-400' },
  { value: 'purchased', label: 'Purchased', color: 'text-green-400' },
  { value: 'completed', label: 'Completed', color: 'text-emerald-400' },
  { value: 'archived', label: 'Archived', color: 'text-gray-500' },
]

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'text-gray-400' },
  { value: 'medium', label: 'Medium', color: 'text-blue-400' },
  { value: 'high', label: 'High', color: 'text-amber-400' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-400' },
]

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInMs = now.getTime() - then.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

export function getCategoryLabel(category: WantCategory): string {
  return WANT_CATEGORIES.find((c) => c.value === category)?.label || category
}

export function getStatusLabel(status: WantStatus): string {
  return WANT_STATUSES.find((s) => s.value === status)?.label || status
}

export function getPriorityLabel(priority: Priority): string {
  return PRIORITIES.find((p) => p.value === priority)?.label || priority
}

export function filterWants(
  wants: WantItem[],
  options: {
    search?: string
    category?: WantCategory
    status?: WantStatus
    priority?: Priority
    showArchived?: boolean
  }
): WantItem[] {
  return wants.filter((want) => {
    if (!options.showArchived && want.archived) return false
    if (options.category && want.category !== options.category) return false
    if (options.status && want.status !== options.status) return false
    if (options.priority && want.priority !== options.priority) return false
    if (options.search) {
      const searchLower = options.search.toLowerCase()
      return (
        want.title.toLowerCase().includes(searchLower) ||
        want.description?.toLowerCase().includes(searchLower) ||
        want.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
    }
    return true
  })
}

export function sortWants(
  wants: WantItem[],
  sortBy: 'newest' | 'oldest' | 'priority' | 'cost' | 'target_date' | 'progress'
): WantItem[] {
  const sorted = [...wants]

  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'priority':
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    case 'cost':
      return sorted.sort((a, b) => (b.estimatedCost || 0) - (a.estimatedCost || 0))
    case 'target_date':
      return sorted.sort((a, b) => {
        if (!a.targetDate) return 1
        if (!b.targetDate) return -1
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      })
    case 'progress':
      return sorted.sort((a, b) => b.progressPercent - a.progressPercent)
    default:
      return sorted
  }
}

export function calculateBudgetSnapshot(wants: WantItem[]) {
  const activeWants = wants.filter((w) => !w.archived)
  const completedWants = activeWants.filter(
    (w) => w.status === 'completed' || w.status === 'purchased'
  )

  const totalEstimatedCost = activeWants.reduce((sum, w) => sum + (w.estimatedCost || 0), 0)
  const completedCost = completedWants.reduce((sum, w) => sum + (w.estimatedCost || 0), 0)
  const averageCostPerWant = activeWants.length > 0 ? totalEstimatedCost / activeWants.length : 0

  const highestCostWant = activeWants.reduce(
    (max, w) => ((w.estimatedCost || 0) > (max?.estimatedCost || 0) ? w : max),
    activeWants[0]
  )

  const categoryBreakdown = WANT_CATEGORIES.map((cat) => {
    const categoryWants = activeWants.filter((w) => w.category === cat.value)
    const categoryCompleted = categoryWants.filter(
      (w) => w.status === 'completed' || w.status === 'purchased'
    )
    return {
      category: cat.value,
      count: categoryWants.length,
      completedCount: categoryCompleted.length,
      totalEstimatedCost: categoryWants.reduce((sum, w) => sum + (w.estimatedCost || 0), 0),
    }
  }).filter((cat) => cat.count > 0)

  return {
    totalEstimatedCost,
    completedCost,
    averageCostPerWant,
    highestCostWant,
    categoryBreakdown,
  }
}
