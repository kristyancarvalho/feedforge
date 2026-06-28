# Contributing to FeedForge

FeedForge is a local-first editorial radar for open source and technology news.

The project is intentionally simple: a modular monolith, Docker-orchestrated, with deterministic classification, no LLMs, no paid APIs, and no unnecessary infrastructure.

This document defines the development workflow, versioning rules, commit conventions, implementation standards, and project constraints.

## Core Principles

FeedForge must stay:

* local-first;
* simple to run;
* easy to maintain;
* focused on open source news;
* deterministic and explainable;
* Docker-first;
* free from unnecessary abstractions;
* free from LLM-based features.

Avoid scope creep.

Do not turn FeedForge into a generic RSS reader, social media tracker, AI assistant, or multi-user SaaS.

## Hard Rules

These rules are mandatory.

### Do Not Run Node or npm on Bare Metal

Node.js and npm commands must never be executed directly on the host machine.

Do not run commands like:

```bash
npm install
npm run dev
npm test
npm run build
node script.js
npx prisma generate
npx prisma migrate dev
```

directly on bare metal.

All Node.js, npm, Prisma, test, build, and development commands must run inside Docker.

Use Docker Compose commands instead.

Examples:

```bash
docker compose run --rm app npm install
docker compose run --rm app npm test
docker compose run --rm app npm run build
docker compose run --rm app npx prisma generate
docker compose run --rm app npx prisma migrate dev
docker compose up --build
```

If the Docker service name changes, adapt the command to the actual service name, but keep the same rule: Node.js and npm must run only inside Docker.

### No Comments in Final Code

The final source code must not contain comments.

Avoid:

```ts
// comments
/* comments */
```

Do not leave explanatory comments, TODO comments, FIXME comments, disabled code, commented-out experiments, or temporary notes in source files.

The code must be readable through clear naming, small functions, typed boundaries, and simple structure.

Documentation belongs in Markdown files, not in code comments.

### No TODO Placeholders

Do not leave placeholder implementations.

Avoid:

```txt
TODO
FIXME
later
temporary
mock for now
not implemented yet
```

If a feature is in scope, implement it.

If a feature is out of scope, do not add a placeholder for it.

### No LLM Features

Do not add LLMs, AI summarization, AI recommendations, LangChain, OpenAI, Anthropic, Gemini, Ollama, local model inference, prompt templates, or model-based classification.

FeedForge classification must remain deterministic and explainable.

### No X/Twitter Integration

Do not add X/Twitter integration.

FeedForge focuses on configured news sources, RSS/Atom, and explicit HTML sources.

### Prefer RSS/Atom

RSS/Atom must be preferred whenever possible.

HTML scraping is allowed only for sources explicitly configured as `html` in `sources.json`.

Do not build a recursive crawler.

Do not crawl arbitrary links.

Do not scrape sources that require login.

### Supported Source Languages

Default sources must be available in:

* Portuguese;
* English.

Allowed source language values:

```txt
pt-BR
en
```

Do not seed default sources in other languages.

## Development Environment

The project must be developed through Docker Compose.

The expected command to start the full application is:

```bash
docker compose up --build
```

The expected app URL is:

```txt
http://localhost:3000
```

All development commands should use Docker Compose.

Examples:

```bash
docker compose run --rm app npm test
docker compose run --rm app npm run build
docker compose run --rm app npm run lint
docker compose run --rm app npx prisma generate
docker compose run --rm app npx prisma migrate dev
```

Do not require globally installed Node.js, npm, pnpm, yarn, Prisma, Vite, Vitest, or other JavaScript tooling on the host machine.

## Repository Structure

The initial repository structure is:

```txt
.
├── CONTRIBUTING.md
├── README.md
└── specs
    └── SPEC.md
```

The implementation must evolve from the specification in:

```txt
./specs/SPEC.md
```

Before implementing, read:

```txt
./README.md
./CONTRIBUTING.md
./specs/SPEC.md
```

The specification is the source of truth for product scope.

If implementation details conflict with the spec, prefer the spec unless this contributing guide defines a stricter development rule.

## Branching Strategy

Use a simple branch model.

### `main`

The `main` branch must represent stable, releasable code.

Only merge into `main` when:

* tests pass;
* the app builds;
* Docker Compose works;
* the implemented scope is documented;
* the code follows this contributing guide.

### `dev`

The `dev` branch is the active development branch.

Feature work should target `dev`.

When the project reaches a releasable state, merge `dev` into `main`.

### Feature Branches

For larger changes, use feature branches from `dev`.

Recommended naming:

