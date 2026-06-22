# Northwind Command Center — Build Notes

The first internal slice of Northwind Coffee's "command center": a **Dashboard** for at-a-glance business health and a **Lead Triage** workflow, plus supporting **Accounts** and **Contacts** views. Built on the provided mock data in `data/` (treated as a read-only database).

## What I prioritized — and what I cut

I optimized for **shipping speed *and* polish together**: the two core flows working correctly against the real data, a clean enterprise feel, sensible empty/loading states, and zero console errors.

- **Stack: Next.js + Material-UI + MUI X Charts.** MUI gave me production-grade tables, drawers, charts, and theming out of the box — that's where the speed *and* the polish came from. I didn't hand-roll UI; I spent the time on data correctness and workflow.
- **State: LocalStorage, plain React hooks.** For read-only mock data plus a few persisted user actions, LocalStorage is the right "database": zero infra, instant, survives reloads. The mock JSON stays read-only; my app state persists separately. No Redux — it would have been overhead for this scope.
- **Deliberately cut:** no backend/auth/real DB/tests (per the brief). The **Add** buttons are intentional placeholders (flagged in-app as a future iteration). Each page keeps its own edit store rather than a shared data layer — the right trade for a first slice, and the obvious thing to consolidate later.

## Triage rule: requested volume → Hot / Warm / Cold

I classify every inquiry by **requested monthly volume**: **Hot > 200 lbs/mo**, **Warm 100–200**, **Cold < 100**.

Volume is the cleanest proxy for deal size we have — it's the one field on every inquiry that maps directly to revenue and lifetime value, with no enrichment required. A café asking for 300 lbs/mo is worth a call today; a 40 lb hobby shop can wait. The Leads table reinforces this: it sorts open work to the top, and the **"Needs First Contact"** card surfaces untouched *hot* leads — the operator's daily action queue. Status (`new → contacted → qualified → closed`) is a one-click, always-on dropdown that persists, so "who did we talk to?" is never lost.

## How I built it (AI orchestration)

Built with **Claude (Claude Code)**, with me directing as the engineer. I had Claude scaffold the app, write the components, and then **reconcile the whole UI to the real data schema** — which caught a real issue: the first pass had invented its own data, so I made it swap in the official `data/` files and fix every field mismatch before going further.

I worked in tight loops — *build → typecheck → fix → repeat* — so every TypeScript/runtime error was resolved before moving on. To keep four pages consistent without duplication, I had it factor out a small shared layer: one edit hook, one reusable edit drawer, and shared card/chart components.

## How this removes the Excel/Inbox bottleneck

Today the business runs on spreadsheets and inboxes: leads get buried in email, prioritization is guesswork, and pipeline state lives in someone's head. The Command Center replaces that with **one ranked queue** — every inbound lead auto-prioritized by revenue potential, with one-click persisted status — and a dashboard that answers "how are we doing?" instantly. No copy-paste, no lost threads, no stale spreadsheet.

## To production (next steps)

- Replace LocalStorage with a real API + database behind a single shared data layer (optimistic updates).
- Add authentication and an audit trail (who changed what, when).
- Wire up the **Add** actions, add search/filter, and draft inquiry replies with AI using the existing `message` field.
