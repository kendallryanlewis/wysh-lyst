# Wysh Lyst - Product Requirements Document

Wysh Lyst is a premium AI-powered personal organization app where users save everything they want in life—products, goals, experiences, ideas, upgrades, routines, places, and dreams—in a beautifully designed, local-first web application that serves as a control center for their future.

**Experience Qualities**:
1. **Luxurious** - Every interaction should feel premium, polished, and intentional, like using a high-end lifestyle product
2. **Intelligent** - The app should feel like it understands the user's aspirations through AI-powered insights and suggestions
3. **Serene** - Despite complex functionality, the experience should feel calm, focused, and uncluttered with smooth, purposeful animations

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires sophisticated features including AI provider abstraction, client-side encryption, IndexedDB persistence, multi-view layouts, rich filtering/sorting, and a complete lifecycle management system for user wants and plans.

## Essential Features

### Local-First Data Persistence
- **Functionality**: All user data stored in IndexedDB with no backend dependency
- **Purpose**: Privacy-first architecture ensuring user control over their aspirational data
- **Trigger**: Automatic on every data change
- **Progression**: User creates/edits item → Data serialized → Saved to IndexedDB → Confirmation feedback
- **Success criteria**: Data persists across sessions, export/import works flawlessly, no data loss

### Encrypted AI Provider Management
- **Functionality**: Secure storage of AI API keys with Web Crypto API encryption
- **Purpose**: Enable AI features while maintaining security best practices for client-side apps
- **Trigger**: User connects an AI provider in Settings
- **Progression**: Select provider → Enter credentials → Choose storage mode (session/encrypted) → If encrypted, enter passphrase → Key encrypted with AES-GCM → Masked preview shown → Test connection
- **Success criteria**: Keys never displayed in full after entry, encrypted storage unlockable only with passphrase, session mode cleared on refresh

### Multi-Category Want Management
- **Functionality**: Create, edit, organize, and track "wants" across 13+ categories with rich metadata
- **Purpose**: Centralize everything the user desires into one elegant system
- **Trigger**: Quick add button, full form, or AI-assisted creation
- **Progression**: User adds want → Fills details (title, category, cost, target date, etc.) → Item appears in Wants view → Can filter, sort, search → View detail modal → Edit or mark complete
- **Success criteria**: Items display beautifully in both grid and list views, filters work instantly, detail modal shows all metadata elegantly

### Vision Board
- **Functionality**: Visual, inspiration-focused board for image-heavy wants
- **Purpose**: Provide a dreamy, moodboard-style view that emphasizes aspiration over data
- **Trigger**: Navigate to Vision section
- **Progression**: User enters Vision → Sees masonry layout of image-first cards → Can drag, pin, resize → Filter by mood/category → Enter full-screen mode
- **Success criteria**: Feels like a luxury magazine spread, images load smoothly, interactions are fluid

### AI-Powered Planning
- **Functionality**: Generate action plans, get insights, compare options, and receive personalized suggestions using connected AI providers
- **Purpose**: Transform vague desires into concrete, actionable steps
- **Trigger**: AI section, or AI action buttons on want cards
- **Progression**: User selects want(s) → Chooses prompt template or writes custom → AI processes with context → Structured response shown → User can save insights, convert to checklist, or pin to dashboard
- **Success criteria**: Responses feel personalized, templates work for common scenarios, insights actionable and inspiring

### Plan Tracker
- **Functionality**: Convert wants into plans with milestones, checklists, and progress tracking
- **Purpose**: Bridge the gap between desire and achievement
- **Trigger**: Create plan from want, or start from Plans section
- **Progression**: User creates plan → Adds milestones → Breaks into tasks → Tracks progress → Updates status → Completes milestones → Celebrates achievement
- **Success criteria**: Progress is visual and motivating, milestones feel achievable, kanban view is intuitive

