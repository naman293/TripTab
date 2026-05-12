# TripTab: Design System & Project Context

This document serves as the foundational reference for the TripTab design system and project objectives. It is intended to guide the creation of a high-fidelity landing page and ensure consistent UI/UX across the application.

---

## 1. Project Vision
**TripTab** is a modern, playful, and high-utility expense-sharing application specifically designed for travelers. Unlike generic bill-splitting apps, TripTab focuses on real-time collaboration, "trip rooms," and consensus-based approvals to eliminate friction in group travel finances.

### Core Value Propositions
- **Real-time Sync**: Instant updates across all devices when an expense is added.
- **Neo-Brutalist Aesthetic**: A unique, high-contrast visual style that stands out from corporate fintech.
- **Consensus Voting**: A mechanism for "deleting with consensus" to ensure transparent group decisions.
- **Mobile-First Utility**: Optimized for use on-the-go (receipt scanning, quick entry).

---

## 2. Design System: Playful Neo-Brutalism

The design language of TripTab is rooted in **Neo-Brutalism**—characterized by high-contrast colors, thick borders, and "sticker-like" elements.

### Color Palette
- **Mustard (`#F8C62A`)**: Primary Brand Color. Used for backgrounds and main branding.
- **Cream (`#FFF7E9`)**: Secondary Background. Used for cards and "paper" surfaces.
- **Ink (`#111111`)**: Text & Borders. Used for high-contrast visibility.
- **Cyan (`#58D4F5`)**: Accent Color. Used for highlights, active states, and secondary buttons.
- **Coral (`#FF6F61`)**: Warning/Danger Color. Used for negative balances or delete actions.
- **Olive (`#8AA341`)**: Success Color. Used for positive balances or settled debts.
- **Offwhite (`#FFFDF7`)**: Input backgrounds.

### Typography
- **Headings**: `Baloo 2` (Weights: 700, 800)
  - *Feel*: Chunky, rounded, friendly, and bold.
- **Body Text**: `Nunito` (Weights: 500, 700)
  - *Feel*: Legible, modern, and slightly playful.

### UI Tokens
- **Borders**: `3px solid #111111` (Thick, black outlines on everything).
- **Shadows**: `4px 4px 0 #111111` (Hard, offset shadows that don't blur).
- **Corner Radius**:
  - Cards: `18px`
  - Buttons: `14px`
  - Pills: `999px`

---

## 3. Key Components for the Landing Page

### The "Paper Card"
A floating element with a white/cream background, thick border, and hard shadow. It often features a small "tape" or "highlight" sticker effect at the top corner.

### The "Brutal Button"
Tactile buttons that "sink" when pressed. 
- *Hover*: Slight brightness increase.
- *Active*: `transform: translate(2px, 2px); box-shadow: 2px 2px 0 #111111;`

### Interactive "Stickers"
Small decorative elements rotated slightly (-1.5deg to 1.5deg) to give a scrapbook/journaling feel to the UI.

---

## 4. Landing Page Structure (Planned)

1. **Hero Section**: 
   - Big, bold headline in Baloo 2.
   - 3D-ish mockup of the "Paper Card" expense UI.
   - Interactive "DotField" background for playfulness.
2. **The "Why" (Features)**:
   - **No More Spreadsheet Hell**: Visual grid of expenses.
   - **Consensus is King**: Showing the voting mechanism.
   - **Real-time Vibes**: Highlighting Supabase sync.
3. **How it Works**:
   - Step 1: Create a Trip Room.
   - Step 2: Invite your Mates.
   - Step 3: Snap and Split.
4. **Social Proof / Vibe Check**:
   - Sticker-style testimonials.
5. **Call to Action**:
   - High-contrast button: "Start Your Trip Room".

---

## 5. Technical Context
- **Framework**: React + Vite
- **Styling**: Vanilla CSS + Tailwind utilities (for layout)
- **Auth**: Clerk
- **Backend**: Supabase (Postgres + Realtime)
- **Design Tokens**: Defined in `src/theme/tokens.ts` and `src/styles.css`
