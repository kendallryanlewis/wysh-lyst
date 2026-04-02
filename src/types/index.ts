export type WantStatus = 
  | 'dreaming' 
  | 'planning' 
  | 'in_progress' 
  | 'saved_for_later' 
  | 'purchased' 
  | 'completed' 
  | 'archived'

export type WantCategory = 
  | 'products'
  | 'experiences'
  | 'goals'
  | 'career'
  | 'home'
  | 'travel'
  | 'wellness'
  | 'learning'
  | 'style'
  | 'business_ideas'
  | 'relationships'
  | 'lifestyle_upgrades'
  | 'custom'

export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface WantItem {
  id: string
  title: string
  description?: string
  category: WantCategory
  subcategory?: string
  status: WantStatus
  priority: Priority
  estimatedCost?: number
  targetDate?: string
  tags: string[]
  notes?: string
  imageUrl?: string
  sourceLink?: string
  links?: string[]
  address?: string
  locationLabel?: string
  whyItMatters?: string
  moodTags: string[]
  progressPercent: number
  createdAt: string
  updatedAt: string
  completedAt?: string
  archived: boolean
  isPinned?: boolean
}

export interface PlanStep {
  id: string
  title: string
  completed: boolean
  order: number
  dueDate?: string
  notes?: string
}

export interface PlanMilestone {
  id: string
  title: string
  description?: string
  targetDate?: string
  completed: boolean
  completedAt?: string
  steps: PlanStep[]
}

export interface Plan {
  id: string
  wantId?: string
  title: string
  description?: string
  milestones: PlanMilestone[]
  targetDate?: string
  budgetEstimate?: number
  progressPercent: number
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  completedAt?: string
  aiGenerated: boolean
}

export type AiProviderType = 
  | 'openai' 
  | 'anthropic' 
  | 'gemini' 
  | 'azure_openai' 
  | 'openai_compatible'

export type StorageMode = 'session' | 'encrypted_device'

export interface AiConnection {
  id: string
  provider: AiProviderType
  displayName: string
  model: string
  endpoint?: string
  deploymentName?: string
  apiVersion?: string
  storageMode: StorageMode
  maskedKeyPreview?: string
  encryptedSecretId?: string
  isDefault: boolean
  lastValidatedAt?: string
  createdAt: string
  updatedAt: string
}

export interface EncryptedSecretRecord {
  id: string
  ciphertext: string
  iv: string
  salt: string
  createdAt: string
  metadata?: Record<string, unknown>
}

export interface AiRequest {
  provider: AiProviderType
  model: string
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  linkedWantIds?: string[]
  linkedPlanId?: string
}

export interface AiResponse {
  provider: AiProviderType
  model: string
  content: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  latencyMs: number
  rawMetadata?: Record<string, unknown>
  error?: string
}

export interface PromptTemplate {
  id: string
  title: string
  description: string
  template: string
  category: 'planning' | 'clarity' | 'comparison' | 'motivation' | 'organization'
  requiresWants: boolean
  requiresPlan: boolean
}

export interface TimelineEntry {
  id: string
  wantId?: string
  planId?: string
  type: 'want_completed' | 'plan_completed' | 'milestone_completed' | 'want_purchased'
  title: string
  description?: string
  date: string
  category?: WantCategory
  imageUrl?: string
  celebrationShown: boolean
}

export interface DashboardInsight {
  id: string
  title: string
  content: string
  type: 'motivation' | 'suggestion' | 'summary' | 'milestone'
  priority: Priority
  createdAt: string
  dismissed: boolean
  aiGenerated: boolean
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'auto'
  accentColor: 'gold' | 'platinum' | 'blue' | 'green'
  defaultView: 'grid' | 'list'
  defaultAiConnectionId?: string
  passphraseTimeout: number
  autoLockEnabled: boolean
  onboardingCompleted: boolean
  analytics: boolean
}

export interface CategorySummary {
  category: WantCategory
  count: number
  completedCount: number
  totalEstimatedCost: number
}

export interface BudgetSnapshot {
  totalEstimatedCost: number
  completedCost: number
  averageCostPerWant: number
  highestCostWant?: WantItem
  categoryBreakdown: CategorySummary[]
}
