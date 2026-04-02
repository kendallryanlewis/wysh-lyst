import { useState } from 'react'
import { Sparkle, PaperPlaneRight, Copy, Robot } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'd be happy to help you with that! However, to provide AI-powered insights, you'll need to connect an AI provider in Settings.\n\nOnce connected, I can help you with:\n\n• Creating detailed action plans\n• Prioritizing your wants and goals\n• Estimating realistic timelines\n• Budget planning and cost analysis\n• Clarifying your goals and motivations\n• Breaking down complex wants into steps\n\nGo to Settings → AI Connections to get started!`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleTemplateClick = (template: typeof PROMPT_TEMPLATES[0]) => {
    setInput(template.prompt)
  }

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard')
  }

  return (
    <div className="h-[calc(100vh-4rem)] md:h-screen flex flex-col p-6 md:p-12 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-4xl font-semibold mb-2">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get intelligent insights and recommendations for your wants and goals
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 pb-24 md:pb-0">
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
                  To unlock AI-powered features, connect OpenAI, Anthropic, or Gemini in Settings. 
                  Your conversations will be powered by cutting-edge AI models to help you achieve your goals.
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pb-32 md:pb-24">
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
                    onClick={() => handleCopy(message.content)}
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
          {isLoading && (
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

      <div className="fixed bottom-0 left-0 right-0 md:relative bg-background border-t md:border-t-0 border-border p-4 md:p-0 md:pt-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask me anything about your wants and goals..."
              className="flex-1 min-h-[60px] max-h-[200px] bg-card resize-none"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
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
    </div>
  )
}
