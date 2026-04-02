import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { House, Heart, ListChecks, Sparkle, ClockCounterClockwise, Gear } from '@phosphor-icons/react'
import HomePage from '@/pages/HomePage'
import WantsPage from '@/pages/WantsPage'
import PlansPage from '@/pages/PlansPage'
import AiPage from '@/pages/AiPage'
import TimelinePage from '@/pages/TimelinePage'
import SettingsPage from '@/pages/SettingsPage'

type Page = 'home' | 'wants' | 'plans' | 'ai' | 'timeline' | 'settings'

const NAV_ITEMS = [
  { id: 'home' as Page, label: 'Home', icon: House },
  { id: 'wants' as Page, label: 'Wants', icon: Heart },
  { id: 'plans' as Page, label: 'Plans', icon: ListChecks },
  { id: 'ai' as Page, label: 'AI', icon: Sparkle },
  { id: 'timeline' as Page, label: 'Timeline', icon: ClockCounterClockwise },
  { id: 'settings' as Page, label: 'Settings', icon: Gear },
]

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [dbInitialized, setDbInitialized] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    db
      .init()
      .then(() => setDbInitialized(true))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown initialization error'
        setInitError(message)
      })
  }, [])

  if (initError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-xl rounded-lg border border-destructive/40 bg-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-destructive">App failed to initialize</h2>
          <p className="text-sm text-muted-foreground">
            Wysh Lyst could not start local storage in this browser context.
          </p>
          <pre className="text-xs bg-muted/50 border rounded p-3 overflow-auto">{initError}</pre>
        </div>
      </div>
    )
  }

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
        <aside className="hidden md:flex w-56 flex-col border-r border-border bg-card">
          <div className="p-5 border-b border-border">
            <h1 className="text-2xl font-semibold tracking-tight text-primary">Wysh Lyst</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your Future, Organized</p>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`
                    w-full flex items-center gap-2.5 px-3 py-2 rounded transition-all text-sm
                    ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-3 border-t border-border">
            <div className="p-3 bg-muted/30 rounded space-y-1">
              <p className="text-xs text-muted-foreground leading-tight">
                Local-first & privacy-focused
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                All data stored on your device
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {currentPage === 'home' && <HomePage onNavigate={setCurrentPage} />}
          {currentPage === 'wants' && <WantsPage />}
          {currentPage === 'plans' && <PlansPage />}
          {currentPage === 'ai' && <AiPage />}
          {currentPage === 'timeline' && <TimelinePage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex justify-around items-center h-14 px-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`
                  flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded transition-all
                  ${isActive ? 'text-primary' : 'text-muted-foreground'}
                `}
              >
                <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => setCurrentPage('settings')}
            className={`
              flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded transition-all
              ${currentPage === 'settings' ? 'text-primary' : 'text-muted-foreground'}
            `}
          >
            <Gear size={20} weight={currentPage === 'settings' ? 'fill' : 'regular'} />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default App
