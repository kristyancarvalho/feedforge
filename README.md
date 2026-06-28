# FeedForge

FeedForge is a local-first editorial radar for open source and technology news. It collects Portuguese and English news from configured RSS/Atom and HTML sources, classifies each item with deterministic scoring, and helps technical writers save promising items for future posts.

## What FeedForge Is

FeedForge answers a single question: which recent open source and technology news are most relevant for my technical blog or editorial interests?

It collects news from sources you declare, normalizes and deduplicates them, classifies them with transparent scoring, and exposes the results in a dense, dark, technical dashboard where you can inspect, save, and organize interesting items.

It is not a generic RSS reader, an AI writing assistant, or a social media trend tracker. It is a focused editorial radar.

## Why FeedForge Exists

Following open source news across dozens of feeds is noisy. FeedForge filters that noise against an explicit editorial profile so the signal you care about — Linux, security, developer tools, infrastructure, self-hosting, programming languages — rises to the top, with a clear explanation of why each item ranked where it did.

## Features

- Source declaration through a single `sources.json` file.
- Portuguese (`pt-BR`) and English (`en`) source support.
- RSS/Atom-first ingestion.
- Explicit HTML scraping for sources without a usable feed.
- Text, URL, and date normalization.
- Deduplication across repeated crawls.
- Deterministic classification and scoring with a full score breakdown.
- Saved news workflow with editorial statuses and notes.
- Cron-based automatic crawling and classification.
- Manual "Run crawler and classification" action from the SPA.
- Radar dashboard, news detail, saved news, source health, and run history pages.
- REST API with structured errors.
- Test coverage for the core logic.
- Docker Compose orchestration.

## Open Source Focus

Default sources are focused on open source, Linux, software security, developer tools, GitHub, programming languages, infrastructure, self-hosting, privacy, and both Brazilian and international open source communities. Sources that require login, paid APIs, or that are mostly generic business, finance, crypto speculation, celebrity, or gaming news are intentionally excluded.

## Why There Are No LLMs

FeedForge intentionally avoids LLMs. The goal is not to generate posts or invent summaries, but to provide a transparent and deterministic signal ranking system. Every score is explainable through topics, keywords, source weight, freshness, novelty, and negative-topic penalties.

The same input always produces the same score, and the UI shows the exact reasons behind every classification.

## Supported Source Languages

Only two source languages are allowed:

```txt
pt-BR
en
```

The default seeded `sources.json` never includes sources in other languages.

## RSS-First Approach

RSS/Atom is preferred whenever a source provides a usable feed. Use the `rss` source type for those.

HTML scraping is used only when:

- the source does not provide a usable RSS/Atom feed;
- the source is explicitly configured with the `html` type;
- CSS selectors are provided in `sources.json`.

FeedForge does not follow links recursively, does not crawl arbitrary pages, does not handle robots.txt in this version, and does not scrape sources that require login.

## Running With Docker

FeedForge runs entirely through Docker Compose. Node.js, npm, Prisma, Vite, and Vitest never need to be installed on the host.

Start the full application (app + PostgreSQL):

```bash
docker compose up --build
```

Then open:

```txt
http://localhost:3000
```

The `app` container installs dependencies, generates the Prisma client, applies the database schema, builds the SPA, and starts the backend, which also serves the built frontend. PostgreSQL uses a persistent named volume.

Common Docker Compose commands:

```bash
docker compose up --build
docker compose run --rm app npm test
docker compose run --rm app npm run build
docker compose run --rm app npx prisma generate
docker compose run --rm app npx prisma migrate deploy
docker compose down
```

Do not run `npm`, `node`, `npx`, or `prisma` directly on the host. Every command runs inside Docker.

## Environment Configuration

Copy `.env.example` to `.env` and adjust if needed:

```env
DATABASE_URL="postgresql://feedforge:feedforge@db:5432/feedforge"

APP_PORT=3000
NODE_ENV=development

SOURCES_FILE=./sources.json

CRAWLER_USER_AGENT="FeedForgeBot/0.1"
CRAWLER_TIMEOUT_MS=15000
CRAWLER_MAX_CONCURRENT=3

CRON_ENABLED=true
CRON_SCHEDULE="0 */3 * * *"

PUBLIC_APP_NAME="FeedForge"
```

All environment values are validated at startup. Invalid values fail fast with a clear error; missing optional values use safe defaults.

## Configuring Sources

Sources are declared in `sources.json`, which contains an `editorialProfile` and a `sources` array. The file is validated with Zod at startup and whenever you reload sources. Invalid configuration produces a clear error and is never silently ignored.

### Editorial Profile

The editorial profile defines the topics that matter and the topics that should reduce a score.

```json
{
  "editorialProfile": {
    "name": "FeedForge Open Source Radar",
    "language": ["pt-BR", "en"],
    "topics": [
      "open source",
      "software livre",
      "linux",
      "arch linux",
      "kernel",
      "security",
      "developer tools",
      "github",
      "docker",
      "kubernetes",
      "typescript",
      "rust",
      "self-hosting",
      "privacy",
      "devops"
    ],
    "negativeTopics": [
      "celebrity",
      "sports",
      "crypto price speculation",
      "generic startup funding",
      "generic business news",
      "ai hype without open source relevance",
      "press release without technical content"
    ]
  }
}
```

### RSS Source

```json
{
  "id": "github-blog",
  "name": "GitHub Blog",
  "type": "rss",
  "url": "https://github.blog/feed/",
  "language": "en",
  "tags": ["github", "developer tools", "open source"],
  "weight": 1.1,
  "enabled": true
}
```

### HTML Source

