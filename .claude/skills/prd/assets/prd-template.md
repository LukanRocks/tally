# Product Requirements Document
## {{PRODUCT_NAME}}

**Version:** {{VERSION}}
**Status:** Draft
**Last Updated:** {{DATE}}

---

## 1. Overview

### 1.1 Product Summary

{{HIGH_LEVEL_DESCRIPTION}}

### 1.2 Goals

- {{GOAL_1}}
- {{GOAL_2}}

### 1.3 Non-Goals

- {{NON_GOAL_1}}
- {{NON_GOAL_2}}

---

## 2. User Stories

> A comprehensive, numbered list covering all aspects of the feature. Be exhaustive — edge cases, error states, and secondary actors included. Format: "As a [persona], I want [capability], so that [benefit]."

1. As a {{PERSONA}}, I want {{CAPABILITY}}, so that {{BENEFIT}}.
2. As a {{PERSONA}}, I want {{CAPABILITY}}, so that {{BENEFIT}}.

---

## 3. Features & Requirements

### 3.1 {{FEATURE_NAME}}

{{FEATURE_DESCRIPTION}}

**Requirements:**

- {{REQUIREMENT_1}}
- {{REQUIREMENT_2}}

---

## 4. UI/UX Guidelines

> Cross-cutting principles that should inform design from the start, not afterthoughts.

- **Responsiveness:** {{RESPONSIVE_TARGET}} (e.g. desktop-first, tablet and mobile best-effort)
- **Navigation:** {{NAV_PATTERN}} (e.g. persistent sidebar, top nav)
- **Destructive actions:** Always require a confirmation dialog before execution.
- **Empty states:** All list/grid views must include a clear call-to-action when empty.
- **Error states:** API errors must surface a readable message — never a blank screen.
- **Loading states:** {{LOADING_APPROACH}} (e.g. skeleton screens, spinners)
- {{ADDITIONAL_UX_GUIDELINE}}

---

## 5. Technical Considerations

> Opinionated direction for implementation — not a full spec. A separate implementation skill will produce the detailed scope and plan.

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| {{LAYER}} | {{TECHNOLOGY}} | {{NOTES}} |

### 5.2 Data Models

> High-level entity overview. Field-level detail lives in the implementation plan.

#### {{ENTITY_NAME}}

{{ENTITY_DESCRIPTION}}

Key fields: {{KEY_FIELDS}}

Relationships: {{RELATIONSHIPS}}

> If non-trivial business logic governs how entities relate or are calculated (e.g. a scoring formula, a state machine, a pricing rule), describe it here under a **Business Logic** sub-section so engineering has enough context to estimate.

### 5.3 Key Constraints & Decisions

- {{CONSTRAINT_OR_DECISION_1}}
- {{CONSTRAINT_OR_DECISION_2}}

### 5.4 Modules to Build or Modify

> Major modules identified from codebase exploration. Mark whether each is new or a modification.

| Module | New / Modify | Notes |
|---|---|---|
| {{MODULE_NAME}} | New | {{WHAT_IT_DOES}} |
| {{MODULE_NAME}} | Modify | {{WHAT_CHANGES}} |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| {{REQUIREMENT}} | {{TARGET}} |

---

## 7. Out of Scope ({{VERSION}})

- {{OUT_OF_SCOPE_1}}
- {{OUT_OF_SCOPE_2}}

---

## 8. Open Questions

> Living list — questions are added as they surface throughout the process and removed as they are resolved. Only genuinely unresolved items should remain here at handoff.

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | {{QUESTION}} | Product | Open |
| 2 | {{QUESTION}} | Engineering | Open |

---

*End of Document*