### Timeline Retrospective
- **Functionality**: Visual history of completed wants and achieved milestones
- **Purpose**: Celebrate progress and reinforce positive momentum
- **Trigger**: Navigate to Timeline section
- **Progression**: User enters Timeline → Sees chronological cards by month/year → Filters by category → Views completion stats → Feels accomplished
- **Success criteria**: Displays achievements elegantly, stats feel meaningful, presentation is celebratory

### Smart Dashboard
- **Functionality**: Personalized home screen with AI insights, priorities, recent activity, and quick actions
- **Purpose**: Provide a premium entry point that surfaces what matters most
- **Trigger**: App launch or Home navigation
- **Progression**: User opens app → Dashboard loads with latest data → Sees AI insight, top priorities, recent wants → Quick searches or adds item → Continues previous work
- **Success criteria**: Feels personalized and dynamic, loads instantly, insights are relevant

## Edge Case Handling

- **Empty States**: Beautiful onboarding-style empty states with clear CTAs and inspirational messaging
- **Passphrase Forgotten**: No recovery possible for encrypted keys; user must re-enter keys (with clear warning during setup)
- **AI Provider Errors**: Graceful error messages with actionable suggestions (check key, verify credits, test connection)
- **Large Data Sets**: Virtualized lists for performance, pagination in timeline, lazy image loading
- **Import Conflicts**: Merge strategy with duplicate detection and user choice
- **Offline Usage**: Full functionality except AI calls; queue AI requests for when online (future enhancement)
- **Mobile Viewport**: Responsive layouts, bottom nav, swipe gestures, touch-optimized targets
- **Browser Storage Limits**: Warning when approaching quota, suggest archive/export

## Design Direction

The design should evoke the feeling of a premium personal assistant—calm, sophisticated, aspirational, and intelligent. It should feel like opening a luxury journal or planning studio, not a task manager or shopping list. The aesthetic combines editorial design, high-end product cards, and ambient intelligence.

## Color Selection

The palette emphasizes deep, rich backgrounds with refined metallic accents and muted jewel tones.

- **Primary Color**: Champagne Gold (oklch(0.85 0.05 85)) - Represents aspiration, luxury, achievement; used for accents, CTAs, and success states
- **Secondary Colors**: 
  - Charcoal (oklch(0.18 0.01 240)) - Primary background, grounding and elegant
  - Slate Gray (oklch(0.28 0.015 240)) - Card surfaces, elevated layers
  - Steel Blue (oklch(0.55 0.04 240)) - Secondary interactive elements, links
- **Accent Color**: Soft Platinum (oklch(0.75 0.02 90)) - Highlights, focus states, shimmer effects
- **Foreground/Background Pairings**:
  - Charcoal Background (oklch(0.18 0.01 240)): Warm White text (oklch(0.95 0.01 90)) - Ratio 11.2:1 ✓
  - Slate Gray Cards (oklch(0.28 0.015 240)): Cool Light Gray text (oklch(0.88 0.01 240)) - Ratio 8.5:1 ✓
  - Champagne Gold Accent (oklch(0.85 0.05 85)): Dark text (oklch(0.20 0.01 240)) - Ratio 9.1:1 ✓
  - Steel Blue Secondary (oklch(0.55 0.04 240)): White text (oklch(0.95 0.01 90)) - Ratio 5.2:1 ✓

## Font Selection

Typography should feel editorial, refined, and modern—combining elegance with clarity.

- **Primary Font**: Crimson Pro (Serif) - For headings and editorial content, conveying sophistication
- **Secondary Font**: Inter (Sans-serif) - For UI elements, body text, and data display
- **Typographic Hierarchy**:
  - H1 (Page Titles): Crimson Pro SemiBold / 36px / loose letter spacing / line-height 1.2
  - H2 (Section Headers): Crimson Pro Medium / 28px / normal letter spacing / line-height 1.3
  - H3 (Card Titles): Inter SemiBold / 18px / tight letter spacing / line-height 1.4
  - Body (Descriptions): Inter Regular / 15px / normal letter spacing / line-height 1.6
  - Label (Metadata): Inter Medium / 13px / wide letter spacing / line-height 1.4
  - Caption (Timestamps): Inter Regular / 12px / normal letter spacing / line-height 1.3

