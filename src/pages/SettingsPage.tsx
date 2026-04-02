import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import type { AiConnection, AppSettings } from '@/types'
import { 
  Palette, Database, Robot, Download, Upload, 
  Trash, Warning, CheckCircle, X, Sparkle, PaperPlaneRight, Copy
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const PROMPT_TEMPLATES = [
  {
    id: '1',
    title: 'Turn want into action plan',
    description: 'Break down a want into actionable steps',
    prompt: 'Help me create a detailed action plan to achieve this goal: ',
  },
  {
    id: '2',
    title: 'Prioritize items',
    description: 'Get help deciding what to focus on',
    prompt: 'Help me prioritize these items based on impact and feasibility: ',
  },
  {
    id: '3',
    title: 'Estimate timeline',
    description: 'Get realistic time estimates',
    prompt: 'Help me estimate a realistic timeline for achieving this: ',
  },
  {
    id: '4',
    title: 'Budget planning',
    description: 'Create a savings plan',
    prompt: 'Help me create a budget and savings plan for: ',
  },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [aiConnections, setAiConnections] = useState<AiConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoadingAi, setIsLoadingAi] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const [settingsData, connections] = await Promise.all([
        db.getSettings(),
        db.getAllAiConnections()
      ])
      
      setSettings(settingsData || {
        theme: 'dark',
        accentColor: 'gold',
        defaultView: 'grid',
        passphraseTimeout: 15,
        autoLockEnabled: true,
        onboardingCompleted: true,
        analytics: false,
      })
      setAiConnections(connections)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings) return
    
    const updated = { ...settings, ...updates }
    try {
      await db.putSettings(updated)
      setSettings(updated)
      toast.success('Settings updated')
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  const handleExportData = async () => {
    try {
      const [wants, plans, timeline, insights] = await Promise.all([
        db.getAllWants(),
        db.getAllPlans(),
        db.getAllTimeline(),
        db.getAllInsights(),
      ])

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        wants,
        plans,
        timeline,
        insights,
        settings,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wysh-lyst-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.wants || !Array.isArray(data.wants)) {
        throw new Error('Invalid data format')
      }

      for (const want of data.wants) {
        await db.putWant(want)
      }
      if (data.plans) {
        for (const plan of data.plans) {
          await db.putPlan(plan)
        }
      }
      if (data.timeline) {
        for (const entry of data.timeline) {
          await db.putTimelineEntry(entry)
        }
      }

      toast.success('Data imported successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to import data - invalid file format')
    }
  }

  const handleClearAllData = async () => {
    if (!confirm('Are you absolutely sure? This will permanently delete ALL your data including wants, plans, and timeline. This action cannot be undone.')) {
      return
    }

    if (!confirm('Last chance! Type "DELETE" in your mind and click OK to proceed.')) {
      return
    }

    try {
      await db.clearAllData()
      toast.success('All data cleared')
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error('Failed to clear data')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoadingAi(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'd be happy to help you with that! However, to provide AI-powered insights, you'll need to connect an AI provider in the AI Connections tab.\n\nOnce connected, I can help you with:\n\n• Creating detailed action plans\n• Prioritizing your wants and goals\n• Estimating realistic timelines\n• Budget planning and cost analysis\n• Clarifying your goals and motivations\n• Breaking down complex wants into steps\n\nSwitch to the AI Connections tab to get started!`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoadingAi(false)
    }, 1000)
  }

  const handleTemplateClick = (template: typeof PROMPT_TEMPLATES[0]) => {
    setInput(template.prompt)
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  if (loading || !settings) {
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
        <h1 className="text-4xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and application data
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
          <TabsTrigger value="ai">AI Setup</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette size={24} className="text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize the look and feel</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Default View</Label>
                  <p className="text-sm text-muted-foreground">Choose grid or list view for wants</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={settings.defaultView === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ defaultView: 'grid' })}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={settings.defaultView === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ defaultView: 'list' })}
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database size={24} className="text-accent" />
              <div>
                <h3 className="text-lg font-semibold">Privacy</h3>
                <p className="text-sm text-muted-foreground">Local-first data storage</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Auto-lock encrypted keys</Label>
                  <p className="text-sm text-muted-foreground">
                    Lock encrypted API keys after {settings.passphraseTimeout} minutes of inactivity
                  </p>
                </div>
                <Switch
                  checked={settings.autoLockEnabled}
                  onCheckedChange={(checked) => updateSettings({ autoLockEnabled: checked })}
                />
              </div>
              <Separator />
              <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Your data is private</p>
                    <p className="text-muted-foreground">
                      All your wants, plans, and timeline are stored locally in your browser using IndexedDB. 
                      Nothing is sent to external servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assistant" className="space-y-6">
          <div className="h-[calc(100vh-16rem)] flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                <div className="text-center space-y-4 max-w-2xl">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Sparkle size={40} className="text-primary" weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Your AI Planning Partner</h2>
                    <p className="text-muted-foreground">
                      Ask me anything about your wants, goals, and plans. I can help you break down complex goals, 
                      prioritize what matters, and create actionable steps.
                    </p>
                  </div>
                </div>

                <div className="w-full max-w-3xl">
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">Try these prompts:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PROMPT_TEMPLATES.map((template) => (
                      <Card 
                        key={template.id} 
                        className="p-4 hover:bg-muted/50 transition-all cursor-pointer group"
                        onClick={() => handleTemplateClick(template)}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkle size={20} className="text-accent mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">
                              {template.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card className="w-full max-w-3xl p-6 bg-accent/5 border-accent/20">
                  <div className="flex items-start gap-4">
                    <Robot size={24} className="text-accent flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold">Connect an AI Provider</h3>
                      <p className="text-sm text-muted-foreground">
                        To unlock AI-powered features, connect OpenAI, Anthropic, or Gemini in the AI Setup tab. 
                        Your conversations will be powered by cutting-edge AI models to help you achieve your goals.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pb-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <Sparkle size={20} className="text-primary" weight="fill" />
                      </div>
                    )}
                    <Card
                      className={`p-4 max-w-2xl ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyMessage(message.content)}
                          className="mt-3 h-8 text-xs"
                        >
                          <Copy size={14} className="mr-1" />
                          Copy
                        </Button>
                      )}
                    </Card>
                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoadingAi && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Sparkle size={20} className="text-primary animate-pulse" weight="fill" />
                    </div>
                    <Card className="p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            )}

            <div className="pt-6 border-t">
              <div className="flex gap-3">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask me anything about your wants and goals..."
                  className="flex-1 min-h-[60px] max-h-[200px] bg-card resize-none"
                  rows={2}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoadingAi}
                  className="bg-primary text-primary-foreground px-6"
                  size="lg"
                >
                  <PaperPlaneRight size={20} weight="fill" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Robot size={24} className="text-accent" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">AI Connections</h3>
                <p className="text-sm text-muted-foreground">Connect AI providers for intelligent insights</p>
              </div>
            </div>

            {aiConnections.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-muted-foreground">No AI connections configured yet</p>
                <p className="text-sm text-muted-foreground">
                  Connect OpenAI, Anthropic, or Gemini to unlock AI-powered features
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {aiConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{connection.provider.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">{connection.model}</p>
                      {connection.maskedKeyPreview && (
                        <p className="text-xs text-muted-foreground mt-1">{connection.maskedKeyPreview}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {connection.isDefault && (
                        <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">Default</span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${
                        connection.storageMode === 'session' 
                          ? 'bg-amber-500/20 text-amber-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {connection.storageMode === 'session' ? 'Session' : 'Encrypted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Warning size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-amber-400">Security Notice</p>
                  <p className="text-muted-foreground">
                    This app stores AI keys locally. Session-only storage is recommended for maximum security. 
                    Encrypted device storage uses your passphrase but is still less secure than server-side architecture.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database size={24} className="text-accent" />
              <div>
                <h3 className="text-lg font-semibold">Data Management</h3>
                <p className="text-sm text-muted-foreground">Import, export, and manage your data</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Export Data</Label>
                  <p className="text-sm text-muted-foreground">Download all your wants, plans, and timeline as JSON</p>
                </div>
                <Button onClick={handleExportData} variant="outline">
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label>Import Data</Label>
                  <p className="text-sm text-muted-foreground">Restore data from a previous export</p>
                </div>
                <Button variant="outline" asChild>
                  <label htmlFor="import-file" className="cursor-pointer">
                    <Upload size={16} className="mr-2" />
                    Import
                    <input
                      id="import-file"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportData}
                    />
                  </label>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-destructive/50 bg-destructive/5">
            <div className="flex items-center gap-3 mb-6">
              <Warning size={24} className="text-destructive" />
              <div>
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Irreversible actions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-destructive">Clear All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all wants, plans, timeline entries, and settings. This cannot be undone.
                  </p>
                </div>
                <Button onClick={handleClearAllData} variant="destructive">
                  <Trash size={16} className="mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
