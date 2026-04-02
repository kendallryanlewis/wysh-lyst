import { useState, useEffect } from 'react'
import { WantItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Heart,
  Link as LinkIcon,
  MagnifyingGlass,
  X,
  Plus,
  Check,
} from '@phosphor-icons/react'
import { WANT_CATEGORIES, WANT_STATUSES } from '@/lib/utils-wants'

interface ManageLinksDialogProps {
  want: WantItem | null
  allWants: WantItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (linkedItemIds: string[]) => void
}

export default function ManageLinksDialog({
  want,
  allWants,
  open,
  onOpenChange,
  onSave,
}: ManageLinksDialogProps) {
  const isMobile = useIsMobile()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  useEffect(() => {
    if (want && open) {
      setSelectedIds(want.linkedItemIds || [])
      setSearchQuery('')
    }
  }, [want, open])

  if (!want) return null

  const availableWants = allWants.filter(
    (w) => w.id !== want.id && !w.archived
  )

  const filteredWants = availableWants.filter((w) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      w.title.toLowerCase().includes(query) ||
      w.description?.toLowerCase().includes(query) ||
      w.category.toLowerCase().includes(query)
    )
  })

  const handleToggle = (wantId: string) => {
    setSelectedIds((prev) =>
      prev.includes(wantId)
        ? prev.filter((id) => id !== wantId)
        : [...prev, wantId]
    )
  }

  const handleSave = () => {
    onSave(selectedIds)
    onOpenChange(false)
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3">
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} linked
          </span>
          {selectedIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-7 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredWants.length === 0 ? (
            <div className="text-center py-8">
              <Heart size={48} className="mx-auto text-muted-foreground mb-3" weight="fill" />
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'No items found' : 'No other items available'}
              </p>
            </div>
          ) : (
            filteredWants.map((w) => {
              const isSelected = selectedIds.includes(w.id)
              const statusInfo = WANT_STATUSES.find((s) => s.value === w.status)
              const categoryInfo = WANT_CATEGORIES.find((c) => c.value === w.category)

              return (
                <button
                  key={w.id}
                  onClick={() => handleToggle(w.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded border transition-all text-left ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:bg-muted'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-10 h-10 rounded bg-primary flex items-center justify-center">
                        <Check size={20} className="text-primary-foreground" weight="bold" />
                      </div>
                    ) : w.imageUrl ? (
                      <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                        <img
                          src={w.imageUrl}
                          alt={w.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Heart size={18} className="text-muted-foreground" weight="fill" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{w.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {statusInfo && (
                        <Badge variant="outline" className={`${statusInfo.color} text-xs px-1.5 py-0`}>
                          {statusInfo.label}
                        </Badge>
                      )}
                      {categoryInfo && (
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {categoryInfo.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )

  const footer = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => onOpenChange(false)}
        className="flex-1"
      >
        Cancel
      </Button>
      <Button onClick={handleSave} className="flex-1">
        <LinkIcon size={18} className="mr-2" weight="bold" />
        Save Links
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Manage Linked Items</DrawerTitle>
          </DrawerHeader>
          {content}
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Manage Linked Items</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">{content}</div>
        <DialogFooter className="p-6 pt-0">{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
