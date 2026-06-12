**AI Engineer Roadmap**

Deep Analysis & Rebuild Specification

Source File: ai_engineer_roadmap_fixed.html

11,810 lines | 700 KB | Single-file HTML Application

Confidential Technical Report

June 2026

# Table of Contents

1\. Executive Summary

2\. File Structure Analysis

3\. Feature Inventory

4\. Function Analysis

5\. Event System Analysis

6\. Data Architecture Analysis

7\. UI Component Breakdown

8\. Roadmap Rendering Analysis

9\. Frontend vs Backend Analysis

10\. NVIDIA API Integration Analysis

11\. NVIDIA Proxy Tunnel Analysis

12\. Security Audit

13\. Performance Analysis

14\. Scalability Analysis

15\. Complete Rebuild Blueprint

16\. Module-by-Module Breakdown

17\. Missing Features & Recommendations

# 1\. Executive Summary

This report provides a comprehensive reverse-engineering and architectural analysis of ai_engineer_roadmap_fixed.html, an 11,810-line, 700KB single-file HTML application that implements a complete AI/ML Engineer learning roadmap platform with integrated AI tutoring capabilities.

## Key Findings

The application is a sophisticated frontend-only single-page application (SPA) built entirely in vanilla JavaScript without any frameworks. It implements a surprising depth of functionality including: a 13-phase, 39-module curriculum with full content rendering; dual-AI integration (Google Gemini + NVIDIA NIM); a complete learning management system with progress tracking; quiz generation and scoring; study planning; knowledge graph visualization; activity heatmaps; import/export; undo/redo history; and an AI agent workspace with weakness detection and personalized recommendations.

### Architecture Classification: Frontend-Only Prototype with Production Gaps

The application is architecturally a sophisticated prototype/MVP that demonstrates substantial product thinking but lacks critical production infrastructure. All state persists to localStorage only. API keys are stored client-side. There is no backend, no authentication, no database, and no server-side logic. The NVIDIA API integration makes direct browser-to-API calls with exposed keys. A proxy configuration UI exists but is a pass-through stub with no actual proxy implementation.

### Critical Issues Identified

**Security (Critical):** API keys stored in localStorage (unencrypted); direct browser API calls expose keys in network tab; no CSP headers; XSS possible via markdown rendering without sanitization; no input validation on API responses.

**Scalability (Critical):** localStorage quota (~5-10MB) limits all data; no multi-device sync; single-user architecture; no caching strategy beyond localStorage.

**Data Integrity (High):** No schema versioning on core data; hardcoded '22' total modules in settings UI contradicts 39-module ALL_MODS array; export format lacks migration path.

**NVIDIA Integration (Medium):** Real API calls to NVIDIA NIM with user-provided keys; functional but exposes keys client-side; proxy URL is a UI-only feature with no proxy server provided.

# 2\. File Structure Analysis

The entire application exists in a single HTML file with no external dependencies beyond Google Fonts and API endpoints. The file is organized into three major sections: HTML markup (~7,800 lines), CSS styles (~2,000 lines), and JavaScript (~3,200 lines).

## 2.1 HTML Architecture

**Document Type:** HTML5 with data-theme attribute for dark/light mode switching

**Root Element:** &lt;html lang="en" data-theme="dark"&gt; with CSS attribute selector theming

**Head Section:** Contains meta tags, Google Fonts preconnect (Syne, JetBrains Mono, Inter), and inline CSS

**Body Structure:** Fixed layout with overflow:hidden on body; all scrolling managed within content area

## 2.2 Section Hierarchy

Topbar (fixed, z-200): Brand logo, title, progress pill, AI buttons, settings button

Phase Navigation (fixed, z-150): Horizontal scrollable tab bar for 13 phases

App Shell: Flex container holding sidebar + content area

Sidebar (248px fixed width): Progress summary, scrollable module list grouped by phase

Content Area (flex:1, scrollable): Phase containers with module cards

Settings Panel (slide-in from right, z-310): Stats, theme, font size, export/import, history, reset

API Key Manager Modal (z-900): Gemini + NVIDIA key inputs with status indicators

Model Switcher Dropdown: 11 free models across Gemini + NVIDIA providers

Ask AI Floating Panel (z-500): Chat interface with mode selector, difficulty levels, pinned messages

Chat History Modal: Saved conversation sessions (max 20)

AI Agent Full-Page Overlay (z-500+): Dashboard, deep analysis chat, quiz engine, planner, knowledge map

Intervention Banner: Contextual help prompts after 5-min idle

Welcome Modal (first-time): Onboarding with API key setup

Toast Notifications (z-500): Success/error/undo messages with countdown

## 2.3 Layout System

**Approach:** CSS custom properties (variables) for theming with zoom-based font scaling

**Positioning:** Fixed-position chrome (topbar + phase nav) with calc()-based offsets for content area

**Responsive:** Single breakpoint at 768px: hides sidebar, adjusts grid columns, full-width settings

**Scroll Strategy:** body { overflow: hidden } with content area as the sole scrolling element; custom scrollbar styling

## 2.4 Component Communication

Components communicate through a global event pattern: functions are attached to window object; state is stored in module-level variables; DOM queries use id-based lookups. No pub/sub system, no event bus, no reactive framework. The architecture relies on direct function calls and shared mutable state.

# 3\. Feature Inventory

This section catalogs every feature in the application with implementation status classification.

## 3.1 Fully Implemented Features

• Dark/Light Theme Toggle: CSS attribute-based theming with 134 CSS variables, full color system

