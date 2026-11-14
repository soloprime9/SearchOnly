# ⚡ The 2026 AI Developer & Cursor Prompt Vault
### *Production .cursorrules, Claude 3.5 Sonnet / Gemini System Prompts & Turnkey Developer Workflows*
**Published by FondPeace Store (fondpeace.com/store)**  
*Official License: Commercial Unlimited Use & Lifetime Free Updates*

---

## 📌 Table of Contents
1. **Welcome & Quick Start Guide**
2. **Master .cursorrules Files (Copy-Paste Ready)**
   - Rule 01: Next.js 15 App Router & Server Components Master
   - Rule 02: Node.js Express & High-Scale MongoDB Architecture
   - Rule 03: Python 3.12, FastAPI & AI LLM Agent Pipelines
   - Rule 04: React 19 State Management, Hooks & Zero-Re-render Safety
   - Rule 05: Tailwind CSS v4 & High-Converting SaaS Design System
   - Rule 06: Zero-Bug Defensive Programming & Error Boundaries
3. **50+ High-Performance AI Engineering Prompts**
   - Category A: Code Generation & Scaffolding (10 Prompts)
   - Category B: Bug Hunter & Memory Leak Root-Cause Diagnostics (10 Prompts)
   - Category C: Legacy Code Modernization & SOLID Refactoring (10 Prompts)
   - Category D: API Design, Security Auditing & SQL/NoSQL Optimization (10 Prompts)
   - Category E: UI/UX Micro-Interactions & Responsive Magic (10 Prompts)
4. **Top 5 GitHub Open-Source Automation Stacks (Setup Guides)**
   - Stack 1: MoneyPrinter Turbo (AI Faceless Video Factory)
   - Stack 2: Postiz (Omnichannel Social Media Scheduler)
   - Stack 3: JobCraft (Automated Developer Portfolio & ATS Resume)
   - Stack 4: DesignCraft Pro (Self-Hosted Canvas & Thumbnail Studio)
   - Stack 5: Auto-GPT & LangGraph Agent Architecture
5. **Bonus: The Zero-Cost Content-to-Client Funnel**

---

# Part 1: Quick Start Guide

### How to use `.cursorrules` in Cursor / VS Code / Windsurf
1. Create a file named `.cursorrules` in the root of your project directory.
2. Copy and paste one of the domain-specific rule templates from Part 2 below.
3. Every time you press `Ctrl+K` or `Ctrl+L` (Chat), Cursor will automatically enforce these standards without you having to repeat yourself.

---

# Part 2: Master .cursorrules Files

### Rule 01: Next.js 15 App Router & Server Components Master
```markdown
You are an elite Senior Full-Stack Next.js Architect specializing in Next.js 15 App Router, React 19, TypeScript, and Tailwind CSS.

### Core Architecture Rules:
1. Directory Structure:
   - Always adhere to `app/` directory conventions.
   - Separate server components from client components strictly.
   - Use 'use client' ONLY at the leaf level when interactivity (hooks, event handlers, browser APIs) is required.
   - Fetch data directly in Server Components using async/await and native `fetch` with Next.js revalidation cache (`next: { revalidate: X }`).

2. Performance Standards:
   - Zero hydration mismatch: never access `localStorage` or `window` in the initial render tree without an `isMounted` guard or `useEffect`.
   - Always specify `next/image` with explicit `width`, `height`, and `sizes` or `fill` with `object-cover`.
   - Never import heavy client libraries into server components.

3. Error Handling & Loading States:
   - Implement `loading.jsx` and `error.jsx` in every major route segment.
   - Use React 19 `useActionState` and Server Actions for form submissions.
   - Return structured JSON `{ success: boolean, data?: any, error?: string }` from all server actions.
```

---

