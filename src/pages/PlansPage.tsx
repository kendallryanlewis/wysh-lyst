import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import type { Plan, PlanStep, PlanMilestone, WantItem } from '@/types'
import { 
  Plus, Target, CheckCircle, Circle, Clock, Trash, 
  PencilSimple, DotsThree, Sparkle
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { generateId, formatCurrency, formatDate } from '@/lib/utils-wants'

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [wants, setWants] = useState<WantItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    wantId: '',
    targetDate: '',
    budgetEstimate: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [allPlans, allWants] = await Promise.all([
        db.getAllPlans(),
        db.getAllWants()
      ])
      setPlans(allPlans.filter(p => p.status !== 'cancelled'))
      setWants(allWants.filter(w => !w.archived))
    } catch (error) {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      wantId: '',
      targetDate: '',
      budgetEstimate: '',
    })
    setEditingPlan(null)
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    const plan: Plan = editingPlan ? {
      ...editingPlan,
      title: formData.title,
      description: formData.description,
      wantId: formData.wantId || undefined,
      targetDate: formData.targetDate || undefined,
      budgetEstimate: formData.budgetEstimate ? parseFloat(formData.budgetEstimate) : undefined,
      updatedAt: new Date().toISOString(),
    } : {
      id: generateId(),
      title: formData.title,
      description: formData.description,
      wantId: formData.wantId || undefined,
      targetDate: formData.targetDate || undefined,
      budgetEstimate: formData.budgetEstimate ? parseFloat(formData.budgetEstimate) : undefined,
      milestones: [],
      status: 'active',
      progressPercent: 0,
      aiGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      await db.putPlan(plan)
      await loadData()
      setShowAddDialog(false)
      resetForm()
      toast.success(editingPlan ? 'Plan updated' : 'Plan created')
    } catch (error) {
      toast.error('Failed to save plan')
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      title: plan.title,
      description: plan.description || '',
      wantId: plan.wantId || '',
      targetDate: plan.targetDate || '',
      budgetEstimate: plan.budgetEstimate?.toString() || '',
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return
    
    try {
      await db.deletePlan(id)
      await loadData()
      toast.success('Plan deleted')
    } catch (error) {
      toast.error('Failed to delete plan')
    }
  }

  const handleAddMilestone = async (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const newMilestone: PlanMilestone = {
      id: generateId(),
      title: 'New Milestone',
      completed: false,
      steps: [],
    }

    const updated: Plan = {
      ...plan,
      milestones: [...plan.milestones, newMilestone],
      updatedAt: new Date().toISOString(),
    }

    try {
      await db.putPlan(updated)
      await loadData()
    } catch (error) {
      toast.error('Failed to add milestone')
    }
  }

  const handleToggleMilestone = async (planId: string, milestoneId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const milestone = plan.milestones.find(m => m.id === milestoneId)
    if (!milestone) return

    const updatedMilestones = plan.milestones.map(m =>
      m.id === milestoneId
        ? { 
            ...m, 
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString() : undefined
          }
        : m
    )

    const completedMilestones = updatedMilestones.filter(m => m.completed).length
    const progressPercent = Math.round((completedMilestones / updatedMilestones.length) * 100)

    const updated: Plan = {
      ...plan,
      milestones: updatedMilestones,
      progressPercent,
      updatedAt: new Date().toISOString(),
    }

    try {
      await db.putPlan(updated)
      await loadData()
      if (!milestone.completed) {
        toast.success('Milestone completed! 🎉')
      }
    } catch (error) {
      toast.error('Failed to update milestone')
    }
  }

  const handleAddStep = async (planId: string, milestoneId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const milestone = plan.milestones.find(m => m.id === milestoneId)
    if (!milestone) return

    const newStep: PlanStep = {
      id: generateId(),
      title: 'New step',
      completed: false,
      order: milestone.steps.length,
    }

    const updatedMilestones = plan.milestones.map(m =>
      m.id === milestoneId
        ? { ...m, steps: [...m.steps, newStep] }
        : m
    )

    const updated: Plan = {
      ...plan,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    }

    try {
      await db.putPlan(updated)
      await loadData()
    } catch (error) {
      toast.error('Failed to add step')
    }
  }

  const handleToggleStep = async (planId: string, milestoneId: string, stepId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (!plan) return

    const updatedMilestones = plan.milestones.map(m =>
      m.id === milestoneId
        ? {
            ...m,
            steps: m.steps.map(s =>
              s.id === stepId ? { ...s, completed: !s.completed } : s
            ),
          }
        : m
    )

    const updated: Plan = {
      ...plan,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    }

    try {
      await db.putPlan(updated)
      await loadData()
    } catch (error) {
      toast.error('Failed to update step')
    }
  }

  const getWantTitle = (wantId?: string) => {
    if (!wantId) return null
    const want = wants.find(w => w.id === wantId)
    return want?.title
  }

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
    <div className="p-6 md:p-12 space-y-6 max-w-7xl pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold mb-2">Plans</h1>
          <p className="text-muted-foreground">
            {plans.length} {plans.length === 1 ? 'active plan' : 'active plans'}
          </p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowAddDialog(true) }} 
          className="bg-primary text-primary-foreground"
        >
          <Plus size={20} className="mr-2" weight="bold" />
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Target size={32} className="text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No plans yet</h3>
              <p className="text-muted-foreground mb-4">
                Turn your wants into actionable plans with milestones and steps.
              </p>
              <Button 
                onClick={() => { resetForm(); setShowAddDialog(true) }} 
                className="bg-primary text-primary-foreground"
              >
                <Plus size={20} className="mr-2" weight="bold" />
                Create Your First Plan
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {plans.map((plan) => {
            const isExpanded = expandedPlan === plan.id
            const wantTitle = getWantTitle(plan.wantId)
            const totalSteps = plan.milestones.reduce((sum, m) => sum + m.steps.length, 0)
            const completedSteps = plan.milestones.reduce(
              (sum, m) => sum + m.steps.filter(s => s.completed).length,
              0
            )

            return (
              <Card key={plan.id} className="overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-semibold">{plan.title}</h3>
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${plan.status === 'active' ? 'bg-primary/20 text-primary' : ''}
                          ${plan.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                          ${plan.status === 'paused' ? 'bg-amber-500/20 text-amber-400' : ''}
                        `}>
                          {plan.status}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-muted-foreground mb-3">{plan.description}</p>
                      )}
                      {wantTitle && (
                        <p className="text-sm text-accent">Linked to: {wantTitle}</p>
                      )}
                      <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                        {plan.targetDate && (
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Target: {formatDate(plan.targetDate)}</span>
                          </div>
                        )}
                        {plan.budgetEstimate && (
                          <span>Budget: {formatCurrency(plan.budgetEstimate)}</span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <DotsThree size={20} weight="bold" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(plan)}>
                          <PencilSimple size={16} className="mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddMilestone(plan.id)}>
                          <Plus size={16} className="mr-2" />
                          Add Milestone
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(plan.id)} 
                          className="text-destructive"
                        >
                          <Trash size={16} className="mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{plan.progressPercent}%</span>
                    </div>
                    <Progress value={plan.progressPercent} className="h-2" />
                    {totalSteps > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {completedSteps} of {totalSteps} steps completed
                      </p>
                    )}
                  </div>

                  {plan.milestones.length > 0 && (
                    <div className="space-y-4">
                      {plan.milestones.map((milestone) => (
                        <div key={milestone.id} className="border-l-2 border-primary/30 pl-4 space-y-2">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleMilestone(plan.id, milestone.id)}
                              className="mt-1"
                            >
                              {milestone.completed ? (
                                <CheckCircle size={20} weight="fill" className="text-green-400" />
                              ) : (
                                <Circle size={20} className="text-muted-foreground" />
                              )}
                            </button>
                            <div className="flex-1">
                              <h4 className={`font-medium ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {milestone.title}
                              </h4>
                              {milestone.description && (
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              )}
                              {milestone.targetDate && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Target: {formatDate(milestone.targetDate)}
                                </p>
                              )}
                              
                              {milestone.steps.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {milestone.steps.map((step) => (
                                    <div key={step.id} className="flex items-center gap-2">
                                      <Checkbox
                                        checked={step.completed}
                                        onCheckedChange={() => handleToggleStep(plan.id, milestone.id, step.id)}
                                      />
                                      <span className={`text-sm ${step.completed ? 'line-through text-muted-foreground' : ''}`}>
                                        {step.title}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddStep(plan.id, milestone.id)}
                                className="mt-2 h-8 text-xs"
                              >
                                <Plus size={14} className="mr-1" />
                                Add Step
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {plan.milestones.length === 0 && (
                    <Button
                      variant="outline"
                      onClick={() => handleAddMilestone(plan.id)}
                      className="w-full"
                    >
                      <Plus size={16} className="mr-2" />
                      Add First Milestone
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Plan Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What's the plan?"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your plan..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="want">Link to Want (Optional)</Label>
              <Select value={formData.wantId} onValueChange={(v) => setFormData({ ...formData, wantId: v })}>
                <SelectTrigger id="want">
                  <SelectValue placeholder="Select a want" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {wants.map(want => (
                    <SelectItem key={want.id} value={want.id}>{want.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="budget">Budget Estimate</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budgetEstimate}
                  onChange={(e) => setFormData({ ...formData, budgetEstimate: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm() }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
              {editingPlan ? 'Update' : 'Create'} Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