• Phase Navigation: 13 phase tabs with active state, instant phase switching

• Module Cards: Expandable/collapsible cards with toggle buttons, scroll-to behavior

• Progress Tracking: Real-time percentage calculation, progress bar fills, topbar + sidebar + settings sync

• Module Completion (Mark Done): One-click completion with undo toast, 5-second countdown, O(1) UI update

• Self-Assessment Checks: Grid of tickable checkboxes with debounced save (300ms), teal styling on tick

• Undo/Redo System: Full history log with chronological entries, undo-to-redo state transfer, configurable max size

• Export Progress: JSON download with schema v4, includes done, checks, theme, history, redoHistory

• Import Progress: FileReader-based JSON import with validation, v3 backward compatibility, UI restoration

• Reset Progress: Confirm dialog + complete state wipe with UI refresh

• Font Size Adjustment: Dual-track zoom (content + UI) via CSS zoom property, 75%-140% range, 5% steps

• Sidebar Navigation: Phase-grouped module list with done state indicators, click-to-jump with expand+scroll

• Learning Steps: Vertical step timeline with connector lines, numbered circles, key-item badges

• Code Exercises: Collapsible blocks with Python code hints in JetBrains Mono

• Project Cards: Grid layout with difficulty badges (lv1/lv2/lv3), step-by-step instructions

• Resource Links: 2-column grid of external resources with hover effects, type badges

• Common Mistakes: Warning-styled list with specific error patterns and corrections

• AI Chat (Ask AI): Full floating panel with message history, typing indicators, markdown rendering, pin/copy actions

• AI Chat Modes: 5 behavioral modes (mentor/strict/friendly/interview/socratic) with system prompt switching

• Difficulty Levels: 3-tier difficulty (beginner/standard/advanced) affecting AI prompt construction

• Model Selection: 11-model catalog (3 Gemini + 8 NVIDIA) with persisted selection, provider-aware routing

• API Key Management: Dual-key storage (Gemini + NVIDIA) with eye toggle, status dots, last-4 preview

• Welcome Modal: First-time onboarding with optional key entry, dismiss persistence

• Quiz Generation: AI-generated quizzes with scope/count/type/difficulty selectors, prompt refinement engine

• Quiz Scoring: Per-question tracking, real-time score panel, color-coded results, explanation toggles

• Study Planner: AI-generated week-by-week plans with hours/day, duration, custom requirements

• Knowledge Graph: SVG node-edge diagram with phase-level dependencies, color-coded by completion

• Activity Heatmap: GitHub-style 26-week grid with 5 intensity levels, streak calculation

• Intervention System: 5-minute timer-based contextual prompts with dismiss/open actions

• Conversation History: Save/resume/delete chat sessions (max 20), reverse-chronological list

• Pinned Messages: Message pinning with persistent storage, inline display below chat

• Weakness Analysis: AI-powered gap detection with severity tagging, JSON response parsing

• AI Recommendations: Personalized next-step suggestions with priority badges

• Learning DNA: Computed learner profile (style/pace/strongest area) from activity patterns

• Level Progression: Weighted scoring from 5 signals with 6-tier level system, auto-difficulty suggestion

• Path Optimizer: AI-suggested next 3 modules with strategic reasoning

• Knowledge Mapper: AI-generated concept dependency analysis

• Module AI Buttons: Per-module Explain/Simplify/Example/Quiz/Interview quick actions

• Proxy Configuration: UI for entering proxy URL (non-functional placeholder)

## 3.2 Partially Implemented Features

**Settings Total Display:** Hardcoded to '22' but ALL_MODS array contains 39 modules. Line 8015: &lt;div class="stat-n" id="st-total"&gt;22&lt;/div&gt;. The progress percentage calculation uses TOTAL (39) correctly, but the settings display is wrong.

**Proxy/Tunnel:** UI exists with input field and save button. The callGemini() and callNvidia() functions check proxyUrl and prepend it to API URLs, but no proxy server is provided. The proxyHelpText explicitly states 'Leave empty to make direct API calls from browser (less secure).' This is a frontend-only configuration with no backend implementation.

**Quiz Scoring Integration:** recordQuizResult() updates globalMem.quizHistory but the quiz history is never used in computeLearnerLevel() beyond a basic average. The level system computes from quizHistory but most quiz data comes from variable quizAnswers which is never persisted.

## 3.3 Mock / Placeholder Features

**Authentication:** No authentication system. Any user with the file has full access.

**Multi-Device Sync:** No cloud sync. Import/export is manual file transfer.

**Notification System:** Toast notifications only. No push notifications, email nudges, or scheduled reminders.

**Project Submissions:** No mechanism to submit projects for review. 'Mark Complete' is a self-reported checkbox.

**Code Execution:** Code blocks are static display only. No sandbox, no runtime execution.

**Collaborative Features:** No cohorts, mentors, leaderboards, or social features.

# 4\. Function Analysis

This section analyzes every JavaScript function in the application (~120+ functions). Functions are grouped by subsystem.

## 4.1 Core Progress Functions

save(): Persists done (Set->Array), checks (object), changeLog, redoHistory to localStorage. Catches quota errors.

updateProgress(): Updates 8+ DOM elements (topbar fill/val, sidebar fill/pct/sub, settings stats). No virtual DOM.

markDone(id): Adds to Set, creates history entry with uid, debounced save, O(1) UI update, shows undo toast.

tick(el,id): Toggles check state with 300ms debounced save. Direct DOM class manipulation.

undoHistoryEntry(uid): Searches changeLog by uid, splices entry, deletes from done, moves to redoHistory.

