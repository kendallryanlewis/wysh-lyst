import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import type { TimelineEntry, WantItem } from '@/types'
import { CheckCircle, ShoppingCart, Trophy, Calendar } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/utils-wants'

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTimeline()
  }, [])

  const loadTimeline = async () => {
    try {
      const entries = await db.getAllTimeline()
      setTimeline(entries)
    } catch (error) {
      console.error('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: TimelineEntry['type']) => {
    switch (type) {
      case 'want_completed':
        return <CheckCircle size={24} weight="fill" className="text-green-400" />
      case 'want_purchased':
        return <ShoppingCart size={24} weight="fill" className="text-primary" />
      case 'plan_completed':
        return <Trophy size={24} weight="fill" className="text-accent" />
      case 'milestone_completed':
        return <Trophy size={24} weight="fill" className="text-blue-400" />
      default:
        return <CheckCircle size={24} weight="fill" className="text-green-400" />
    }
  }

  const groupByMonth = (entries: TimelineEntry[]) => {
    const grouped: Record<string, TimelineEntry[]> = {}
    
    entries.forEach(entry => {
      const date = new Date(entry.date)
      const monthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = []
      }
      grouped[monthYear].push(entry)
    })
    
    return grouped
  }

  const groupedTimeline = groupByMonth(timeline)

  if (loading) {
    return (
      <div className="p-6 md:p-12 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded-xl w-1/3"></div>
          <div className="h-64 bg-muted rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-12 space-y-6 max-w-5xl pb-24 md:pb-6">
      <div>
        <h1 className="text-4xl font-semibold mb-2">Timeline</h1>
        <p className="text-muted-foreground">
          Celebrate your journey—{timeline.length} {timeline.length === 1 ? 'milestone' : 'milestones'} achieved
        </p>
      </div>

      {timeline.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Calendar size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No timeline entries yet</h3>
              <p className="text-muted-foreground">
                As you complete wants and achieve milestones, they'll appear here.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedTimeline).map(([monthYear, entries]) => (
            <div key={monthYear} className="space-y-4">
              <h2 className="text-2xl font-semibold sticky top-0 bg-background py-2 z-10">
                {monthYear}
              </h2>
              <div className="relative border-l-2 border-primary/30 pl-8 space-y-6">
                {entries.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-11 top-0 w-8 h-8 rounded-full bg-card border-2 border-primary/50 flex items-center justify-center">
                      {getIcon(entry.type)}
                    </div>
                    <Card className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">{entry.title}</h3>
                            {entry.description && (
                              <p className="text-muted-foreground">{entry.description}</p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        {entry.category && (
                          <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm capitalize">
                            {entry.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {timeline.length > 0 && (
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 text-center">
          <div className="space-y-3">
            <Trophy size={48} weight="fill" className="mx-auto text-primary" />
            <h3 className="text-2xl font-semibold">Keep Going!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You've accomplished {timeline.length} {timeline.length === 1 ? 'goal' : 'goals'}. 
              Every step forward is progress worth celebrating.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
