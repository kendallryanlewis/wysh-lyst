import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import type { WantItem } from '@/types'
import { Plus, MagnifyingGlass, Sparkle } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatRelativeTime, calculateBudgetSnapshot } from '@/lib/utils-wants'

interface HomePageProps {
  onNavigate: (page: 'home' | 'wants' | 'plans' | 'ai' | 'timeline' | 'settings') => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [wants, setWants] = useState<WantItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWants()
  }, [])

  const loadWants = async () => {
    const allWants = await db.getAllWants()
    setWants(allWants)
    setLoading(false)
  }

  const activeWants = wants.filter(w => !w.archived)
  const recentWants = activeWants.slice(0, 5)
  const budget = calculateBudgetSnapshot(wants)
  const completionRate = activeWants.length > 0 
    ? Math.round(((activeWants.filter(w => w.status === 'completed' || w.status === 'purchased').length) / activeWants.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="h-3 bg-muted rounded w-1/4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl pb-20 md:pb-6">
      <header className="space-y-1.5">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Welcome to Your Future
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeWants.length} {activeWants.length === 1 ? 'desire' : 'desires'} awaiting your attention
        </p>
      </header>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Search your wants, goals, and dreams..."
          className="w-full pl-10 pr-3 py-2.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="p-4 bg-gradient-to-br from-primary/10 via-card to-card border-primary/20">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-2xl font-semibold text-primary">
              {formatCurrency(budget.totalEstimatedCost)}
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-semibold text-accent">
              {completionRate}%
            </p>
          </div>
        </Card>

        <Card className="p-4 bg-card">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Active Wants</p>
            <p className="text-2xl font-semibold">
              {activeWants.length}
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-gradient-to-br from-accent/5 via-card to-card border-accent/10">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-accent/10">
            <Sparkle size={20} className="text-accent" weight="fill" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">AI Insight</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You've been actively planning your future. Consider connecting an AI assistant in Settings to get personalized recommendations and action plans for your top priorities.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently Added</h2>
          <Button onClick={() => onNavigate('wants')} variant="ghost" size="sm" className="text-primary h-8 text-xs">
            View All
          </Button>
        </div>

        {recentWants.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Plus size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1">No wants yet</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Start by adding something you desire—a goal, product, or experience.
                </p>
                <Button onClick={() => onNavigate('wants')} size="sm" className="bg-primary text-primary-foreground">
                  Add Your First Want
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentWants.map((want) => (
              <Card key={want.id} className="p-4 hover:bg-muted/50 transition-all cursor-pointer">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-sm mb-0.5">{want.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {want.description || 'No description'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-primary capitalize">{want.category.replace('_', ' ')}</span>
                    <span className="text-muted-foreground">
                      {formatRelativeTime(want.createdAt)}
                    </span>
                  </div>
                  {want.estimatedCost && (
                    <p className="text-xs font-medium text-accent">
                      {formatCurrency(want.estimatedCost)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => onNavigate('wants')}
          className="flex-1 bg-primary text-primary-foreground py-5 text-sm"
        >
          <Plus size={20} className="mr-2" weight="bold" />
          Add New Want
        </Button>
      </div>
    </div>
  )
}