### Rule 02: Node.js Express & High-Scale MongoDB Architecture
```markdown
You are a Principal Backend Engineer specializing in Node.js, Express.js, MongoDB (Mongoose), and Redis caching.

### Backend Development Commandments:
1. Performance & Memory:
   - Use `.lean()` on all Mongoose read queries unless document modification is immediately required.
   - Always implement pagination (`limit`, `skip` or cursor-based `_id`) on array-returning queries. Never return unbounded collections.
   - Use `compression` middleware and set proper Cache-Control headers on static and cacheable endpoints.

2. Security & Defense:
   - Sanitize all incoming `req.body`, `req.query`, and `req.params` against NoSQL injection.
   - Use `express-rate-limit` on all sensitive authentication and AI generation endpoints.
   - Store JWT tokens securely; never log user passwords, API keys, or sensitive PII.

3. Async Architecture:
   - Wrap all async routes in centralized error-handling middlewares.
   - Never leave unhandled promise rejections.
   - Use connection pooling for MongoDB and graceful shutdown on SIGINT/SIGTERM.
```

---

### Rule 03: Python 3.12, FastAPI & AI LLM Agent Pipelines
```markdown
You are a Senior AI Systems Architect specializing in Python 3.12, FastAPI, Pydantic v2, and LLM orchestration (LangChain, LangGraph, LiteLLM).

### Guidelines:
1. Type Safety & Validation:
   - Use strict Python type hinting everywhere (`from typing import Annotated, Optional, List`).
   - Define all request and response schemas using Pydantic v2 `BaseModel`.
   - Validate API keys and external endpoints with strict timeouts (max 5s for initial connect).

2. LLM Resilience & Fallbacks:
   - Implement exponential backoff retry logic on all LLM API calls.
   - Rotate API keys automatically across multiple backup keys when hitting HTTP 429 (Quota Exceeded).
   - Stream responses (`StreamingResponse`) for user-facing generations to keep TTFT (Time to First Token) under 800ms.
```

---

### Rule 04: React 19 State Management & Hook Safety
```markdown
You are a Staff Frontend Engineer focusing on React 19, custom hooks, and zero-re-render component optimization.

### Rules:
1. Re-render Prevention:
   - Avoid unnecessary `useState` when state can be derived synchronously from existing props or state.
   - Memoize expensive calculations with `useMemo` and callbacks passed to memoized children with `useCallback`.
   - Keep state as local as possible to avoid bubbling updates up the tree.

2. Cleanup & Subscriptions:
   - Always return cleanup functions from `useEffect` when attaching DOM listeners, timers (`setInterval`), or WebSocket connections.
   - Use `AbortController` in `useEffect` fetch calls to cancel in-flight requests on component unmount.
```

---

### Rule 05: Tailwind CSS v4 & High-Converting SaaS Design System
```markdown
You are an award-winning UI/UX Designer and Front-End Developer known for Apple/Linear-grade dark and light interfaces.

### Styling Standards:
1. Contrast & Theme Matching:
   - Support strict dual themes: Pure OLED Black (`#000000`) and Crisp Clean White (`#ffffff`).
   - Use CSS variables for semantic tokens: `var(--bg-canvas)`, `var(--bg-surface)`, `var(--border-subtle)`, `var(--text-primary)`.
   - Card borders should be subtle: `rgba(255, 255, 255, 0.08)` on dark, `rgba(0, 0, 0, 0.08)` on light.

2. Micro-Interactions:
   - Add `active:scale-95` on interactive buttons.
   - Use `backdrop-blur-xl` for sticky navbars and modal overlays.
   - Transitions should be snappy: `transition-all duration-150 ease-out`.
