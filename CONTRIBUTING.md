# Contributing to FeedForge

Thanks for your interest in contributing to FeedForge.

FeedForge is a local-first editorial radar for open source and technology news. It collects news from configured sources, ranks them with transparent deterministic scoring, and helps technical writers and open source enthusiasts find useful signal without depending on paid APIs or cloud services.

This guide explains how to work on the project, open issues, submit pull requests, and keep changes aligned with the project direction.

## Ways to Contribute

Contributions are welcome in many forms:

* bug reports and reproduction cases;
* documentation improvements;
* source configuration fixes;
* accessibility, usability, and responsive UI improvements;
* tests and test infrastructure improvements;
* small refactors that make the code easier to maintain;
* feature proposals that fit the local-first editorial radar scope.

For larger changes, please open an issue first so the direction can be discussed before significant implementation work starts.

## Project Direction

FeedForge should stay focused, understandable, and easy to run locally.

The project generally favors:

* local-first workflows;
* Docker-friendly development;
* RSS/Atom before HTML scraping;
* explicit source configuration;
* deterministic and explainable scoring;
* simple architecture over distributed infrastructure;
* Portuguese and English open source and technology sources.

Ideas outside that direction are still welcome as issues or discussions, but they may be better suited for plugins, forks, or future optional integrations instead of the core application.

## Development Setup

Docker Compose is the documented and maintainer-supported way to run the full app:

```bash
docker compose up --build
```

The app is expected to be available at:

```txt
http://localhost:3000
```

Common commands:

```bash
docker compose run --rm app npm test
docker compose run --rm app npm run build
docker compose run --rm app npm run lint
docker compose run --rm app npx prisma generate
docker compose run --rm app npx prisma migrate dev
```

If you prefer a local Node.js workflow, use the Node version documented by the project, keep generated files out of commits unless they are expected, and make sure the Docker Compose workflow still passes before opening a pull request.

## Repository Notes

The product scope is documented in:

```txt
./README.md
```

When in doubt, prefer the current product behavior and documented scope over adding broad new platform features. If the implementation and documentation disagree, please call that out in the issue or pull request.

## Working Guidelines

Please keep changes focused and easy to review.

Recommended practices:

* prefer small pull requests over large mixed changes;
* include tests for behavior changes when practical;
* keep public errors and validation messages clear;
* update documentation when setup, configuration, or user-facing behavior changes;
* use typed boundaries and descriptive names;
* leave comments only when they clarify non-obvious decisions;
* avoid committing dead code, temporary debug output, or unfinished placeholder behavior.

FeedForge intentionally avoids unnecessary infrastructure and opaque ranking logic. New dependencies are fine when they solve a real problem, but please explain the tradeoff in the pull request.

## Source Ingestion Guidelines

FeedForge is RSS/Atom-first.

Use RSS or Atom feeds whenever a source provides a reliable feed. HTML ingestion is acceptable for explicitly configured sources when no usable feed exists.

Please avoid adding sources that:

* require login;
* depend on paid APIs;
* mostly publish unrelated business, sports, celebrity, gaming, or price-speculation content;
* require broad recursive crawling.

Default source language values are currently:

```txt
pt-BR
en
```

## Branching

Use a simple branch model:

* `main` is stable, releasable code.
* `dev` is the default branch for active development.
* Feature branches should be created from `dev` when practical.

Example branch names:

```txt
feat/source-ingestion
feat/classification-engine
fix/crawler-run-lock
docs/docker-usage
test/scoring-pipeline
```

Pull requests should normally target `dev`, except release preparation pull requests into `main`.

## Issues

Good issues are scoped and actionable.

Helpful issue reports usually include:

* what happened;
* what you expected to happen;
* steps to reproduce;
* logs, screenshots, or sample source entries when useful;
* environment details such as OS, Docker version, and browser.

Feature requests are easier to evaluate when they explain the use case, not only the proposed implementation.

## Commits

Conventional commits are recommended but not required for every contribution.

Examples:

```txt
feat(crawler): add rss ingestion
fix(api): return structured validation errors
docs(readme): update docker setup
test(classification): cover negative topic penalty
refactor(sources): simplify source validation
```

Useful commit messages are short, specific, and written in the imperative mood.

## Pull Requests

Before opening a pull request, please check:

* the change is focused;
* related docs are updated;
* relevant tests pass;
* the app still builds;
* UI changes include screenshots or a short visual note when useful;
* migrations, configuration changes, or breaking changes are called out.

Recommended validation:

```bash
docker compose run --rm app npm test
docker compose run --rm app npm run build
```

If you cannot run a command locally, mention that in the pull request.

## Versioning and Releases

FeedForge uses Semantic Versioning:

```txt
MAJOR.MINOR.PATCH
```

General guidance:

* PATCH for bug fixes, documentation corrections, and small internal improvements.
* MINOR for new features and meaningful user-facing additions.
* MAJOR for breaking configuration, API, database, or architecture changes.

Release tags use this format:

```txt
vMAJOR.MINOR.PATCH
```

Release preparation usually includes passing tests, building the app, validating the Docker Compose workflow, updating documentation when needed, and publishing release notes.

## Code of Conduct

Please be respectful, specific, and collaborative. Assume good intent, discuss tradeoffs directly, and keep feedback focused on the work.

Maintainers may close issues or pull requests that are out of scope, inactive, duplicated, or not actionable, but forks and alternative experiments are welcome.