redoHistoryEntry(uid): Reverses undo with fresh uid generation. Pushes new entry to changeLog.

## 4.2 Navigation Functions

showPhase(n): Toggles .on class on phase containers and tabs. Closes all cards, scrolls to top.

jumpToMod(phaseIdx,modId): Phase switch + card expand + double-requestAnimationFrame scroll.

toggleMC(id): Collapse-all-then-expand pattern. Scrolls only if card is above viewport.

scrollToCard(id): Calculates offsetTop minus 16px padding, uses smooth scroll.

buildSidebar(): Groups ALL_MODS by phase, creates DOM elements with done state classes.

## 4.3 AI Communication Functions

callModel(provider,modelId,systemPrompt,messages): Router to callGemini() or callNvidia().

callGemini(modelId,systemPrompt,messages): Direct fetch to generativelanguage.googleapis.com. Builds Gemini content format. Returns text extraction from candidates\[0\].content.parts\[0\].text.

callNvidia(modelId,systemPrompt,messages): Direct fetch to integrate.api.nvidia.com. Builds OpenAI-compatible format. Handles DeepSeek V4 thinking mode (disabled) and Qwen3 thinking (enable_thinking:false). Strips &lt;think&gt; blocks from output.

sendAskMessage(): Full message pipeline: validate->hide empty state->add user msg->typing indicator->build context->API call->add AI response->save memory->update summary every 10 msgs.

sendAgentMessage(): Similar pipeline for agent chat with loading spinner, mode-aware system prompt.

generateQuiz(): Two-step generation: prompt refinement (best-effort) then quiz generation with JSON parsing. Handles 5 question types.

generatePlanner(): Builds prompt from remaining modules + preferences, parses JSON response, renders week cards.

runWeaknessAnalysis(): Builds analytical prompt, calls AI, parses JSON array, renders severity-tagged tags.

generateRecommendations(): Builds prompt with progress + weaknesses, parses JSON, renders recommendation cards.

runPathOptimizer(): Full prompt with done/not-done/weaknesses, renders markdown response.

runAiKnowledgeMap(): Diagnostic prompt for knowledge relationship analysis.

## 4.4 Memory/State Functions

memLoad(key): Safe JSON.parse from localStorage with null fallback.

memSave(key,data): Safe JSON.stringify to localStorage with silent catch.

saveAllMemory(): Batch saves globalMem, askMem, agentMem, proxyUrl.

buildContext(type): Compiles roadmapCtx (current module, progress), userState (difficulty, DNA), memSnapshot (recent messages).

computeLearnerLevel(): Weighted composite from 5 signals (progress 0.35, engagement 0.20, consistency 0.15, quiz 0.20, sessions 0.10). Maps to 6 levels.

recordQuizResult(correct,total): Appends to quizHistory (max 50), triggers difficulty suggestion check.

trackActivity(): Increments daily counter in activityData.

getCurrentModuleId(): Checks .mc.expanded first, falls back to first card of active phase.

## 4.5 Visualization Functions

renderKnowledgeGraph(): DOM-based bar chart per phase. Clickable bars that open Ask AI.

renderNodeGraph(): SVG with Bezier-curved edges, 5-column grid layout, arrow markers, phase completion coloring.

renderHeatmap(): 26-week GitHub-style grid with month labels, 5-level intensity, tooltip titles, stats calculation.

calcBestStreak(): Iterates sorted activity dates, computes longest consecutive day streak.

renderMarkdown(): Lightweight regex-based markdown: code blocks, inline code, bold, italic, headings, lists, paragraphs.

renderQuiz(): Creates score panel + question cards with option click handlers.

checkAnswerV2(): Validates single-answer, shows correct/wrong styling, displays explanation, updates score.

updateQuizScore(): Real-time score calculation with color-coded results and completion detection.

renderPlanner(): Maps plan array to week cards with module tags and daily breakdown.

updateDNA(): Computes strongest area (by phase count), pace (modules/week), learning style (heuristic).

# 5\. Event System Analysis

The application uses inline HTML event handlers (onclick/onchange/onkeydown/oninput) almost exclusively. There is no event delegation pattern, no addEventListener for most interactions, and no event bus.

## 5.1 Click Handlers

Inline onclick attributes dominate: toggleMC(), markDone(), tick(), toggleSettings(), exportProgress(), resetProgress(), openAskAi(), openAgent(), sendAskMessage(), etc. Each DOM element that needs interactivity gets its own onclick attribute generated server-side in the HTML or dynamically injected via innerHTML.

## 5.2 Keyboard Handlers

**handleAskKeydown(e):** Enter sends message, Shift+Enter inserts newline. Prevents default on Enter.

**handleAgentKeydown(e):** Identical pattern for agent chat textarea.

**autoResizeTextarea(el):** oninput handler. Resets height to auto then sets to scrollHeight (max 120px).

## 5.3 Form/Input Events

Import file input uses onchange handler. History max input uses onchange. Theme switch and font size use onclick handlers. API key inputs use separate save buttons (not auto-save).

## 5.4 Dynamic Rendering Events

The initAISystem IIFE patches toggleMC and jumpToMod at runtime to inject module AI buttons. This is a monkey-patching pattern that wraps original functions with setTimeout-delayed injection. Phase switching uses classList.toggle with immediate DOM updates.

## 5.5 State Update Flow

State updates follow a direct-mutation pattern: (1) Modify in-memory variable (Set/object/array); (2) Call save() for localStorage persistence; (3) Call update functions that query and modify DOM directly. There is no reactive system, no diffing, and no batching beyond the 300ms debounce on tick().

