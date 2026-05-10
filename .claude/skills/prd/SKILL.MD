---
name: prd
description: Write a Product Requirements Document (PRD) from conversation context and codebase understanding. Use this skill when the user explicitly wants to create a PRD, or when they're trying to flush out, plan, or define a feature — phrases like "let's create a PRD", "I want to plan this feature", "let's define what this should do", "help me think through this feature", "let's flesh this out as a product", or "I want to document this idea". Do NOT trigger for technical specs, implementation plans, ERDs, or architecture diagrams — those are separate skills. The skill interviews the user to ground the idea, explores the codebase to understand the current state, sketches modules, and produces a structured .md PRD file. Always use this skill for PRD work — don't just write a PRD freehand.
---

# PRD Skill

Produces a grounded, well-structured Product Requirements Document by combining conversation context, codebase exploration, and a structured user interview. The PRD can be saved as a `.md` file in the repo or pushed directly to any connected tool (ClickUp, Google Drive, Notion, etc.) — Claude detects what's available and prompts the user to choose, unless they've already specified.

The template lives at `assets/prd-template.md`. Read it before writing the PRD.

---

## Process Overview

```
1. Explore the repo to understand the current state of the codebase, if you haven't already and if a repo is available
2. Interview user — upfront questions to ground the idea
3. Sketch modules — confirm with user
4. Write PRD using template → output as .md file
5. Review pass — poke holes, flag gaps, ask follow-up questions
6. Revise if needed
```

---

## Step 1 — Explore the Codebase

If a codebase is available in the current context or filesystem, explore it before doing anything else.

**What to look for:**

