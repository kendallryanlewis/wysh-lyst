import { WantItem } from '@/types'
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
  X,
  Note,
  Package
} from '@phosphor-icons/react'
import { formatCurrency, formatRelativeTime, WANT_CATEGORIES, WANT_STATUSES, PRIORITIES } from '@/lib/utils-wants'

interface WantDetailDialogProps {
  want: WantItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WantDetailDialog({ want, open, onOpenChange }: WantDetailDialogProps) {
  if (!want || !open) return null

  const statusInfo = WANT_STATUSES.find(s => s.value === want.status)
  const priorityInfo = PRIORITIES.find(p => p.value === want.priority)
  const categoryInfo = WANT_CATEGORIES.find(c => c.value === want.category)

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      <ScrollArea className="h-screen">
        <div className="relative">
          {want.imageUrl && (
            <div className="relative w-full h-[40vh] min-h-[300px] bg-muted">
              <img
                src={want.imageUrl}
                alt={want.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/40" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 bg-background/90 hover:bg-background w-9 h-9 rounded"
              >
                <X size={20} weight="bold" />
              </Button>
            </div>
          )}
          
          <div className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
            {!want.imageUrl && (
              <div className="flex items-center justify-end pt-4 pb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="w-9 h-9 rounded"
                >
                  <X size={20} weight="bold" />
                </Button>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                    <Heart size={24} className="text-primary" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">{want.title}</h1>
                    <div className="flex flex-wrap gap-1.5">
                      {statusInfo && (
                        <Badge variant="outline" className={`${statusInfo.color} bg-muted border-none px-2 py-0.5 text-xs`}>
                          {statusInfo.label}
                        </Badge>
                      )}
                      {priorityInfo && (
                        <Badge variant="outline" className={`${priorityInfo.color} bg-muted border-none px-2 py-0.5 text-xs`}>
                          {priorityInfo.label} Priority
                        </Badge>
                      )}
                      {categoryInfo && (
                        <Badge variant="outline" className="bg-muted border-none px-2 py-0.5 text-xs">
                          <Package size={12} className="mr-1" weight="bold" />
                          {categoryInfo.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {want.description && (
                  <div className="space-y-2 bg-card p-4 rounded border border-border">
                    <div className="flex items-center gap-2">
                      <Note size={18} weight="bold" className="text-muted-foreground" />
                      <h2 className="text-sm font-semibold">Description</h2>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-sm">{want.description}</p>
                  </div>
                )}

                {want.whyItMatters && (
                  <div className="space-y-2 p-4 rounded bg-accent/10 border border-accent/30">
                    <div className="flex items-center gap-2 text-accent">
                      <Sparkle size={18} weight="fill" />
                      <h2 className="text-sm font-semibold">Why It Matters</h2>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-sm">{want.whyItMatters}</p>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {want.estimatedCost !== undefined && (
                  <div className="space-y-2 p-3 rounded bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center">
                        <CurrencyDollar size={20} className="text-primary" weight="bold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Estimated Cost</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(want.estimatedCost)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {want.targetDate && (
                  <div className="space-y-2 p-3 rounded bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-secondary/10 flex items-center justify-center">
                        <CalendarBlank size={20} className="text-secondary" weight="bold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Target Date</p>
                        <p className="text-sm font-semibold">
                          {new Date(want.targetDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 p-3 rounded bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded bg-muted flex items-center justify-center">
                      <Clock size={20} className="text-muted-foreground" weight="bold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                      <p className="text-sm font-semibold">{formatRelativeTime(want.createdAt)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(want.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {want.progressPercent > 0 && (
                  <div className="space-y-2 p-3 rounded bg-card border border-border md:col-span-2 lg:col-span-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-accent/10 flex items-center justify-center">
                        <Target size={20} className="text-accent" weight="bold" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground mb-2">Progress</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${want.progressPercent}%` }}
                            />
                          </div>
                          <span className="text-base font-bold text-accent">{want.progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {want.completedAt && (
                  <div className="space-y-2 p-3 rounded bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={20} className="text-green-500" weight="fill" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-0.5 font-semibold">Completed</p>
                        <p className="text-sm font-semibold">
                          {new Date(want.completedAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {want.address && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2 p-4 rounded bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center">
                        <MapPin size={20} weight="bold" className="text-primary" />
                      </div>
                      <h2 className="text-base font-semibold">Location</h2>
                    </div>
                    <p className="text-foreground/90 text-sm pl-11">{want.address}</p>
                    {want.locationLabel && (
                      <p className="text-xs text-muted-foreground pl-11">
                        Label: {want.locationLabel}
                      </p>
                    )}
                  </div>
                </>
              )}

              {want.sourceLink && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2 p-4 rounded bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded bg-primary/10 flex items-center justify-center">
                        <LinkIcon size={20} weight="bold" className="text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Source Link</h2>
                    </div>
                    <a
                      href={want.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group pl-[60px]"
                    >
                      <LinkIcon size={18} className="flex-shrink-0" />
                      <span className="truncate group-hover:underline text-lg">{want.sourceLink}</span>
                    </a>
                  </div>
                </>
              )}

              {want.links && want.links.length > 0 && (
                <>
                  <Separator className="my-8" />
                  <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <LinkIcon size={24} weight="bold" className="text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Related Links</h2>
                    </div>
                    <div className="space-y-3 pl-[60px]">
                      {want.links.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors group p-3 rounded-lg hover:bg-muted"
                        >
                          <LinkIcon size={18} className="flex-shrink-0" />
                          <span className="truncate group-hover:underline text-base">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {want.notes && (
                <>
                  <Separator className="my-8" />
                  <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Note size={24} weight="bold" className="text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold">Notes</h2>
                    </div>
                    <p className="text-foreground/90 leading-relaxed text-base pl-[60px] whitespace-pre-wrap">{want.notes}</p>
                  </div>
                </>
              )}

              {want.subcategory && (
                <>
                  <Separator className="my-8" />
                  <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Package size={24} weight="bold" className="text-muted-foreground" />
                      </div>
                      <h2 className="text-xl font-semibold">Subcategory</h2>
                    </div>
                    <p className="text-foreground/90 text-lg pl-[60px]">{want.subcategory}</p>
                  </div>
                </>
              )}

              {want.tags && want.tags.length > 0 && (
                <>
                  <Separator className="my-8" />
                  <div className="space-y-4 p-6 rounded-2xl bg-card border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Tag size={24} weight="bold" className="text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold">Tags</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 pl-[60px]">
                      {want.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {want.moodTags && want.moodTags.length > 0 && (
                <div className="space-y-4 p-6 rounded-2xl bg-accent/10 border border-accent/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Sparkle size={24} weight="fill" className="text-accent" />
                    </div>
                    <h2 className="text-xl font-semibold">Mood Tags</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-[60px]">
                    {want.moodTags.map((mood, index) => (
                      <Badge key={index} variant="outline" className="text-sm px-3 py-1.5 border-accent/30">
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(want.isPinned || want.archived) && (
                <>
                  <Separator className="my-8" />
                  <div className="flex flex-wrap gap-4 p-6 rounded-2xl bg-muted/30 border border-border">
                    {want.isPinned && (
                      <Badge variant="outline" className="text-sm px-3 py-1.5">
                        📌 Pinned
                      </Badge>
                    )}
                    {want.archived && (
                      <Badge variant="outline" className="text-sm px-3 py-1.5 border-muted-foreground/30">
                        📦 Archived
                      </Badge>
                    )}
                  </div>
                </>
              )}

              <Separator className="my-8" />

              <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">ID:</span> {want.id}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(want.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