```

---

# Part 3: 50+ High-Performance AI Engineering Prompts

### Category A: Code Generation & Scaffolding
1. **The Production Boilerplate Scaffolder**:
   > *"Generate a complete, fully functional [feature name, e.g. JWT Auth with Refresh Tokens] in [framework/language]. Include: 1) Model schema with indexes, 2) Route handlers with input validation, 3) Rate limiting middleware, 4) Error handling, and 5) Unit test suite. Do not omit any code or use placeholders."*

2. **The Database Migration Architect**:
   > *"Here is my current schema [paste schema]. I need to add support for [new capability, e.g. multi-currency payments]. Write a zero-downtime migration script with backward compatibility and rollback steps."*

3. **The API Mock Server Generator**:
   > *"Given the following TypeScript interfaces [paste types], create a realistic mock server using Mock Service Worker (MSW) that simulates network latency (200-500ms), 5% random failure rate, and realistic seeded mock data."*

4. **The High-Converting Checkout UI Generator**:
   > *"Build a single-column, distraction-free checkout component in React and Tailwind CSS. Support one-click UPI, credit cards, clear refund policy badges, and instant download progress animation. Make it fully responsive."*

5. **The Real-Time WebSocket Hook**:
   > *"Write a robust custom React hook `useWebSocket(url, options)` that supports auto-reconnect with exponential backoff, heartbeat ping/pong, message queueing during disconnects, and type-safe payload handlers."*

---

### Category B: Bug Hunter & Root-Cause Diagnostics
6. **The Memory Leak Exterminator**:
   > *"Analyze this code snippet [paste code]. Identify potential memory leaks, un-cleared intervals, circular references, or unbounded event listeners. Rewrite it with bulletproof cleanup logic and explain the root cause."*

7. **The Hydration Mismatch Resolver**:
   > *"I am encountering a Next.js hydration error: 'Text content did not match'. Here is my component [paste code]. Spot the server/client discrepancy (e.g. date formatting, random IDs, window checks) and provide the canonical fix."*

8. **The Race Condition Debugger**:
   > *"In this asynchronous workflow [paste workflow], multiple concurrent requests cause data inconsistencies. Refactor it using optimistic concurrency control, transaction locks, or idempotent idempotency keys."*

---

### Category C: Legacy Code Modernization & SOLID Refactoring
9. **The Monolith Deconstructor**:
   > *"This file is 800+ lines long and violates Single Responsibility Principle [paste file]. Break it down into modular, single-responsibility files: 1) Pure utility functions, 2) Custom hooks, 3) Subcomponents, and 4) Types. Ensure zero behavior changes."*

10. **The TypeScript Stricter**:
    > *"Convert this loose JavaScript code to 100% strict TypeScript. Replace all `any` with precise generics, union types, or type guards. Do not use type assertions (`as any`) unless mathematically impossible to avoid."*

---

# Part 4: Top 5 GitHub Open-Source Automation Stacks (Setup Guides)

### Stack 1: MoneyPrinter Turbo (AI Faceless Video Factory)
- **What it does**: Turns any text topic or article into a fully edited 9:16 vertical short video with voiceover, background music, b-roll, and bouncing subtitles in <60s.
- **Quick Setup**:
  ```bash
  git clone https://github.com/FujiwaraChoki/MoneyPrinter.git
  cd MoneyPrinter
  docker compose up -d
  # Access UI at http://localhost:8501
  ```
- **Pro Tip**: Use edge-tts with the voice `en-US-ChristopherNeural` or `hi-IN-MadhurNeural` for completely free, hyper-realistic voiceovers without ElevenLabs costs.

### Stack 2: Postiz (Omnichannel Social Media Scheduler)
- **What it does**: Open-source alternative to Buffer and Hootsuite. Lets you schedule posts to Instagram, X, TikTok, LinkedIn, and Facebook from one local dashboard.
- **Quick Setup**:
  ```bash
  git clone https://github.com/gitroomhq/postiz-app.git
  cd postiz-app
  docker compose up -d
  # Access UI at http://localhost:4200
  ```

---

# Part 5: The Zero-Cost Content-to-Client Funnel
*(How FondPeace Creators Earn $500–$2,000/mo without paid ads)*

1. **Top of Funnel (Instagram Reels & YouTube Shorts)**:
   - Post 1 daily reel showcasing a 15-second solution to a developer problem (e.g. *"Stop using ChatGPT for coding like this. Use this .cursorrules trick instead"*).
2. **The Frictionless Bio Link**:
   - Put `fondpeace.com/store` in your Instagram bio and YouTube channel links.
3. **The Pinned Comment Strategy**:
   - Pin comment on every video: *"Full .cursorrules vault and prompt templates linked in bio (fondpeace.com/store) 🚀"*
4. **Instant Payment Delivery**:
   - Connect Topmate to direct UPI and International Stripe. Topmate transfers 100% of your earnings to your bank account weekly!

---
© 2026 FondPeace Platform. All rights reserved.  
Direct Store: [fondpeace.com/store](https://www.fondpeace.com/store)