```txt
feat/source-ingestion
feat/classification-engine
feat/radar-dashboard
fix/crawler-run-lock
test/scoring-pipeline
docs/docker-usage
```

Keep branches focused.

Avoid mixing unrelated changes in the same branch.

## Versioning

Use Semantic Versioning.

Format:

```txt
MAJOR.MINOR.PATCH
```

Example:

```txt
1.0.0
```

### Patch Version

Increment PATCH for:

* bug fixes;
* documentation corrections;
* small internal refactors;
* test fixes;
* small UI fixes that do not change product behavior.

Example:

```txt
1.0.1
```

### Minor Version

Increment MINOR for:

* new features;
* new pages;
* new source types;
* new classification capabilities;
* new workflow states;
* new configuration options;
* meaningful UI additions.

Example:

```txt
1.1.0
```

### Major Version

Increment MAJOR for:

* breaking configuration changes;
* database model changes requiring manual migration;
* removal of existing functionality;
* incompatible API changes;
* major architecture changes.

Example:

```txt
2.0.0
```

## Milestones

Use GitHub milestones to group work by release.

Milestone naming should follow the version number:

```txt
0.1.0
0.2.0
1.0.0
```

Each milestone should include a clear goal.

Example:

```txt
1.0.0 — Complete local-first FeedForge release
```

A release milestone should only be closed when all associated issues are closed and the release has been validated.

## Issues

Use GitHub issues for planned work.

Each issue should be scoped, actionable, and tied to a milestone when possible.

Issue titles should follow this style:

```txt
feat: implement RSS ingestion
feat: add deterministic classification
feat: build radar dashboard
fix: prevent concurrent crawler runs
test: cover scoring pipeline
docs: document Docker workflow
```

Each issue should include:

* context;
* implementation tasks;
* acceptance criteria;
* testing notes when relevant.

Avoid vague issues like:

```txt
improve app
fix things
make better
```

## Labels

Use labels consistently.

Recommended labels:

```txt
type: feat
type: fix
type: chore
type: docs
type: test
type: refactor
type: ci
area: backend
area: frontend
area: crawler
area: classification
area: database
area: docker
area: docs
priority: low
priority: medium
priority: high
status: blocked
status: ready
```

Labels should help identify the type, area, and priority of each issue.

## Commit Convention

Use concise conventional commits.

Format:

```txt
type(scope): message
```

Examples:

```txt
feat(crawler): implement rss ingestion
feat(classification): add deterministic scoring
feat(web): build radar page
fix(crawler): prevent concurrent runs
test(classification): cover negative topic penalty
docs(readme): document docker setup
chore(docker): add compose services
```

Allowed types:

```txt
feat
fix
chore
docs
test
refactor
ci
build
style
perf
release
```

Recommended scopes:

```txt
crawler
classification
sources
news
saved-news
runs
web
api
db
docker
docs
tests
config
```

Commit messages should be:

* lowercase;
* imperative;
* short;
* specific.

Avoid:

```txt
update
changes
fix
wip
stuff
final
```

Good examples:

```txt
feat(sources): validate source configuration
feat(crawler): add html ingestion service
feat(news): add saved news workflow
fix(api): return structured errors
test(crawler): cover run status calculation
docs(contributing): add docker-only workflow
```

## Pull Requests

Pull requests should target `dev` unless preparing a release into `main`.

A pull request should include:

* summary of changes;
* related issues;
* test results;
* screenshots for UI changes when useful;
* notes about migrations or configuration changes.

Before opening a PR, run the relevant commands through Docker:

```bash
docker compose run --rm app npm test
docker compose run --rm app npm run build
```

Do not merge broken builds.

## Release Process

When preparing a release:

1. Ensure all milestone issues are closed.
2. Ensure `dev` is passing tests.
3. Run tests inside Docker.
4. Run build inside Docker.
5. Start the app with Docker Compose.
6. Validate the main workflows manually.
7. Update README if needed.
8. Update version number.
9. Merge `dev` into `main`.
10. Create a Git tag.
11. Publish the GitHub release.

Tag format:

```txt
vMAJOR.MINOR.PATCH
```

Example:

```txt
v1.0.0
```

Release commit format:

```txt
release: v1.0.0
```

## Required Validation Before Release

Before a release, validate:

* Docker Compose starts successfully;
* database starts successfully;
* migrations run successfully;
* `sources.json` loads successfully;
* RSS ingestion works;
* HTML ingestion works for explicitly configured sources;
* manual crawler button works;
* cron is configured and does not overlap runs;
* news are classified;
* saved news works;
* status updates work;
* run history is visible;
* source health is visible;
* tests pass;
* build passes;
* README is accurate.