- Tech stack (package.json, requirements.txt, Gemfile, go.mod, etc.)
- Folder structure — identify major modules, layers (frontend, backend, infra)
- Existing data models (ORM files, schema files, migration files, types)
- Routing and API structure
- Any existing docs, changelogs, or iteration folders (look for patterns like `docs/iterations/`, `docs/prd/`, `specs/`, `planning/`, `versions/` — note the naming convention for later)
- Test setup (what is tested, what isn't)

Summarise what you found in 3–5 sentences before moving to the interview. This summary will anchor the Technical Considerations and Data Models sections.

If no codebase is available, skip this step and note it in the Technical Considerations section.

---
## Step 2 — Upfront Interview

Before writing anything, ask the user a focused set of questions to ground the idea. The goal is to understand the what and why well enough to write a first draft — not to gather every detail.

**Core questions to always ask:**

1. What problem does this solve, and who experiences it?
2. What does success look like — what changes for the user once this is built?
3. What are the 2–3 most important things this must do? What explicitly should it not do?
4. Are there any hard constraints — technical, timeline, regulatory, or otherwise?
5. Are there edge cases or failure modes you're already worried about?

**Poke holes — don't just accept the brief.** If something is vague, ambiguous, or contradicts the codebase state, call it out. Examples:

- "You said X, but the current codebase already does Y — are you replacing it or extending it?"
- "You mentioned Z as a goal but also said it's out of scope — which is it?"
- "Who owns this data if a user is deleted? Have you thought through that?"

Wait for answers before proceeding. Clarify until you have enough to write a grounded first draft.

---

## Step 3 — Sketch Modules

Based on the codebase exploration and the interview, identify the major modules that need to be built or modified.

For each module, think about:
- What it encapsulates (its responsibility)
- Whether it's new or a modification of something existing
- Whether it could be a **deep module** — one with a lot of internal logic behind a simple, stable interface that could be tested in isolation

Present the module list to the user and confirm:

> "Here's how I'm thinking about the major pieces. Does this match your expectations? Are there any you'd want tests written for?"

Wait for confirmation before writing the PRD. Adjust based on feedback.

---

## Step 4 — Determine Output Format & Location

Before writing anything, confirm where the PRD should live. **If the user has already specified an output format or destination in their instructions, use it and skip the prompt entirely.**

### If the user hasn't specified

1. Check which connectors/tools are currently available in context (e.g. ClickUp, Google Drive, Notion, Linear, Jira, or any other MCP-connected tool that can store documents or tasks).
2. Build the options list dynamically:
   - **Always include:** Markdown file in the repo (`.md`)
   - **Also include:** any connected tool that can meaningfully store a PRD (document, task, or page)
3. Present the options to the user and wait for their choice before proceeding.

Example prompt (adapt to whatever connectors are actually available):

> "Where would you like the PRD to live?
> 1. Markdown file in the repo (e.g. `docs/prd/feature-name.md`)
> 2. ClickUp — as a Document or Task
> 3. Google Drive — as a Doc"

---

### Option: Markdown file in the repo

1. Look at the codebase for existing doc/iteration folder patterns (e.g. `docs/iterations/`, `docs/prd/`, `specs/v1/`, `planning/`). If found, note the convention.
2. Ask: "I found docs are typically stored at `{{FOUND_PATH}}` — should I write the PRD there, or somewhere else?"
3. If no pattern was found: "Where would you like the PRD saved? (e.g. `docs/prd/v1.0.md`)"

Write the file to the confirmed path.

---

### Option: Connected tool (ClickUp, Google Drive, Notion, etc.)

Adapt based on which tool was chosen. General approach:

1. Ask where within the tool the PRD should go (workspace, space, folder, drive — whatever the tool uses). Search the tool's hierarchy if you can, and suggest a sensible default.
2. Create the PRD as a document, page, or task with description — whichever is the most natural fit for long-form content in that tool.
3. Confirm the link/URL after creation.

**ClickUp-specific:** prefer `clickup_create_document` + `clickup_create_document_page` for full PRDs; use `clickup_create_task` only if the user wants the PRD to double as a backlog item.

**Google Drive-specific:** use the Google Drive MCP to create the file; confirm the shared link after.

---

## Step 5 — Write the PRD

Read `assets/prd-template.md` first, then fill it in using everything gathered. Write to the destination confirmed in Step 4.

**Guidelines for each section:**

- **User Stories:** Write a long, numbered list — be exhaustive. Cover the primary happy path, secondary actors, edge cases, error states, and empty states. Every requirement in Features & Requirements should trace back to at least one user story. Format strictly: "As a [persona], I want [capability], so that [benefit]." Don't collapse multiple needs into one story.

- **Overview:** Sharp and specific. Product Summary is 2–4 sentences max. Goals are outcomes, not features. Non-Goals are deliberate choices, not just things you haven't thought about yet.

- **Features & Requirements:** One subsection per major feature or screen. Requirements are bullet points — each one should be verifiable. Avoid vague language like "should be fast" or "easy to use".

- **UI/UX Guidelines:** Fill in from the interview. Keep it opinionated and actionable, not generic.

- **Technical Considerations:**
  - Stack: pull from codebase if found, otherwise use what was discussed.
  - Data Models: one block per entity, high-level only — entity name, description, key fields, relationships. If there's non-trivial business logic (formulas, state machines, pricing rules), add a **Business Logic** sub-section under 4.2.
  - Key Constraints: decisions that will shape implementation (e.g. "must use existing auth system", "no new dependencies", "must be backward-compatible with v1 schema").
  - Modules: use the confirmed list from Step 3.

- **Non-Functional Requirements:** Be specific with targets (e.g. "< 500ms p95 response time", "5 MB max image upload"). Avoid vague placeholders if you can infer reasonable defaults from the codebase or conversation.

- **Out of Scope:** Things that came up during the interview but were explicitly deferred. Be deliberate — if it's not in here, engineering may assume it's in scope.

- **Open Questions:** Treat this as a living list — not something assembled at the end. Any time an ambiguity, unresolved decision, or dependency surfaces during the interview, module sketching, or writing, add it to the Open Questions table immediately. As questions get resolved (during the interview or review pass), remove them from the table and fold the resolution into the relevant section. Only genuinely unresolved questions should remain in the final document.

Write the file to the confirmed path.

---

## Step 6 — Review Pass

After writing, re-read the full PRD and check:

- Are there features with no clear acceptance criteria?
- Are there entities referenced in features but not described in Data Models?
- Are there open questions that would block engineering from starting?
- Does Out of Scope reflect everything discussed but deferred?
- Do the Goals and Features actually correspond to each other?

Surface issues to the user:

> "Here's the first draft — a few things I think still need attention: [list]. Want to resolve these now or leave them as open questions for the team?"

As the user resolves each one, remove it from the Open Questions table and update the relevant section. Leave only what is genuinely unresolved for the team.

---

## Output

One of the following, depending on the destination chosen in Step 4:

- **Markdown file** — a single `.md` at the confirmed repo path, structured per `assets/prd-template.md`
- **Connected tool** — a document, page, or task in the chosen tool (ClickUp, Google Drive, Notion, etc.), confirmed with a link

Regardless of format, the PRD should be self-contained — a new engineer who hasn't seen the conversation should be able to read it and understand what to build and why.