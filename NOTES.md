# Northwind Command Center — Build Notes

A first working version of Northwind Coffee's internal "command center": a **Dashboard** to see how the business is doing at a glance, and a **Lead Triage** workflow to work through incoming wholesale inquiries — with supporting **Accounts** and **Contacts** views. It uses the sample data included in the repo as its database, runs entirely in the browser, and deploys to Vercel with no extra setup.

## What I focused on — and what I left for later

The goal was to deliver the two core pieces **fast and polished**, not to build everything. So I prioritized:

- The **Dashboard** and **Lead Triage** working end-to-end and correctly on the real sample data.
- A clean, professional feel — like real enterprise software — with no rough edges (sensible "no data" states, nothing broken).

What I deliberately left out, and why: no login, no real database, and no automated tests. The brief said these weren't needed, and adding them would have slowed delivery without improving what's being evaluated. The "Add new record" buttons are present but marked as coming next, so the interface shows its full intended shape without over-building.

On tooling: I used **Next.js** (the web framework) with **Material-UI**, a ready-made library of professional interface components. That choice is where most of the speed *and* the polish came from — I assembled proven building blocks (tables, charts, side panels) instead of rebuilding them. The app saves each user's changes (for example, marking a lead as contacted) directly in their browser, which is the simplest dependable approach at this stage.

## How I prioritize leads (Hot / Warm / Cold)

Every incoming inquiry is ranked by the **monthly coffee volume it asks for**: **Hot** above 200 lbs/month, **Warm** 100–200, **Cold** below 100.

The logic is simple and defensible: requested volume is the best early signal of how valuable a customer could become, and it's available on every inquiry with no extra research. A café asking for 300 lbs/month deserves a call today; a very small order can wait. The Leads page puts the biggest untouched opportunities at the top, and a "Needs First Contact" indicator shows how many high-value leads haven't been reached yet — so the team always knows where to start its day.

## How I built it (working with AI)

I built this by **directing an AI coding assistant (Claude)** rather than writing code by hand — which is how this role is meant to work. I set the direction and the quality bar, then had the AI generate and refine the app in fast, reviewed cycles. To move quickly without sacrificing consistency, I had it build the four pages from one shared set of components in batched passes, rather than one page at a time.

Human judgment was the safeguard. One early example: a first version quietly invented its own sample data instead of using the official data in the repo. I caught it and had the work redone against the real data — the kind of check that keeps "fast" from turning into "wrong."

## The problem it solves

Today this kind of business runs on spreadsheets and inboxes: leads get buried in email, priorities are guesswork, and the status of each conversation lives in someone's head. The Command Center replaces that with a single ranked queue — every lead automatically prioritized by its revenue potential, with one click to update its status — and a dashboard that answers "how are we doing?" instantly.

## Project Roadmap (next iterations)

- Buttons to add new leads, accounts, and contacts
- Filters on the dashboard, leads, accounts, and contacts
- Global search bar
- Reporting
- Export to CSV
- Admin console to manage users
- Settings module
- Move from browser storage to a real backend and database, with login, user roles, and an audit trail
