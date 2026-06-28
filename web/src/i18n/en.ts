export const en = {
  app: {
    name: "FeedForge",
    tagline: "Open source editorial radar"
  },
  nav: {
    radar: "Radar",
    saved: "Saved News",
    sources: "Sources",
    runs: "Crawler Runs"
  },
  actions: {
    apply: "Apply",
    reset: "Reset",
    retry: "Retry",
    save: "Save",
    unsave: "Unsave",
    details: "Details",
    openOriginal: "Open original",
    reloadSources: "Reload sources",
    runCrawler: "Run crawler and classification",
    running: "Running…",
    loadMore: "Load more",
    backToRadar: "Back to Radar",
    clearNotes: "Clear notes",
    saveNotes: "Save notes"
  },
  common: {
    loading: "Loading…",
    all: "All",
    none: "None",
    yes: "Yes",
    no: "No",
    search: "Search",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    source: "Source",
    author: "Author",
    published: "Published",
    inferredDate: "approximate date",
    endOfResults: "End of results.",
    loadMoreError: "Could not load more items.",
    filtersActive: "active filters"
  },
  theme: {
    toggle: "Toggle theme",
    switchToLight: "Switch to light theme",
    switchToDark: "Switch to dark theme"
  },
  status: {
    label: "Status",
    operational: "Operational",
    degraded: "Degraded",
    running: "Running",
    offline: "Offline",
    unknown: "Unknown",
    help: "Overall health derived from the API, the database, the active crawler, the latest run and source failures.",
    descriptions: {
      operational: "API and database are healthy and the latest run succeeded.",
      degraded: "Running, but some sources are failing or the latest run was partial.",
      running: "A crawler pipeline is currently active.",
      offline: "The API or database is unreachable, or the latest run failed.",
      unknown: "Not enough data yet to determine status."
    }
  },
  matchStrength: {
    label: "Match strength",
    strong: "Strong match",
    good: "Good match",
    weak: "Weak match",
    low: "Low relevance",
    help: "A readable band derived from the final score: strong (80-100), good (65-79), weak (45-64), low (0-44)."
  },
  scores: {
    finalScore: "Final score",
    topicScore: "Topic",
    keywordScore: "Keyword",
    technicalDepthScore: "Technical depth",
    openSourceRelevanceScore: "Open source relevance",
    sourceScore: "Source",
    freshnessScore: "Freshness",
    noveltyScore: "Novelty",
    negativePenalty: "Negative penalty",
    breakdown: "Score breakdown",
    help: {
      finalScore: "Weighted combination of every signal below, minus the negative penalty, clamped to 0-100.",
      topicScore: "How strongly the item matches the configured editorial topics, weighting title over summary over body.",
      keywordScore: "Matches against the open source keyword list, with strong weight for title matches.",
      technicalDepthScore: "Rewards concrete technical signals like releases, CVEs, kernels, APIs, versions and protocols.",
      openSourceRelevanceScore: "Rewards explicit open source relevance: licenses, maintainers, communities, foundations and distributions.",
      sourceScore: "Derived from the configured source weight.",
      freshnessScore: "Higher for recent items; lower for older or undated items.",
      noveltyScore: "Lower when many similar recent items already exist, keeping the radar diverse.",
      negativePenalty: "Subtracted when the item matches negative topics such as hype, funding or press releases."
    }
  },
  savedStatus: {
    label: "Editorial status",
    help: "Editorial workflow stage for a saved item.",
    saved: "Saved",
    idea: "Idea",
    researching: "Researching",
    drafting: "Drafting",
    published: "Published",
    ignored: "Ignored"
  },
  filters: {
    title: "Filters",
    q: "Search text",
    source: "Source",
    sourceType: "Source type",
    topic: "Detected topic",
    keyword: "Matched keyword",
    language: "Language",
    minScore: "Min score",
    maxScore: "Max score",
    matchStrength: "Match strength",
    savedState: "Saved state",
    savedStatus: "Saved status",
    publishedFrom: "Published from",
    publishedTo: "Published to",
    runId: "Crawler run",
    hasSummary: "Has summary",
    hasReasons: "Has reasons",
    hasNegativePenalty: "Has penalty",
    sort: "Sort",
    savedOnly: "Saved only",
    notSaved: "Not saved",
    typeRss: "RSS",
    typeHtml: "HTML"
  },
  sort: {
    score_desc: "Score (high to low)",
    published_desc: "Newest first",
    published_asc: "Oldest first",
    source_name: "Source name",
    freshness_desc: "Freshness",
    technical_depth_desc: "Technical depth",
    open_source_relevance_desc: "Open source relevance",
    negative_penalty_desc: "Negative penalty",
    saved_date_desc: "Recently saved"
  },
  radar: {
    title: "Radar",
    subtitle: "Classified open source and technology signals, ranked by relevance.",
    empty: "No news collected yet. Run the crawler to start collecting open source signals.",
    manualHelp: "Runs the full pipeline now: reload sources, crawl, normalize, deduplicate, classify and summarize."
  },
  detail: {
    summary: "Summary",
    contentExcerpt: "Content excerpt",
    detectedTopics: "Detected topics",
    matchedKeywords: "Matched keywords",
    reasons: "Classification reasons",
    penalties: "Negative penalties",
    noPenalties: "No negative penalties applied.",
    notes: "Notes",
    noClassification: "This item has not been classified yet.",
    notFound: "News item not found."
  },
  saved: {
    title: "Saved News",
    subtitle: "Items you saved for future technical writing.",
    empty: "No saved news yet. Save promising items from the Radar page.",
    savedOn: "Saved"
  },
  sources: {
    title: "Sources",
    subtitle: "Configured sources and their health.",
    empty: "No sources found. Check sources.json and reload sources.",
    type: "Type",
    language: "Language",
    weight: "Weight",
    enabled: "Enabled",
    disabled: "Disabled",
    tags: "Tags",
    lastRun: "Last run",
    lastSuccess: "Last success",
    lastError: "Last error",
    itemsCollected: "Items collected",
    health: "Health",
    healthy: "Healthy",
    degraded: "Degraded",
    failing: "Failing",
    healthUnknown: "Unknown",
    never: "Never",
    noError: "None",
    help: {
      weight: "Editorial weight of the source; higher weight boosts the source score of its items.",
      enabled: "Only enabled sources are crawled.",
      lastError: "The most recent error recorded while crawling this source.",
      health: "Healthy means the last crawl succeeded; failing means the last crawl errored; degraded means mixed recent results."
    }
  },
  runs: {
    title: "Crawler Runs",
    subtitle: "History of every pipeline execution.",
    empty: "No crawler runs yet. Run the crawler manually or enable cron.",
    trigger: "Trigger",
    status: "Status",
    started: "Started",
    finished: "Finished",
    duration: "Duration",
    totalSources: "Total sources",
    successfulSources: "Successful",
    failedSources: "Failed",
    itemsFound: "Found",
    itemsCreated: "Created",
    itemsUpdated: "Updated",
    itemsSkipped: "Skipped",
    error: "Error",
    latestRun: "Latest run",
    triggerManual: "Manual",
    triggerCron: "Cron",
    triggerStartup: "Startup",
    statusRunning: "Running",
    statusSuccess: "Success",
    statusPartial: "Partial success",
    statusFailed: "Failed",
    statusSkipped: "Skipped",
    help: {
      manualCrawler: "Triggers a full pipeline run on demand. Disabled while a run is already active.",
      cron: "Scheduled crawling. Uses the configured cron schedule and shares the manual pipeline."
    }
  },
  cron: {
    label: "Cron",
    enabled: "Cron enabled",
    disabled: "Cron disabled",
    schedule: "Schedule"
  }
} as const;

export type Dictionary = typeof en;