## Animations

Animations should feel smooth, purposeful, and premium—enhancing clarity and delight without drawing attention to themselves. Use subtle spring physics and elegant easing curves.

- **Page Transitions**: 400ms ease-out fade + slide from direction of navigation
- **Card Hover**: Lift shadow + subtle scale (1.01) + 200ms spring
- **Modal Entry**: Scale from 0.95 to 1.0 + fade in + backdrop blur over 300ms
- **List Items**: Staggered fade-up on load, 60ms delay between items
- **Button Press**: Scale to 0.97 + ripple effect + 120ms ease-out
- **Success States**: Gentle bounce + shimmer + color shift over 500ms
- **AI Typing**: Streaming text with cursor blink, smooth reveal
- **Microinteractions**: Progress bars fill smoothly, checkboxes scale in, tags fade in/out

## Component Selection

- **Components**: 
  - Sidebar & MobileNav (custom) - Navigation with icons and labels
  - Card (shadcn) - Base for want cards with hover states
  - Dialog (shadcn) - Full detail modals with rich content
  - Sheet (shadcn) - Mobile bottom drawer for quick actions
  - Button (shadcn) - Primary, secondary, ghost variants with loading states
  - Input, Textarea (shadcn) - Form fields with floating labels
  - Select, Combobox (shadcn) - Dropdown menus with search
  - Badge (shadcn) - Status, category, and tag pills
  - Progress (shadcn) - Completion bars with gradient fills
  - Tabs (shadcn) - View switchers in Wants and Plans
  - Switch (shadcn) - Settings toggles
  - Separator (shadcn) - Elegant dividers
  - ScrollArea (shadcn) - Smooth scrolling containers
  - Skeleton (shadcn) - Loading states
  - Toast (sonner) - Notifications with success/error states

- **Customizations**:
  - WantCard - Custom card with image, gradient overlays, action menu
  - VisionBoardCard - Draggable masonry card with image focus
  - AiChatPanel - Chat interface with streaming responses
  - AiConnectionCard - Provider setup with status indicators
  - DashboardInsightCard - AI-powered summary with glow effect
  - TimelineCard - Completion celebration with date stamps
  - EncryptionUnlockModal - Passphrase entry with security messaging
  - QuickAddFab - Floating action button with expand animation

- **States**:
  - Buttons: default → hover (lift) → active (press) → loading (spinner) → success (checkmark fade)
  - Inputs: empty → focused (border glow) → filled → error (shake + red) → success (green check)
  - Cards: default → hover (lift + shadow) → selected (border glow) → dragging (opacity 0.6)

- **Icon Selection**:
  - Home: House
  - Wants: Heart
  - Vision: Eye
  - Plans: ListChecks
  - AI: Sparkle
  - Timeline: ClockCounterClockwise
  - Settings: Gear
  - Add: Plus in circle
  - Search: MagnifyingGlass
  - Filter: Funnel
  - Sort: ArrowsDownUp
  - Edit: Pencil
  - Delete: Trash
  - Archive: Archive
  - Check: CheckCircle
  - Lock: Lock
  - Eye: Eye for preview

- **Spacing**:
  - Section gaps: gap-8 (32px)
  - Card grids: gap-6 (24px)
  - Card internal: p-6 (24px)
  - Form fields: gap-4 (16px)
  - Inline elements: gap-2 (8px)
  - Page margins: px-6 md:px-8 (24-32px)

- **Mobile**:
  - Sidebar → Bottom navigation bar (fixed)
  - Multi-column grids → Single column
  - Dialogs → Full-screen sheets
  - Hover states → Touch-optimized tap targets (min 44px)
  - Desktop filters → Bottom sheet filter menu
  - Split views → Stacked views with smooth transitions