# 6\. Data Architecture Analysis

## 6.1 Data Storage

**Primary Store:** localStorage only - 7 keys with 'airv3*' prefix for core data, 'aim*' prefix for AI data.

**Storage Keys:** airv3_done (completed modules), airv3_checks (self-assessments), airv3_theme, airv3_history, airv3_redo, airv3_hist_max, airv3_fs_content/ui, aim_global_mem_v1, aim_ask_mem_v1, aim_agent_mem_v1, aim_apikeys_v1, aim_proxy_url_v1, aim_activity_v1, aim_chat_sessions_v1

**Data Types:** JSON.stringify on Sets (converted to arrays), plain objects, arrays. No typed schema, no validation on load.

**Quota Handling:** Silent try/catch on all localStorage operations. Toast warning on quota exceeded.

## 6.2 Embedded Data

**ALL_MODS Array:** 39-entry array at line 8852 with id, name, phase, label per module. Source of truth for all module metadata.

**MODEL_CATALOG:** 11-entry array with provider, id, name, params, ctx, badge, desc per model.

**PREREQS Object:** Phase-level dependency graph (13 entries) in renderNodeGraph() function.

**HTML Content:** All module content (learning steps, projects, resources, checks) is static HTML embedded directly in the markup. No dynamic content loading.

## 6.3 State Management Pattern

Global mutable variables: done (Set), checks (object), changeLog/redoHistory (arrays), historyMax (number), globalMem/askMem/agentMem (objects), apiKeys (object), activityData (object). All state is module-level in the global scope. No encapsulation, no immutable updates. State reads are direct variable access; writes are direct mutation followed by save().

## 6.4 Limitations

**No Schema Versioning:** Core data has no version field. Import validates presence of 'done' array but no structural validation.

**No Migration Path:** If data structure changes, existing localStorage data could break.

**5-10MB Limit:** localStorage quota limits total data including chat history, activity data, and memory objects.

**No Concurrency Control:** Multiple tabs can overwrite each other's state. No locking or conflict resolution.

**Sync Issues:** No mechanism to sync across devices or browsers.

# 7\. UI Component Breakdown

## 7.1 Topbar

**Purpose:** Persistent chrome with brand, progress, actions

**Inputs:** done.size (for percentage), isDark (for theme toggle)

**State:** Active states on settings button, AI buttons

**Height:** 56px fixed, z-index 200, backdrop-filter blur

## 7.2 Phase Navigation

**Purpose:** Phase switching tabs

**Inputs:** 13 phase labels from ALL_MODS grouping

**Behavior:** Horizontal scroll, active state with accent color, scrollbar hidden

## 7.3 Sidebar

**Purpose:** Module navigation with progress overview

**Width:** 248px fixed, scrollable module list

**Sections:** Progress bar (percentage + count), module groups by phase with dot indicators

**State:** done Set determines .done class on module items

## 7.4 Module Cards

**Structure:** Head (click to expand) + Body (collapsible content)

**Content Sections:** Time budget bar, Why box, Learning steps, Code exercises, Projects, Common mistakes, Resources, Self-checks, Done button, AI action bar

**States:** Collapsed (default), Expanded (.open/.expanded classes)

## 7.5 Ask AI Panel

**Position:** Fixed bottom-right, 420px wide, z-index 500

**Components:** Header (orb+title+model chip+close), Mode bar (5 modes), Context strip, Pinned bar, Messages area, Quick actions, Difficulty row, Input area (textarea+send)

**State:** askPanelOpen (boolean), askMode, askDifficulty, askIsLoading, askMem.history\[\]

## 7.6 AI Agent Overlay

**Structure:** Full-screen overlay with topbar, sidebar nav (6 items), and 5 view panes

**Views:** Dashboard (stats+DNA+weakness+recommendations+heatmap), Deep Analysis (chat), Practice Engine (quiz config+render), Smart Planner (schedule), Knowledge Map (graphs)

**State:** agentOpen, agentMode, agentIsLoading, activeAgentView, agentMem

# 8\. Roadmap Rendering Analysis

## 8.1 Data Storage

All roadmap content is static HTML embedded directly in the document. There is no dynamic data loading, no JSON content API, and no content management system. Each module's learning steps, projects, resources, common mistakes, and self-assessment checks are hardcoded in the HTML. The ALL_MODS array at line 8852 contains only metadata (id, name, phase, label) - all rich content exists as pre-rendered HTML.

## 8.2 Rendering Pipeline

The rendering pipeline is: (1) HTML parsed by browser with all content in the DOM; (2) CSS hides non-active phases via .phase { display: none } and .phase.on { display: block }; (3) showPhase() toggles the .on class; (4) Module cards use display:none/block for expand/collapse via .mc-body/.mc-body.open classes; (5) No virtual DOM, no template engine, no component re-rendering. The entire content exists in the DOM at all times - only visibility changes.

## 8.3 Phase/Module Relationship

13 phase containers exist as sibling divs. Each phase contains its module cards. Phase tabs map by index (0-12) to phase containers. The ALL_MODS array provides the module-to-phase mapping for sidebar grouping and navigation.

## 8.4 Dependency Representation

The knowledge graph in renderNodeGraph() defines a hardcoded PREREQS object mapping each phase to its prerequisite phase indices. This is a simplified phase-level graph, not a module-level graph. The SVG renders nodes in a 5-column grid with quadratic Bezier curves for edges. Edge color indicates completion state of both connected phases.

# 9\. Frontend vs Backend Analysis

