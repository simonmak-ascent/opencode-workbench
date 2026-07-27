# UI Patterns

> Phase: #2 | Created: 2026-07-27

## Chat Interface

```
┌──────────────────────────────────────────┐
│ Header: org name, chat title             │
├──────────────────────────────────────────┤
│                                          │
│  [User message bubble]         12:34 PM  │
│                                          │
│  [Assistant message]           12:34 PM  │
│  • Streaming text indicator              │
│  • Tool call card (collapsible)          │
│  • Tool result (collapsible)             │
│                                          │
│  [Approval dialog]                       │
│  "Allow delete of Project X?"            │
│  [Approve] [Deny]                        │
│                                          │
├──────────────────────────────────────────┤
│ [Text input________________] [Send]      │
│ [Stop generation]                        │
└──────────────────────────────────────────┘
```

### Chat States
- **Idle**: Empty state with suggested prompts
- **Streaming**: Animated cursor + partial text, Stop button visible
- **Tool executing**: Tool call card with spinner
- **Tool completed**: Expandable result card
- **Awaiting approval**: Modal/dialog with action buttons
- **Error**: Red banner with retry action, collapsed error details
- **Loading history**: Skeleton messages

## Dashboard

```
┌──────────────────────────────────────────┐
│ Dashboard / Projects                  [+] │
├──────────────────────────────────────────┤
│ [Stats card] [Stats card] [Stats card]   │
├──────────────────────────────────────────┤
│ [Data table with sorting, filtering,     │
│  pagination]                             │
├──────────────────────────────────────────┤
│ [Chart: activity over time]              │
└──────────────────────────────────────────┘
```

### Dashboard States
- **Loading**: Skeleton cards + skeleton table rows
- **Empty**: Illustration + "Create your first project" CTA
- **Error**: Error card with retry
- **Data**: Populated cards, table, chart

## Forms

```
┌──────────────────────────────────────────┐
│ Create Project                           │
├──────────────────────────────────────────┤
│ Name: [___________________________]      │
│ Description: [____________________]      │
│                                          │
│ [Cancel]  [Create Project] (spinner)     │
└──────────────────────────────────────────┘
```

### Form States
- **Default**: Empty fields, submit enabled if no required fields
- **Validating**: Client-side Zod validation on blur
- **Invalid**: Red borders, error messages below fields
- **Submitting**: Submit button disabled + spinner
- **Server error**: Banner at top with message
- **Success**: Redirect or toast notification

## Navigation

```
┌──────┬───────────────────────────────────┐
│Sidebar│  Main Content Area               │
│      │                                   │
│ Org  │  [Breadcrumb: Org > Project > ...] │
│ name │                                   │
│      │  Page content                     │
│ Nav  │                                   │
│ items│                                   │
│      │                                   │
└──────┴───────────────────────────────────┘
```

- Sidebar: collapsible on mobile, persistent on desktop
- Breadcrumb: dynamic based on route, clickable
- Active nav item: highlighted with brand color
- User menu: avatar dropdown with sign out

## Scraper Dashboard

```
┌──────────────────────────────────────────┐
│ Scraper / Targets                     [+] │
├──────────────────────────────────────────┤
│ [Target 1]  active  ✓   last: 2m ago     │
│ [Target 2]  active  ✓   last: 15m ago    │
│ [Target 3]  paused  ⏸   last: 1h ago     │
├──────────────────────────────────────────┤
│ Target Detail                            │
│ URL: https://example.com                 │
│ Changes (last 24h): 3                    │
│ [View snapshots] [View diffs]            │
└──────────────────────────────────────────┘
```

### Scraper States
- **Active**: Green indicator, shows last successful fetch
- **Paused**: Yellow, shows pause reason
- **Error**: Red, shows last error + retry button
- **Circuit open**: Orange, shows reset countdown
