import { useEffect, useState, useRef } from 'react'
import { db } from '@/lib/db'
import type { WantItem, WantCategory, WantStatus, Priority } from '@/types'
import { 
  Plus, MagnifyingGlass, Funnel, SquaresFour, ListBullets, 
  Heart, Target, Sparkle, DotsThree, PencilSimple, Trash, Copy, CheckCircle,
  Link as LinkIcon, Image as ImageIcon, MapPin, X, UploadSimple
} from '@phosphor-icons/react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { 
  generateId, 
  formatCurrency, 
  formatRelativeTime, 
  WANT_CATEGORIES, 
  WANT_STATUSES, 
  PRIORITIES,
  filterWants,
  sortWants
} from '@/lib/utils-wants'
import { handleImageUpload } from '@/lib/image-utils'
import WantDetailDialog from '@/components/WantDetailDialog'

export default function WantsPage() {
  const isMobile = useIsMobile()
  const [wants, setWants] = useState<WantItem[]>([])
  const [filteredWants, setFilteredWants] = useState<WantItem[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingWant, setEditingWant] = useState<WantItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<WantCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WantStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority' | 'cost'>('newest')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedWant, setSelectedWant] = useState<WantItem | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'goals' as WantCategory,
    status: 'dreaming' as WantStatus,
    priority: 'medium' as Priority,
    estimatedCost: '',
    targetDate: '',
    whyItMatters: '',
    imageUrl: '',
    address: '',
    links: [] as string[],
    linkInput: '',
  })

  useEffect(() => {
    loadWants()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [wants, searchQuery, categoryFilter, statusFilter, sortBy])

  const loadWants = async () => {
    try {
      const allWants = await db.getAllWants()
      setWants(allWants)
    } catch (error) {
      toast.error('Failed to load wants')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = filterWants(wants, {
      search: searchQuery,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      showArchived: false,
    })
    filtered = sortWants(filtered, sortBy)
    setFilteredWants(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'goals',
      status: 'dreaming',
      priority: 'medium',
      estimatedCost: '',
      targetDate: '',
      whyItMatters: '',
      imageUrl: '',
      address: '',
      links: [],
      linkInput: '',
    })
    setEditingWant(null)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    const want: WantItem = editingWant ? {
      ...editingWant,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      priority: formData.priority,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      targetDate: formData.targetDate || undefined,
      whyItMatters: formData.whyItMatters,
      imageUrl: formData.imageUrl || undefined,
      address: formData.address || undefined,
      links: formData.links.length > 0 ? formData.links : undefined,
      updatedAt: new Date().toISOString(),
    } : {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      priority: formData.priority,
      estimatedCost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : undefined,
      targetDate: formData.targetDate || undefined,
      whyItMatters: formData.whyItMatters,
      imageUrl: formData.imageUrl || undefined,
      address: formData.address || undefined,
      links: formData.links.length > 0 ? formData.links : undefined,
      tags: [],
      moodTags: [],
      progressPercent: 0,
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      await db.putWant(want)
      await loadWants()
      setShowAddDialog(false)
      resetForm()
      toast.success(editingWant ? 'Want updated' : 'Want added')
    } catch (error) {
      toast.error('Failed to save want')
    }
  }

  const handleEdit = (want: WantItem) => {
    setEditingWant(want)
    setFormData({
      title: want.title,
      description: want.description || '',
      category: want.category,
      status: want.status,
      priority: want.priority,
      estimatedCost: want.estimatedCost?.toString() || '',
      targetDate: want.targetDate || '',
      whyItMatters: want.whyItMatters || '',
      imageUrl: want.imageUrl || '',
      address: want.address || '',
      links: want.links || [],
      linkInput: '',
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this want?')) return
    
    try {
      await db.deleteWant(id)
      await loadWants()
      toast.success('Want deleted')
    } catch (error) {
      toast.error('Failed to delete want')
    }
  }

  const handleDuplicate = async (want: WantItem) => {
    const duplicate: WantItem = {
      ...want,
      id: generateId(),
      title: `${want.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      await db.putWant(duplicate)
      await loadWants()
      toast.success('Want duplicated')
    } catch (error) {
      toast.error('Failed to duplicate want')
    }
  }

  const handleMarkComplete = async (want: WantItem) => {
    const updated: WantItem = {
      ...want,
      status: 'completed',
      progressPercent: 100,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    try {
      await db.putWant(updated)
      await loadWants()
      toast.success('Want marked as completed!')
    } catch (error) {
      toast.error('Failed to update want')
    }
  }

  const getStatusColor = (status: WantStatus) => {
    return WANT_STATUSES.find(s => s.value === status)?.color || 'text-gray-400'
  }

  const getPriorityColor = (priority: Priority) => {
    return PRIORITIES.find(p => p.value === priority)?.color || 'text-gray-400'
  }

  const handleAddLink = () => {
    const trimmedLink = formData.linkInput.trim()
    if (trimmedLink && !formData.links.includes(trimmedLink)) {
      setFormData({ ...formData, links: [...formData.links, trimmedLink], linkInput: '' })
    }
  }

  const handleRemoveLink = (index: number) => {
    setFormData({ ...formData, links: formData.links.filter((_, i) => i !== index) })
  }

  const handleLinkInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddLink()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await handleImageUpload(file)
      if (result.success && result.data) {
        setFormData({ ...formData, imageUrl: result.data })
        toast.success('Image uploaded successfully')
      } else {
        toast.error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to process image')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' })
  }

  const handleWantClick = (want: WantItem) => {
    setSelectedWant(want)
    setShowDetailDialog(true)
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="h-9 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-52 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl pb-20 md:pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-0.5">Wants</h1>
          <p className="text-sm text-muted-foreground">
            {filteredWants.length} {filteredWants.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true) }} size="sm" className="bg-primary text-primary-foreground">
          <Plus size={18} className="mr-1.5" weight="bold" />
          Add Want
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search wants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border h-9 text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as WantCategory | 'all')}>
            <SelectTrigger className="w-36 bg-card h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {WANT_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as WantStatus | 'all')}>
            <SelectTrigger className="w-32 bg-card h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {WANT_STATUSES.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-28 bg-card h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-card rounded border border-border p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('grid')}
              className={`h-8 px-2 ${view === 'grid' ? 'bg-muted' : ''}`}
            >
              <SquaresFour size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('list')}
              className={`h-8 px-2 ${view === 'list' ? 'bg-muted' : ''}`}
            >
              <ListBullets size={18} />
            </Button>
          </div>
        </div>
      </div>

      {filteredWants.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Heart size={24} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">No wants found</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Start by adding something you desire'}
              </p>
              {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => { resetForm(); setShowAddDialog(true) }} size="sm" className="bg-primary text-primary-foreground">
                  <Plus size={18} className="mr-1.5" weight="bold" />
                  Add Your First Want
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredWants.map((want) => (
            <Card key={want.id} className="p-4 hover:bg-muted/30 transition-all group relative cursor-pointer" onClick={() => handleWantClick(want)}>
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5 truncate">{want.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {want.description || 'No description'}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                        <DotsThree size={18} weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(want)}>
                        <PencilSimple size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(want)}>
                        <Copy size={14} className="mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {want.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleMarkComplete(want)}>
                          <CheckCircle size={14} className="mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(want.id)} className="text-destructive">
                        <Trash size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  <span className={`px-2 py-0.5 rounded bg-muted ${getStatusColor(want.status)}`}>
                    {WANT_STATUSES.find(s => s.value === want.status)?.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded bg-muted ${getPriorityColor(want.priority)}`}>
                    {PRIORITIES.find(p => p.value === want.priority)?.label}
                  </span>
                </div>

                {want.estimatedCost && (
                  <p className="text-primary font-semibold text-sm">
                    {formatCurrency(want.estimatedCost)}
                  </p>
                )}

                {(want.imageUrl || want.address || (want.links && want.links.length > 0)) && (
                  <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    {want.imageUrl && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded">
                        <ImageIcon size={10} />
                        <span>Image</span>
                      </div>
                    )}
                    {want.address && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded">
                        <MapPin size={10} />
                        <span>Address</span>
                      </div>
                    )}
                    {want.links && want.links.length > 0 && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-muted rounded">
                        <LinkIcon size={10} />
                        <span>{want.links.length} link{want.links.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="capitalize">{want.category.replace('_', ' ')}</span>
                  <span>{formatRelativeTime(want.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredWants.map((want) => (
            <Card key={want.id} className="p-4 hover:bg-muted/30 transition-all group cursor-pointer" onClick={() => handleWantClick(want)}>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold truncate">{want.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(want.status)} bg-muted`}>
                      {WANT_STATUSES.find(s => s.value === want.status)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {want.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground capitalize">
                      {want.category.replace('_', ' ')}
                    </p>
                    {want.estimatedCost && (
                      <p className="text-primary font-semibold">
                        {formatCurrency(want.estimatedCost)}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        <DotsThree size={20} weight="bold" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(want)}>
                        <PencilSimple size={16} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(want)}>
                        <Copy size={16} className="mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {want.status !== 'completed' && (
                        <DropdownMenuItem onClick={() => handleMarkComplete(want)}>
                          <CheckCircle size={16} className="mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(want.id)} className="text-destructive">
                        <Trash size={16} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isMobile ? (
        <Drawer open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) resetForm()
        }}>
          <DrawerContent className="max-h-[95vh]">
            <DrawerHeader>
              <DrawerTitle>{editingWant ? 'Edit Want' : 'Add New Want'}</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4 pb-4 overflow-y-auto flex-1">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What do you want?"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your want in detail..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as WantCategory })}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WANT_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as WantStatus })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WANT_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cost">Estimated Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="why">Why It Matters</Label>
              <Textarea
                id="why"
                value={formData.whyItMatters}
                onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
                placeholder="Why is this important to you?"
                rows={2}
              />
            </div>
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <ImageIcon size={16} />
                Image
              </Label>
              {formData.imageUrl ? (
                <div className="space-y-2">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border border-border">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Or paste image URL..."
                    className="text-sm"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex-1"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <UploadSimple size={16} className="mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Paste image URL..."
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin size={16} />
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street, City, State, ZIP"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <LinkIcon size={16} />
                Links
              </Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={formData.linkInput}
                    onChange={(e) => setFormData({ ...formData, linkInput: e.target.value })}
                    onKeyPress={handleLinkInputKeyPress}
                    placeholder="https://example.com"
                    type="url"
                  />
                  <Button
                    type="button"
                    onClick={handleAddLink}
                    variant="outline"
                    size="sm"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {formData.links.length > 0 && (
                  <div className="space-y-1">
                    {formData.links.map((link, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded"
                      >
                        <LinkIcon size={14} className="text-muted-foreground" />
                        <span className="flex-1 truncate">{link}</span>
                        <Button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>
            <DrawerFooter>
              <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
                {editingWant ? 'Update' : 'Add'} Want
              </Button>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm() }}>
                Cancel
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open)
          if (!open) resetForm()
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingWant ? 'Edit Want' : 'Add New Want'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Same form content as drawer */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What do you want?"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your want in detail..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as WantCategory })}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WANT_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as WantStatus })}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WANT_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cost">Estimated Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="why">Why It Matters</Label>
                <Textarea
                  id="why"
                  value={formData.whyItMatters}
                  onChange={(e) => setFormData({ ...formData, whyItMatters: e.target.value })}
                  placeholder="Why is this important to you?"
                  rows={2}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <ImageIcon size={16} />
                  Image
                </Label>
                {formData.imageUrl ? (
                  <div className="space-y-2">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border border-border">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2"
                      >
                        <X size={16} />
                      </Button>
                    </div>
                    <Input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Or paste image URL..."
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="flex-1"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <UploadSimple size={16} className="mr-2" />
                            Upload Image
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Paste image URL..."
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin size={16} />
                  Address
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <LinkIcon size={16} />
                  Links
                </Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={formData.linkInput}
                      onChange={(e) => setFormData({ ...formData, linkInput: e.target.value })}
                      onKeyPress={handleLinkInputKeyPress}
                      placeholder="https://example.com"
                      type="url"
                    />
                    <Button
                      type="button"
                      onClick={handleAddLink}
                      variant="outline"
                      size="sm"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  {formData.links.length > 0 && (
                    <div className="space-y-1">
                      {formData.links.map((link, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-sm bg-muted px-3 py-2 rounded"
                        >
                          <LinkIcon size={14} className="text-muted-foreground" />
                          <span className="flex-1 truncate">{link}</span>
                          <Button
                            type="button"
                            onClick={() => handleRemoveLink(index)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm() }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
                {editingWant ? 'Update' : 'Add'} Want
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <WantDetailDialog
        want={selectedWant}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  )
}
      <WantDetailDialog
        want={selectedWant}
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
      />
    </div>
  )
}
