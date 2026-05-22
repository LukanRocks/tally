# About this project

---

Tally is a personal project — a self-hosted board game collection manager built for tracking play sessions and leaderboards with a small group of friends.

Beyond the app itself, Tally is also a deliberate experiment in AI-assisted software development. Every line of code was written with the help of [Claude](https://claude.ai), Anthropic's AI assistant. The goal is to observe and understand the qualities, patterns, and failure modes of AI-assisted development on a low-risk personal project — where experimenting freely is safe and the feedback loop is fast.

## Why build it this way?

I work as a product manager for a while now and even though I can read code, follow logic, reason about systems, I'm not a programer nor software engineer. I've built small things on my own over the years, enough to have a homelab running and a few side projects here and there. But there's a gap between understanding code or the implementation of the individual pieces that make a application and be able to ship full projects, and that gap has always frustrated me.

The problem isn't that I can't code. It's that I don't do it often enough for it to feel effortless. I forget language features. I relearn the same libraries every time I come back to them. I hit specific problems I've solved before but can't remember how, and I lose hours going through forums and documentation trying to find the answer again. The friction compounds, motivation drops, and projects stall.

AI changes that dynamic. Not because it writes the code for me — but because it removes the part that used to stall me. Instead of bashing my head against a wall looking for a syntax I forgot or a pattern I saw once, I just ask. The conversation keeps moving. The idea stays alive long enough to become a thing.

Most discussions about AI coding tools focus on speed. This project is more interested in something different: **getting ideas out of my head and into something that works**, learning along the way rather than in spite of the process.

The deeper question it's trying to answer is whether a structured approach can produce AI-generated code that is actually readable and maintainable, not just vibe-coded into existence and abandoned the moment something breaks. I want to build something small that makes me and my friends happy, with code I can understand, change, and be proud of. No customer data at risk, no team to unblock, no deadline. Just the quiet satisfaction of making something, even if that something required a lot of help.

## The development process

On my current process, each feature follows a three-stage process, with each stage running in a separate AI context window. The separation is intentional, it forces decisions to be made explicitly before implementation begins, rather than letting a coding agent make product and architecture decisions on the fly.

### 1. PRD — Product Requirements Document

A new context window is used to define the feature: what it does, what it doesn't do, edge cases, and open questions. The output is a structured markdown document stored in `assets/changes/vN/prd.md`.

### 2. ERD — Engineering Requirements Document

A separate context reads the PRD and the codebase to produce a technical plan: data model changes, API design, component structure, and implementation decisions. The output is stored alongside the PRD as `changes/vN/erd.md`.

### 3. Implementation

A third context reads both documents and implements the feature against those definitions. It doesn't make product decisions, those were already made. It doesn't invent data models, those were already designed, it just executes on the plans.

## What this produces

Each version folder is a paper trail of what was planned, why it was designed that way, and what was built. They might get stale because things change but it allows to look back and understand any part of the codebase without relying on git blame or memory. In a way it also solve the problem of documentation in a product, it might be the most up to date as things progress, but at least tell the story like if it was one of the og developers who built it.

The code isn't perfect. I do see a lot of shortcuts some times or single monster files that after the creation I need to cleanup and organize a bit. But so far it doesn't look much worst than any other side project one might produce without worrying about all the idealistic best practices.

## A note on security

There's a fair criticism of AI-assisted development producing insecure code by default. It's a real concern and I take it seriously.

The flip side is that AI has given me more headspace. When I'm not spending it fighting syntax and relearning libraries, I can spend it learning about the things we should and should not do as it regards to software project.

This project isn't perfect. I don't know what I don't know, and I'm sure there are things I've missed. But security isn't an afterthought here. I'm actively learning as I go, reading about common vulnerabilities, asking the model to explain tradeoffs and decisions rather than just generate code, and trying to follow best practices where I'm aware of them.

For what it's worth, Tally is self-hosted and designed for a small group of trusted friends on a private network — which narrows the threat surface considerably. But that's not an excuse to be careless. The goal is to build something I'd feel comfortable leaving running, not just something that works for now.