## 9.1 Current Frontend Responsibilities

UI Rendering: All HTML generation, CSS styling, DOM manipulation

State Management: localStorage read/write, in-memory state

User Interaction: Event handling, animations, scroll behavior

AI Integration: Direct API calls to Gemini and NVIDIA NIM

Content Display: Static HTML content rendering

Progress Calculation: Client-side percentage and statistics

Quiz Management: Question display, answer validation, scoring

Import/Export: File generation and parsing

Theme/Accessibility: Dark/light mode, font scaling

## 9.2 Missing Backend Responsibilities

Authentication & Authorization: No user accounts, sessions, or roles

Data Persistence: No database; localStorage only

API Key Security: Keys stored client-side; should be server-side with user-specific encryption

AI Proxy: No backend proxy to protect API keys and handle rate limiting

Content Management: Static HTML; should be CMS-driven for updates

Quiz Storage: Generated quizzes not persisted; no question bank

Progress Sync: No cross-device synchronization

Analytics: No server-side activity tracking or reporting

Notification System: No email/push notification service

Project Review: No submission pipeline or rubric-based grading

User Management: No profiles, preferences server, or social features

Content Versioning: No schema versioning for exports or roadmap updates

## 9.3 Required API Endpoints (for production)

POST /auth/login | POST /auth/register | POST /auth/refresh

GET /api/roadmap (phases + modules + content)

GET /api/modules/:id (detailed module content)

POST /api/progress/:moduleId/complete

PATCH /api/progress/:moduleId/checks (batch check update)

GET /api/progress (full user progress)

POST /api/quiz/generate (AI quiz generation with caching)

POST /api/quiz/:quizId/submit (score recording)

GET /api/quiz/history (past quiz results)

POST /api/ai/chat (proxied AI chat)

POST /api/ai/analyze (weakness analysis)

POST /api/ai/plan (study plan generation)

GET /api/activity (heatmap data)

POST /api/export (progress export)

POST /api/import (progress import with validation)

# 10\. NVIDIA API Integration Analysis

## 10.1 Integration Status: FUNCTIONAL with CRITICAL SECURITY GAPS

The NVIDIA NIM integration is fully functional. The callNvidia() function makes real HTTP requests to <https://integrate.api.nvidia.com/v1/chat/completions> using the OpenAI-compatible API format. It supports 8 models from the NVIDIA catalog including DeepSeek V4 Pro, Qwen3.5, GLM-5.1, Llama 3.3 70B, and Nemotron Ultra 253B.

## 10.2 Request Flow

(1) User enters NVIDIA API key in modal -> stored in localStorage as aim_apikeys_v1; (2) User selects NVIDIA model in model switcher -> selection persisted to localStorage; (3) On message send, sendAskMessage() or sendAgentMessage() determines provider based on selected model; (4) callModel() routes to callNvidia(); (5) callNvidia() constructs OpenAI-compatible request with system prompt + messages; (6) Special handling for DeepSeek V4 (thinking disabled via extra_body) and Qwen3 (enable_thinking:false); (7) fetch() POST with Authorization: Bearer &lt;key&gt; header; (8) Response parsed: choices\[0\].message.content with &lt;think&gt; block stripping; (9) Text rendered as markdown in chat panel.

## 10.3 Authentication

**Method:** API key provided by user, stored in localStorage unencrypted

**Header:** Authorization: Bearer &lt;nvapi-...&gt;

**Source:** build.nvidia.com free tier

**Risk:** Key is visible in browser DevTools, localStorage, and network tab. No key rotation, no usage limits enforced client-side.

## 10.4 Error Handling

Errors caught at fetch level: non-OK responses parsed for error.message or error.detail; specific error messages for NO_NVIDIA_KEY, 429 rate limit. Network failures show generic error in chat UI. No retry logic, no exponential backoff, no circuit breaker.

## 10.5 Weaknesses

**CRITICAL:** API keys exposed in client-side code and localStorage

**HIGH:** Direct browser-to-NVIDIA calls means keys travel over network from browser

**HIGH:** No rate limiting or quota management; user could exhaust free credits

**MEDIUM:** No response caching; identical prompts re-fetch every time

**MEDIUM:** No request/response logging for debugging

**LOW:** &lt;think&gt; block stripping is regex-based and fragile

# 11\. NVIDIA Proxy Tunnel Analysis

## 11.1 Current State: FRONTEND-ONLY PLACEHOLDER