All validation commands must run inside Docker.

## Code Style

Code must be:

* typed;
* modular;
* simple;
* explicit;
* easy to test;
* easy to delete;
* aligned with the specification.

Prefer:

* clear names;
* small modules;
* explicit validation;
* structured errors;
* deterministic behavior;
* simple data flow.

Avoid:

* clever abstractions;
* hidden side effects;
* global mutable state when avoidable;
* duplicated pipeline logic;
* unnecessary dependencies;
* premature optimization;
* framework churn.

## Backend Guidelines

Backend code should follow modular monolith boundaries.

Expected modules include:

```txt
sources
crawler
ingestion
normalization
deduplication
classification
news
saved-news
runs
```

The manual run endpoint and cron job must share the same pipeline service.

Do not duplicate crawler logic.

Do not let one failed source crash the whole run.

All API errors should be structured.

Example:

```json
{
  "error": {
    "code": "CRAWLER_ALREADY_RUNNING",
    "message": "A crawler run is already active.",
    "details": {}
  }
}
```

## Frontend Guidelines

The SPA should be clean, dense, and useful.

Required pages:

```txt
Radar
News Detail
Saved News
Sources
Runs
```

The UI should be:

* dark mode first;
* technical;
* readable;
* responsive;
* fast;
* direct.

Avoid fake AI language.

Avoid excessive animations.

Avoid generic SaaS bloat.

## Testing Guidelines

Use tests for core logic.

Tests must cover at least:

* source validation;
* RSS parsing;
* HTML parsing;
* text normalization;
* URL normalization;
* fingerprint generation;
* deduplication;
* topic matching;
* keyword matching;
* source scoring;
* freshness scoring;
* negative topic penalty;
* final score calculation;
* classification reasons;
* run status calculation;
* saved status validation.

Tests must not depend on live external websites.

Mock network calls.

Run tests only through Docker:

```bash
docker compose run --rm app npm test
```

## Documentation Guidelines

Keep documentation accurate.

Update README when changing:

* setup;
* Docker commands;
* environment variables;
* source configuration;
* cron behavior;
* classification behavior;
* API behavior;
* release process.

Documentation should explain why FeedForge avoids LLMs and why it prefers RSS/Atom.

## Dependency Guidelines

Add dependencies only when needed.

Before adding a dependency, check if the feature can be implemented simply with existing tools.

Do not add:

```txt
LangChain
OpenAI SDK
Anthropic SDK
Gemini SDK
Ollama client
robots-parser
browser automation libraries
paid API SDKs
```

Allowed dependency categories include:

```txt
Fastify
React
Vite
Prisma
Zod
rss-parser
undici
cheerio
node-cron
Vitest
```

## Database Guidelines

Use Prisma migrations.

Database changes should be intentional and documented.

Add indexes for common queries:

```txt
canonicalUrl
fingerprint
publishedAt
sourceId
finalScore
saved status
crawler run start date
```

Do not introduce database changes without updating tests and documentation when needed.

## Configuration Guidelines

Configuration should be explicit.

Important files:

```txt
.env.example
sources.json
compose.yaml
```

Validate configuration at startup.

Invalid configuration should produce clear errors.

Do not silently ignore invalid source definitions.

## Source Configuration Guidelines

Default sources must be focused on:

* open source;
* Linux;
* software security;
* developer tools;
* GitHub;
* programming languages;
* infrastructure;
* self-hosting;
* privacy;
* Brazilian Linux and open source communities;
* international open source communities.

Allowed source languages:

```txt
pt-BR
en
```

Prefer RSS/Atom.

Use HTML only when explicitly configured.

Do not include sources that require login.

Do not include paid APIs.

Do not include X/Twitter.

## Final Quality Checklist

Before considering work complete, confirm:

* code has no comments;
* code has no TODO placeholders;
* Node.js and npm were only used through Docker;
* tests pass through Docker;
* build passes through Docker;
* Docker Compose starts the app;
* `sources.json` validates;
* RSS ingestion works;
* explicit HTML ingestion works;
* classification works without LLMs;
* manual crawler button works;
* cron uses the same pipeline;
* saved news works;
* source health is visible;
* run history is visible;
* README is updated;
* implementation matches `./specs/SPEC.md`.

## Project Philosophy

FeedForge should remain boring in the best way.

It should collect, classify, and organize open source news reliably.

Every score should be explainable.

Every source should be explicit.

Every command should be reproducible through Docker.

The project should be useful for real technical writing, not just a demo.

