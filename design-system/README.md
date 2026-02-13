# KodNest Premium Build System

A premium SaaS design system built with calm, intentional, and coherent design principles.

## Design Philosophy

- **Calm**: No flashy animations or distracting elements
- **Intentional**: Every element serves a purpose
- **Coherent**: Consistent patterns throughout
- **Confident**: Strong typography and clear hierarchy

## File Structure

```
design-system/
├── tokens.css          # Design tokens (colors, typography, spacing)
├── base.css            # Base styles and typography
├── components.css      # Reusable components (buttons, inputs, cards)
├── layout.css          # Layout components (TopBar, Workspace, Footer)
├── main.css            # Main stylesheet (imports all + utilities)
├── example.html        # Example page demonstrating the system
└── README.md           # This file
```

## Usage

Include the main stylesheet in your HTML:

```html
<link rel="stylesheet" href="design-system/main.css">
```

## Design Tokens

### Colors
- Background: `#F7F6F3`
- Primary Text: `#111111`
- Accent: `#8B0000` (deep red)
- Success: `#4A6741` (muted green)
- Warning: `#B8860B` (muted amber)

### Typography
- Headings: Serif font (Georgia, Times New Roman)
- Body: Sans-serif font (system fonts)
- Body text: 16-18px, line-height 1.6-1.8
- Max text width: 720px

### Spacing Scale
- `--spacing-xs`: 8px
- `--spacing-sm`: 16px
- `--spacing-md`: 24px
- `--spacing-lg`: 40px
- `--spacing-xl`: 64px

### Transitions
- Fast: 150ms ease-in-out
- Base: 200ms ease-in-out
- No bounce, no parallax effects

## Components

### Buttons
- `.btn-primary`: Solid deep red button
- `.btn-secondary`: Outlined button

### Inputs
- `.input`: Text input
- `.textarea`: Textarea input

### Cards
- `.card`: Subtle border, no shadows, balanced padding

### Badges
- `.badge-default`: Default state
- `.badge-success`: Success state
- `.badge-warning`: Warning state
- `.badge-accent`: Accent color

## Layout Structure

Every page follows this structure:

1. **Top Bar** (`.top-bar`)
   - Left: Project name
   - Center: Progress indicator (Step X / Y)
   - Right: Status badge

2. **Context Header** (`.context-header`)
   - Large serif headline
   - One-line subtext

3. **Workspace** (`.workspace`)
   - Primary Workspace (70% width): Main interaction area
   - Secondary Panel (30% width): Step explanation, prompts, actions

4. **Proof Footer** (`.proof-footer`)
   - Checklist of proof items

## Principles

1. **No gradients, glassmorphism, neon colors, or animation noise**
2. **Consistent spacing scale** - Never use random spacing values
3. **Whitespace is part of design** - Generous spacing throughout
4. **Same hover effects and border radius** everywhere
5. **Clean borders, no heavy shadows**
6. **Errors explain what went wrong + how to fix** - Never blame user
7. **Empty states provide next action** - Never feel dead

## Browser Support

Modern browsers with CSS custom properties support.
