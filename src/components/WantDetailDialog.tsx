import { WantItem } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Heart,
  MapPin,
  Link as LinkIcon,
  CalendarBlank,
  CurrencyDollar,
  Tag,
  Clock,
  Sparkle,
  CheckCircle,
  Target,
  X
} from '@phosphor-icons/react'
import { formatCurrency, formatRelativeTime, WANT_CATEGORIES, WANT_STATUSES, PRIORITIES } from '@/lib/utils-wants'

interface WantDetailDialogProps {
  want: WantItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WantDetailDialog({ want, open, onOpenChange }: WantDetailDialogProps) {
  if (!want) return null

  const statusInfo = WANT_STATUSES.find(s => s.value === want.status)
  const priorityInfo = PRIORITIES.find(p => p.value === want.priority)
  const categoryInfo = WANT_CATEGORIES.find(c => c.value === want.category)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative">
            {want.imageUrl && (
              <div className="relative w-full h-64 bg-muted">
                <img
                  src={want.imageUrl}
                  alt={want.title}
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                >
                  <X size={20} />
                </Button>
              </div>
            )}
            
            <div className="p-8 space-y-6">
              {!want.imageUrl && (
                <div className="flex items-start justify-between">
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                  >
                    <X size={20} />
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart size={24} className="text-primary" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-semibold mb-2">{want.title}</h2>
                    <div className="flex flex-wrap gap-2">
                      {statusInfo && (
                        <Badge variant="outline" className={`${statusInfo.color} bg-muted border-none`}>
                          {statusInfo.label}
                        </Badge>
                      )}
                      {priorityInfo && (
                        <Badge variant="outline" className={`${priorityInfo.color} bg-muted border-none`}>
                          {priorityInfo.label} Priority
                        </Badge>
                      )}
                      {categoryInfo && (
                        <Badge variant="outline" className="bg-muted border-none">
                          {categoryInfo.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {want.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Description</h3>
                    <p className="text-foreground leading-relaxed">{want.description}</p>
                  </div>
                )}

                {want.whyItMatters && (
                  <div className="space-y-2 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 text-accent">
                      <Sparkle size={18} weight="fill" />
                      <h3 className="text-sm font-semibold uppercase tracking-wide">Why It Matters</h3>
                    </div>
                    <p className="text-foreground leading-relaxed">{want.whyItMatters}</p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {want.estimatedCost !== undefined && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                        <CurrencyDollar size={20} className="text-primary" weight="bold" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
                        <p className="text-xl font-semibold text-primary">{formatCurrency(want.estimatedCost)}</p>
                      </div>
                    </div>
                  )}

                  {want.targetDate && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <CalendarBlank size={20} className="text-secondary" weight="bold" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Target Date</p>
                        <p className="text-lg font-medium">
                          {new Date(want.targetDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Clock size={20} className="text-muted-foreground" weight="bold" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created</p>
                      <p className="text-lg font-medium">{formatRelativeTime(want.createdAt)}</p>
                    </div>
                  </div>

                  {want.progressPercent > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Target size={20} className="text-accent" weight="bold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Progress</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${want.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{want.progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {want.completedAt && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-500" weight="fill" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Completed</p>
                        <p className="text-lg font-medium">
                          {new Date(want.completedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {want.address && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={18} weight="bold" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Location</h3>
                      </div>
                      <p className="text-foreground pl-7">{want.address}</p>
                    </div>
                  </>
                )}

                {want.links && want.links.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LinkIcon size={18} weight="bold" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Links</h3>
                      </div>
                      <div className="space-y-2 pl-7">
                        {want.links.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                          >
                            <LinkIcon size={14} className="flex-shrink-0" />
                            <span className="truncate group-hover:underline text-sm">{link}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {want.tags && want.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag size={18} weight="bold" />
                        <h3 className="text-sm font-semibold uppercase tracking-wide">Tags</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 pl-7">
                        {want.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {want.moodTags && want.moodTags.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkle size={18} weight="fill" />
                      <h3 className="text-sm font-semibold uppercase tracking-wide">Mood Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-7">
                      {want.moodTags.map((mood, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {mood}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
