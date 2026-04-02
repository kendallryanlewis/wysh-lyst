import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { House, Heart, Eye, ListChecks, Sparkle, ClockCounterClockwise, Gear } from '@phosphor-icons/react'
import HomePage from '@/pages/HomePage'
import WantsPage from '@/pages/WantsPage'
import VisionPage from '@/pages/VisionPage'
import PlansPage from '@/pages/PlansPage'
import AiPage from '@/pages/AiPage'
import TimelinePage from '@/pages/TimelinePage'
import SettingsPage from '@/pages/SettingsPage'

type Page = 'home' | 'wants' | 'vision' | 'plans' | 'ai' | 'timeline' | 'settings'

const NAV_ITEMS = [
  { id: 'home' as Page, label: 'Home', icon: House },
  { id: 'wants' as Page, label: 'Wants', icon: Heart },
  { id: 'vision' as Page, label: 'Vision', icon: Eye },
  { id: 'plans' as Page, label: 'Plans', icon: ListChecks },
  { id: 'ai' as Page, label: 'AI', icon: Sparkle },
  { id: 'timeline' as Page, label: 'Timeline', icon: ClockCounterClockwise },
  { id: 'settings' as Page, label: 'Settings', icon: Gear },
]

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    db.init().then(() => setDbInitialized(true))
  }, [])

  if (!dbInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkle size={48} className="mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Initializing Wysh Lyst...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card/50 backdrop-blur-sm">
          <div className="p-8">
            <h1 className="text-3xl font-semibold tracking-tight text-primary">Wysh Lyst</h1>
            <p className="text-sm text-muted-foreground mt-1">Your Future, Organized</p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="p-4 bg-muted/30 rounded-xl space-y-2">
              <p className="text-xs text-muted-foreground">
                Local-first & privacy-focused
              </p>
              <p className="text-xs text-muted-foreground">
                All data stored on your device
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'wants' && <WantsPage />}
          {currentPage === 'vision' && <VisionPage />}
          {currentPage === 'plans' && <PlansPage />}
          {currentPage === 'ai' && <AiPage />}
          {currentPage === 'timeline' && <TimelinePage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex justify-around items-center h-16 px-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                <Icon size={22} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => setCurrentPage('settings')}
            className={`
              flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all
              ${currentPage === 'settings' ? 'text-primary' : 'text-muted-foreground'}
            `}
          >
            <Gear size={22} weight={currentPage === 'settings' ? 'fill' : 'regular'} />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