The proxy implementation consists of a UI input field (proxyUrlInput), a save button, and conditional URL construction in API call functions. When proxyUrl is set, the API calls prepend it to the base URL: \`\${proxyUrl}/nvidia\` or \`\${proxyUrl}/gemini\`. However, NO proxy server implementation is provided. The application does not ship with a proxy. The proxyHelpText explicitly documents: 'Leave empty to make direct API calls from browser (less secure).'

## 11.2 What Exists

\- UI: Input field in Settings panel with save button and help toggle

\- Storage: proxyUrl stored in localStorage as aim_proxy_url_v1

\- URL Logic: callGemini() and callNvidia() check proxyUrl and use it if present

\- Documentation: Inline help text explaining proxy purpose

## 11.3 What Is Missing

**Proxy Server:** No backend server exists to forward requests

**Route Handlers:** No /nvidia or /gemini routes implemented anywhere

**Authentication:** No proxy authentication or session management

**Rate Limiting:** No per-user or global rate limiting

**Logging:** No request/response logging

**CORS Handling:** No CORS configuration (though proxy would solve CORS by being same-origin)

**Key Management:** No server-side key storage or rotation

**Error Translation:** No proxy-level error handling or graceful degradation

## 11.4 Security Risks of Current Approach

Without a proxy, every API request carries the user's key in the Authorization header visible in browser DevTools Network tab. The key is also stored in localStorage without encryption, accessible to any JavaScript running on the page (including potential XSS payloads). The NVIDIA key prefix 'nvapi-' is distinctive and easily scrapable by malicious scripts.

### 11.5 Production Proxy Architecture

A production proxy would require: Node.js/Express or Python/FastAPI backend; /nvidia and /gemini POST routes; API key storage in environment variables or secrets manager; Bearer token or session-based proxy auth; per-user rate limiting (Redis); request/response logging; circuit breaker for upstream failures; response streaming for real-time chat; health check endpoint.

# 12\. Security Audit

## 12.1 CRITICAL: Exposed API Keys

API keys for both Gemini and NVIDIA are stored in localStorage as plaintext JSON. The keys are loaded into memory on page load and used in fetch() calls from the browser. This means: (1) Keys are visible in browser DevTools > Application > Local Storage; (2) Keys are visible in DevTools > Network > Request Headers; (3) Any XSS vulnerability would have immediate access to keys; (4) Browser extensions can read localStorage; (5) No key rotation or expiration mechanism exists.

**Fix:** Move all API calls to a backend proxy. Store keys server-side encrypted with per-user AES-256-GCM. Never transmit keys to the client.

## 12.2 HIGH: XSS Vulnerabilities

The renderMarkdown() function processes AI-generated content through regex replacements but does NOT sanitize HTML. While it escapes & &lt; &gt; before processing, the regex-based markdown conversion could be bypassed. AI responses containing malicious HTML would be inserted into the DOM via innerHTML in addAskMessage() and addAgentMessage().

**Fix:** Use DOMPurify or similar library to sanitize all AI-generated HTML before DOM insertion. Implement CSP headers.

## 12.3 HIGH: No Content Security Policy

There are no CSP meta tags or headers. The application loads Google Fonts from external CDN, makes fetch() calls to multiple external APIs, and uses inline event handlers. A CSP would need to allow 'unsafe-inline' for scripts due to the extensive use of onclick attributes, limiting its effectiveness.

**Fix:** Move all inline handlers to addEventListener, then implement strict CSP with nonce-based script approval.

## 12.4 MEDIUM: No Input Validation

Import progress accepts any JSON file with minimal validation (checks for 'done' array). Malformed data could corrupt application state. API responses from AI providers are not schema-validated - JSON parsing errors are caught but error messages are displayed unsanitized.

## 12.5 MEDIUM: localStorage Enumeration

All data keys use predictable prefixes ('airv3*', 'aim*'). Any script on the page can enumerate and read all stored data. This includes: completed modules, self-assessment answers, chat history, API keys, and activity patterns.

## 12.6 LOW: URL Parameters Not Sanitized

The escapeStr() function handles backslash, quote, and newline escaping but is used only for quiz explanation text in HTML generation. It is not a comprehensive HTML entity encoder.

# 13\. Performance Analysis

## 13.1 DOM Performance

**Initial Load:** All 11,810 lines parse at once, including ~7,800 lines of content HTML. All module cards exist in DOM from startup. With 39 modules each containing steps, projects, and resources, the initial DOM node count is approximately 3,000-5,000 elements.

**Phase Switching:** O(1) - toggles CSS display property. No DOM creation/destruction. Very fast.

**Card Expand:** O(N) where N = number of cards - collapseAll iterates every .mc-body. For 39 cards this is negligible.

**Sidebar Build:** O(M) where M = 39 modules. Creates DOM elements on init only.

## 13.2 Memory Usage

Estimated heap: HTML DOM (~5MB) + JavaScript state (<100KB) + localStorage data (<500KB typical) = ~5-6MB active memory. Chat history with long AI responses could grow significantly since all messages stored in askMem.history (max 40 entries) and localStorage. Image/video content is minimal (no embedded media).

## 13.3 Rendering Performance

CSS uses GPU-accelerated properties (transform, opacity) for panel animations. backdrop-filter blur on fixed elements may cause compositing overhead. The zoom CSS property for font scaling forces re-layout of entire chrome areas. SVG knowledge graph renders once per view switch. Heatmap creates ~182 DOM cells (26 weeks x 7 days) per render.

## 13.4 Event Listeners

No listener cleanup - all events use inline handlers (onclick etc) which don't need removal. The initAISystem patches toggleMC and jumpToMod by wrapping window functions. Chat history array can grow to 40 entries; agent chat to 30. No memory leaks detected from event subscriptions, but long-running sessions accumulate DOM nodes in chat containers.

## 13.5 Optimization Recommendations

Implement virtual scrolling for module cards (render only visible phases)

Lazy-load AI chat messages (remove old messages from DOM, keep in memory)

Use requestIdleCallback for non-urgent operations (heatmap render, DNA update)

Debounce all scroll handlers (currently no scroll events used)

Consider IntersectionObserver for phase visibility tracking

Minimize CSS zoom usage (causes full layout recalculation)

# 14\. Scalability Analysis

## 14.1 Current Architecture: Single-User Only

The application is fundamentally a single-user, single-device, single-browser experience. Every aspect of the architecture assumes one learner on one machine. There are no concurrency controls, no multi-tenancy considerations, and no server-side state.

## 14.2 User Scale Assessment

**1 User (current):** Fully functional. localStorage handles data. No issues.

**1,000 Users:** If distributed as a file (email/download), each user runs independently. No infrastructure needed. If deployed as a static site, CDN handles distribution. API keys are per-user. No central coordination required.

**10,000 Users:** Static deployment on Vercel/Netlify works fine. The concern shifts to AI API costs - if platform-provided keys are used, rate limits and quotas become bottlenecks. Users bringing their own keys (BYOK) as currently designed scales infinitely for API costs.

**100,000 Users:** Requires backend. localStorage approach fails for cross-device sync. Need: user authentication, database for progress, API proxy for key security, CDN for static assets. Database choice (PostgreSQL) handles this scale easily.

**1,000,000 Users:** Requires full production architecture: horizontally-scaled API servers, read replicas, caching layer (Redis), CDN, managed database. The curriculum content should move from static HTML to a database/CMS for updates. Event sourcing for progress tracking.

## 14.3 Bottlenecks

localStorage quota: ~5-10MB limit per domain

No database: All filtering, search, analytics are client-side only

No caching: AI responses not cached; repeated questions re-fetch

Single file: 700KB download for all content regardless of what user needs

AI API rate limits: Free tiers have RPD/RPM limits that affect UX

No CDN: No geographic distribution of content

# 15\. Complete Rebuild Blueprint

## 15.1 Frontend Architecture

**Framework:** Next.js 15 with App Router (React Server Components for content, Client Components for interactivity)

**Language:** TypeScript with strict mode

**Styling:** Tailwind CSS v4 with CSS variables for theming

**State:** Zustand for client state, TanStack Query for server state

**UI Library:** shadcn/ui components with Radix primitives

**Animations:** Framer Motion for panel transitions, GSAP for scroll animations

## 15.2 Backend Architecture

**Runtime:** Node.js with Hono framework (lightweight, edge-compatible)

**API Style:** tRPC for type-safe internal API, REST for external

**Auth:** OAuth 2.0 (Google/GitHub) + JWT sessions + refresh tokens

**Database:** PostgreSQL 16 with Drizzle ORM

**Cache:** Redis (Upstash) for sessions, rate limiting, and AI response caching

**File Storage:** S3-compatible (Cloudflare R2) for exports and uploads

## 15.3 AI Architecture

**Proxy:** Hono backend proxies all AI requests

**Key Management:** BYOK encrypted with KMS; pooled free-tier keys with circuit breaker

**Providers:** Primary: Gemini Free Tier (1000 RPD), NVIDIA NIM Free Credits, Groq Free Tier, Together AI Free Credits, Cerebras Free Tier; Fallback: self-hosted via Ollama/vLLM

**Response Caching:** Redis cache for identical prompts (24hr TTL)

**Streaming:** SSE for real-time chat responses

**Dead-End Handler:** If all providers fail (429/outage), degrade to cached templates + static question bank

## 15.4 Database Schema

**Users:** id, email, name, avatar, role, createdAt

**Progress:** userId, moduleId, state (locked|unlocked|in_progress|complete), masteryScore, startedAt, completedAt

**CheckItems:** id, moduleId, label, orderIndex

**UserChecks:** userId, checkId, checked, updatedAt

**Assessments:** id, moduleId, generatedBy, difficulty, schemaVersion

**Questions:** id, assessmentId, stem, options, answerKey, explanation, tags

**QuestionBank:** id, moduleId, difficulty, question JSON, source, isActive

**Attempts:** id, assessmentId, userId, score, weakTags, answers

**AIConversations:** id, userId, mode, title, createdAt, updatedAt

**AIMessages:** id, conversationId, role, content, modelProvider, modelName, moduleId, tokenCount

**ProviderCredentials:** id, userId, provider, encryptedApiKey, status, lastUsedAt, usageCount, errorCount

**ActivityEvents:** id, userId, eventType, moduleId, payload, createdAt (partitioned by month)

## 15.5 API Architecture

RESTful API with versioning (/api/v1/). Authentication via Bearer JWT. Rate limiting per user (100 req/min for general, 20 req/min for AI). Request validation via Zod schemas. Response caching via ETags for static content.

## 15.6 Deployment Architecture

**Frontend:** Vercel (edge network, ISR for roadmap content)

**API:** Hono on Cloudflare Workers (edge computing, low latency globally)

**Database:** Neon PostgreSQL (serverless, branching)

**Cache:** Upstash Redis (serverless, global)

**Storage:** Cloudflare R2 (S3-compatible, zero egress fees)

**AI Proxy:** Same Hono backend with provider registry and failover logic

**Monitoring:** Vercel Analytics + custom OpenTelemetry

## 15.7 CI/CD Pipeline

GitHub Actions: lint (ESLint) -> typecheck (tsc) -> test (Vitest) -> build -> deploy preview (PR) / deploy production (main). Database migrations via Drizzle Kit. Semantic versioning with automated changelogs.

# 16\. Module-by-Module Breakdown

This section analyzes each functional module found in the HTML with rebuild recommendations.

## 16.1 Roadmap Display Module

**Features:** Phase navigation, module cards with expand/collapse, sidebar navigation, progress tracking

**Functions:** showPhase, jumpToMod, toggleMC, buildSidebar, scrollToCard, \_closeAllCards

**Dependencies:** ALL_MODS array, CSS phase.on/mc.expanded classes

**State:** Current phase index, expanded module id

**Backend:** GET /api/roadmap (phases+modules), GET /api/modules/:id/content

**Rebuild:** Server-rendered with Next.js RSC; client hydration for interactivity; virtual scroll for large module lists

## 16.2 Progress Tracking Module

**Features:** Module completion, self-checks, undo/redo, history log, import/export, reset

**Functions:** markDone, tick, undoHistoryEntry, redoHistoryEntry, exportProgress, importProgress, resetProgress, save

**Dependencies:** localStorage, done Set, checks object, changeLog/redoHistory arrays

**State:** Full progress state (module completion + individual checks)

**Backend:** POST /api/progress/:moduleId/complete, PATCH /api/checks/:checkId, GET /api/progress, POST /api/import, POST /api/export

**Rebuild:** Server-persisted with optimistic UI updates; idempotent operations; event-sourced audit log

## 16.3 AI Chat Module (Ask AI)

**Features:** Floating chat panel, 5 behavioral modes, 3 difficulty levels, model selection, message history, pinned messages, conversation save/resume, markdown rendering

**Functions:** openAskAi, closeAskAi, sendAskMessage, addAskMessage, buildAskSystemPrompt, togglePin, renderPinnedBar, handleAskKeydown, setAskMode, setDifficulty

**Dependencies:** askModel, askMode, askDifficulty, askMem, apiKeys, callModel, renderMarkdown

**Backend:** POST /api/ai/chat (proxied), POST /api/ai/sessions, GET /api/ai/sessions/:id

**Rebuild:** React state management with Zustand; SSE streaming responses; debounced input; message persistence

## 16.4 AI Agent Module

**Features:** Full-page dashboard, weakness analysis, recommendations, quiz engine, smart planner, knowledge graphs, path optimizer, deep analysis chat

**Functions:** openAgent, showAgentView, updateAgentDashboard, runWeaknessAnalysis, generateRecommendations, generateQuiz, generatePlanner, renderKnowledgeGraph, renderNodeGraph, renderHeatmap, runPathOptimizer, runAiKnowledgeMap

**Dependencies:** agentModel, agentMode, agentMem, globalMem, callModel, all visualization functions

**Backend:** POST /api/ai/analyze, POST /api/ai/plan, POST /api/quiz/generate, GET /api/activity, POST /api/ai/recommendations

**Rebuild:** Separate dashboard views with independent data fetching; server-side quiz caching; scheduled analysis jobs

## 16.5 Quiz Engine Module

**Features:** AI-generated quizzes with 5 types, 5 scopes, 5 difficulties, prompt refinement, per-question scoring, explanations, score panel

**Functions:** generateQuiz, renderQuiz, checkAnswerV2, updateQuizScore, toggleExplanation, recordQuizResult

**Dependencies:** agentModel, apiKeys, callModel, escapeStr, globalMem.quizHistory

**Backend:** POST /api/quiz/generate (with caching), POST /api/quiz/:id/submit, GET /api/quiz/history

**Rebuild:** Deterministic question bank as primary source; AI augmentation for explanations only; strict JSON schema validation

## 16.6 Settings Module

**Features:** Theme toggle, font size adjustment, proxy config, stats display, history log, reset

**Functions:** toggleSettings, toggleTheme, applyTheme, adjustFS, applyFS, saveProxyUrl, toggleProxyHelp, renderHistoryPanel

**Dependencies:** localStorage, isDark, fsContent/fsUi, proxyUrl, changeLog/redoHistory

**Backend:** PATCH /api/users/:id/preferences, POST /api/proxy/configure

**Rebuild:** User preferences in database; real-time sync across devices; proxy configuration with health check

# 17\. Missing Features & Recommendations

## 17.1 Implied by UI but Not Implemented

Notification System: notification_preferences table specified but no actual notification delivery

Email Nudges: Referenced in architecture but no email service integration

Mobile App: React Native mentioned in future extensions only

Code Execution Sandboxes: Referenced for NumPy/PyTorch labs but not implemented

AI Project Reviewer: Mentioned but no submission/review pipeline

Cohort/Mentor Dashboards: Referenced for teams but no multi-user features

Capstone Marketplace: Referenced as future extension

## 17.2 Partially Implemented

**Proxy/Tunnel:** UI complete but no backend. Recommendation: Implement Hono-based proxy with provider routes, rate limiting, and key encryption.

**Quiz System:** Full UI but no question bank or persistence. Recommendation: Implement deterministic question bank as primary source; AI for explanation generation only.

**Level Progression:** Calculates from quizHistory but history not persisted. Recommendation: Persist all quiz results server-side with weighted scoring formula.

## 17.3 Requires Backend Support

Authentication: OAuth + JWT sessions

Cross-device sync: Server as source of truth

Quiz persistence: Store generated quizzes and results

Activity analytics: Server-side event collection

Content management: Database-driven curriculum for updates

Project submissions: Upload + review workflow

Notification system: Email/push delivery service

API key security: Server-side storage with proxy

Collaborative features: Real-time multiplayer state

## 17.4 Final Recommendations

Priority 1 - Security: Implement backend proxy immediately. Never let API keys touch the client. Encrypt stored keys with KMS. Add CSP headers and sanitize all AI-generated HTML.

Priority 2 - Data: Move from localStorage to PostgreSQL. Implement proper schema versioning. Add idempotent progress APIs with optimistic UI.

Priority 3 - Content: Migrate static HTML to a CMS/database. Implement content versioning. Build an HTML parser to automate migration of the 39 modules.

Priority 4 - AI Reliability: Build deterministic question bank so quizzes work without AI. Implement provider failover with circuit breaker. Cache AI responses. Add dead-end handlers for all AI failure modes.

Priority 5 - Scale: Add Redis caching, CDN distribution, and database read replicas. Implement event sourcing for progress tracking. Add monitoring and alerting.