HTML sources require `selectors.item`, `selectors.title`, and `selectors.link`. The `summary`, `date`, and `author` selectors are optional. Relative links are resolved against the source URL. If the required selectors match nothing, the source is recorded as failed and the rest of the run continues.

```json
{
  "id": "example-html",
  "name": "Example HTML Source",
  "type": "html",
  "url": "https://example.com/news",
  "language": "en",
  "tags": ["open source"],
  "weight": 1.0,
  "enabled": false,
  "selectors": {
    "item": "article",
    "title": "h2",
    "link": "a",
    "summary": "p",
    "date": "time",
    "author": ".author"
  }
}
```

After editing `sources.json`, reload sources from the Sources page or with:

```bash
curl -X POST http://localhost:3000/api/sources/reload
```

## How Classification Works

Classification is deterministic and explainable. Each news item is normalized and scored against the editorial profile, source tags, and an open source keyword list. The result includes detected topics, matched keywords, a score breakdown, and human-readable reasons.

The final score is a weighted combination, clamped from 0 to 100:

```txt
finalScore =
  topicScore * 0.35 +
  keywordScore * 0.25 +
  sourceScore * 0.15 +
  freshnessScore * 0.15 +
  noveltyScore * 0.10 -
  negativePenalty
```

All partial scores are normalized from 0 to 100:

- `topicScore`: editorial topic matches, weighting title over summary over body, with source tags considered.
- `keywordScore`: open source keyword matches, with strong weight for title matches and a boost from source tags.
- `sourceScore`: derived from source weight (`1.0 -> 70`, `1.1 -> 80`, `1.2 -> 90`, `>= 1.3 -> 100`).
- `freshnessScore`: today `100`, last 3 days `85`, last 7 days `70`, last 30 days `40`, older `15`, unknown date `25`.
- `noveltyScore`: reduced when many similar recent items already exist, keeping the radar from being dominated by repeats.
- `negativePenalty`: subtracted when an item strongly matches the negative topics.

Every item stores reasons such as:

```txt
Matched topic "linux" in title
Matched keyword "security" in summary
Recent item published in the last 24 hours
Reduced score due to negative topic "generic startup funding"
```

## How Saved News Works

Any item can be saved from the Radar, News Detail, or Saved News pages. Saving is idempotent. Saved items move through editorial statuses:

```txt
saved
idea
researching
drafting
published
ignored
```

You can edit notes per item and filter saved news by status, source, topic, language, and minimum score. Unsaving removes the saved record.

## How Cron Works

Scheduled crawling is handled by `node-cron`:

- Controlled by `CRON_ENABLED`.
- Uses `CRON_SCHEDULE` (default `0 */3 * * *`, every three hours).
- Runs the exact same pipeline as the manual button.
- Creates a `CrawlerRun` with trigger `cron`.
- Skips the cycle if a run is already active and records the skip.
- Logs start, end, skip, and failure events.

Example schedules:

```txt
0 */3 * * *    every three hours
0 * * * *      every hour
0 7 * * *      every day at 07:00
```

## How Manual Crawling Works

The Radar page has a prominent "Run crawler and classification" button that calls `POST /api/crawler/run`. It runs the full pipeline — reload sources, crawl, normalize, deduplicate, persist, classify, and summarize the run.

Concurrent runs are prevented. If a run is already active, the API returns a structured `CRAWLER_ALREADY_RUNNING` error and the button reflects the active state. When the run finishes, the latest run summary is shown.

You can also trigger a run from the CLI inside Docker:

```bash
docker compose run --rm app npm run crawler:run
```

## API Overview

All endpoints are served under `/api` and return structured errors of the form `{ "error": { "code", "message", "details" } }`.

```txt
GET    /api/health
GET    /api/sources
POST   /api/sources/reload
GET    /api/news
GET    /api/news/:id
POST   /api/news/:id/save
DELETE /api/news/:id/save
PATCH  /api/news/:id/status
GET    /api/runs
GET    /api/runs/latest
POST   /api/crawler/run
```

The news list supports `q`, `source`, `topic`, `minScore`, `status`, `saved`, `language`, `page`, `limit`, and `sort` query parameters, sorted by final score then published date by default.

## Running Tests

Tests are written with Vitest and never depend on live external websites; all parsing is exercised with inline fixtures. Run them inside Docker:

```bash
docker compose run --rm app npm test
```

Tests cover environment validation, source schema validation, RSS and HTML parsing, text and URL normalization, fingerprint generation, deduplication, topic and keyword matching, source/freshness/novelty scoring, negative penalty, final score calculation, classification reasons, run status calculation, and saved status validation.

## Troubleshooting

- App not reachable at `http://localhost:3000`: confirm the `app` container is healthy with `docker compose ps` and check logs with `docker compose logs -f app`.
- Database errors at startup: confirm the `db` container is healthy and that `DATABASE_URL` matches the compose service (`db:5432`). The app waits for the database health check before starting.
- `sources.json` rejected: the error message names the failing field. Fix the file and reload sources from the Sources page or `POST /api/sources/reload`.
- A source shows a last error: open the Sources page to inspect the message. RSS feeds occasionally fail transiently; the run continues for all other sources and reports partial success.
- No news after a run: ensure at least one source is `enabled`, then use the Radar "Run crawler and classification" button and review the latest run summary and the Runs page.
- Reset the database volume: `docker compose down -v` removes the persistent PostgreSQL volume and starts fresh on the next `docker compose up --build`.

## Project Philosophy

FeedForge should remain boring in the best way. It collects, classifies, and organizes open source news reliably. Every score is explainable, every source is explicit, and every command is reproducible through Docker. It is meant to be useful for real technical writing, not just a demo.
