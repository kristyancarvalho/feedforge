import type { Dictionary } from "./en";

export const ptBR: Dictionary = {
  app: {
    name: "FeedForge",
    tagline: "Radar editorial de código aberto"
  },
  nav: {
    radar: "Radar",
    saved: "Notícias salvas",
    sources: "Fontes",
    runs: "Execuções"
  },
  actions: {
    apply: "Aplicar",
    reset: "Limpar",
    retry: "Tentar novamente",
    save: "Salvar",
    unsave: "Remover",
    details: "Detalhes",
    openOriginal: "Abrir original",
    reloadSources: "Recarregar fontes",
    runCrawler: "Executar crawler e classificação",
    running: "Executando…",
    loadMore: "Carregar mais",
    backToRadar: "Voltar ao Radar",
    clearNotes: "Limpar notas",
    saveNotes: "Salvar notas"
  },
  common: {
    loading: "Carregando…",
    all: "Todos",
    none: "Nenhum",
    yes: "Sim",
    no: "Não",
    search: "Buscar",
    language: "Idioma",
    theme: "Tema",
    light: "Claro",
    dark: "Escuro",
    source: "Fonte",
    author: "Autor",
    published: "Publicado",
    inferredDate: "data aproximada",
    endOfResults: "Fim dos resultados.",
    loadMoreError: "Não foi possível carregar mais itens.",
    filtersActive: "filtros ativos"
  },
  theme: {
    toggle: "Alternar tema",
    switchToLight: "Mudar para tema claro",
    switchToDark: "Mudar para tema escuro"
  },
  status: {
    label: "Status",
    operational: "Operacional",
    degraded: "Degradado",
    running: "Executando",
    offline: "Offline",
    unknown: "Desconhecido",
    help: "Saúde geral derivada da API, do banco de dados, do crawler ativo, da última execução e das falhas de fontes.",
    descriptions: {
      operational: "API e banco de dados saudáveis e a última execução foi bem-sucedida.",
      degraded: "Funcionando, mas algumas fontes estão falhando ou a última execução foi parcial.",
      running: "Um pipeline de crawler está ativo no momento.",
      offline: "A API ou o banco de dados está inacessível, ou a última execução falhou.",
      unknown: "Ainda não há dados suficientes para determinar o status."
    }
  },
  matchStrength: {
    label: "Força de correspondência",
    strong: "Correspondência forte",
    good: "Boa correspondência",
    weak: "Correspondência fraca",
    low: "Baixa relevância",
    help: "Uma faixa legível derivada da pontuação final: forte (80-100), boa (65-79), fraca (45-64), baixa (0-44)."
  },
  scores: {
    finalScore: "Pontuação final",
    topicScore: "Tópico",
    keywordScore: "Palavra-chave",
    technicalDepthScore: "Profundidade técnica",
    openSourceRelevanceScore: "Relevância open source",
    sourceScore: "Fonte",
    freshnessScore: "Atualidade",
    noveltyScore: "Novidade",
    negativePenalty: "Penalidade negativa",
    breakdown: "Detalhamento da pontuação",
    help: {
      finalScore: "Combinação ponderada de todos os sinais abaixo, menos a penalidade negativa, limitada de 0 a 100.",
      topicScore: "O quanto o item corresponde aos tópicos editoriais configurados, priorizando título sobre resumo sobre corpo.",
      keywordScore: "Correspondências com a lista de palavras-chave open source, com peso forte para o título.",
      technicalDepthScore: "Recompensa sinais técnicos concretos como releases, CVEs, kernels, APIs, versões e protocolos.",
      openSourceRelevanceScore: "Recompensa relevância open source explícita: licenças, mantenedores, comunidades, fundações e distribuições.",
      sourceScore: "Derivada do peso configurado da fonte.",
      freshnessScore: "Maior para itens recentes; menor para itens antigos ou sem data.",
      noveltyScore: "Menor quando já existem muitos itens recentes semelhantes, mantendo o radar diverso.",
      negativePenalty: "Subtraída quando o item corresponde a tópicos negativos como hype, captação ou press releases."
    }
  },
  savedStatus: {
    label: "Status editorial",
    help: "Etapa do fluxo editorial de um item salvo.",
    saved: "Salvo",
    idea: "Ideia",
    researching: "Pesquisando",
    drafting: "Rascunho",
    published: "Publicado",
    ignored: "Ignorado"
  },
  filters: {
    title: "Filtros",
    q: "Texto de busca",
    source: "Fonte",
    sourceType: "Tipo de fonte",
    topic: "Tópico detectado",
    keyword: "Palavra-chave",
    language: "Idioma",
    minScore: "Pontuação mín.",
    maxScore: "Pontuação máx.",
    matchStrength: "Força de correspondência",
    savedState: "Estado salvo",
    savedStatus: "Status salvo",
    publishedFrom: "Publicado de",
    publishedTo: "Publicado até",
    runId: "Execução",
    hasSummary: "Tem resumo",
    hasReasons: "Tem motivos",
    hasNegativePenalty: "Tem penalidade",
    sort: "Ordenar",
    savedOnly: "Apenas salvos",
    notSaved: "Não salvos",
    typeRss: "RSS",
    typeHtml: "HTML"
  },
  sort: {
    score_desc: "Pontuação (maior para menor)",
    published_desc: "Mais recentes",
    published_asc: "Mais antigas",
    source_name: "Nome da fonte",
    freshness_desc: "Atualidade",
    technical_depth_desc: "Profundidade técnica",
    open_source_relevance_desc: "Relevância open source",
    negative_penalty_desc: "Penalidade negativa",
    saved_date_desc: "Salvos recentemente"
  },
  radar: {
    title: "Radar",
    subtitle: "Sinais de código aberto e tecnologia classificados por relevância.",
    empty: "Nenhuma notícia coletada ainda. Execute o crawler para começar a coletar sinais de código aberto.",
    manualHelp: "Executa o pipeline completo agora: recarrega fontes, coleta, normaliza, deduplica, classifica e resume."
  },
  detail: {
    summary: "Resumo",
    contentExcerpt: "Trecho do conteúdo",
    detectedTopics: "Tópicos detectados",
    matchedKeywords: "Palavras-chave correspondentes",
    reasons: "Motivos da classificação",
    penalties: "Penalidades negativas",
    noPenalties: "Nenhuma penalidade negativa aplicada.",
    notes: "Notas",
    noClassification: "Este item ainda não foi classificado.",
    notFound: "Notícia não encontrada."
  },
  saved: {
    title: "Notícias salvas",
    subtitle: "Itens que você salvou para escrita técnica futura.",
    empty: "Nenhuma notícia salva ainda. Salve itens promissores na página Radar.",
    savedOn: "Salvo em"
  },
  sources: {
    title: "Fontes",
    subtitle: "Fontes configuradas e sua saúde.",
    empty: "Nenhuma fonte encontrada. Verifique o sources.json e recarregue as fontes.",
    type: "Tipo",
    language: "Idioma",
    weight: "Peso",
    enabled: "Habilitada",
    disabled: "Desabilitada",
    tags: "Tags",
    lastRun: "Última execução",
    lastSuccess: "Último sucesso",
    lastError: "Último erro",
    itemsCollected: "Itens coletados",
    health: "Saúde",
    healthy: "Saudável",
    degraded: "Degradada",
    failing: "Falhando",
    healthUnknown: "Desconhecida",
    never: "Nunca",
    noError: "Nenhum",
    help: {
      weight: "Peso editorial da fonte; um peso maior aumenta a pontuação de fonte dos seus itens.",
      enabled: "Apenas fontes habilitadas são coletadas.",
      lastError: "O erro mais recente registrado ao coletar esta fonte.",
      health: "Saudável significa que a última coleta funcionou; falhando significa que a última coleta deu erro; degradada significa resultados recentes mistos."
    }
  },
  runs: {
    title: "Execuções",
    subtitle: "Histórico de cada execução do pipeline.",
    empty: "Nenhuma execução ainda. Execute o crawler manualmente ou habilite o cron.",
    trigger: "Gatilho",
    status: "Status",
    started: "Início",
    finished: "Fim",
    duration: "Duração",
    totalSources: "Total de fontes",
    successfulSources: "Bem-sucedidas",
    failedSources: "Falharam",
    itemsFound: "Encontrados",
    itemsCreated: "Criados",
    itemsUpdated: "Atualizados",
    itemsSkipped: "Ignorados",
    error: "Erro",
    latestRun: "Última execução",
    triggerManual: "Manual",
    triggerCron: "Cron",
    triggerStartup: "Inicialização",
    statusRunning: "Executando",
    statusSuccess: "Sucesso",
    statusPartial: "Sucesso parcial",
    statusFailed: "Falhou",
    statusSkipped: "Ignorada",
    help: {
      manualCrawler: "Dispara uma execução completa do pipeline sob demanda. Desabilitado enquanto uma execução já está ativa.",
      cron: "Coleta agendada. Usa o agendamento cron configurado e compartilha o pipeline manual."
    }
  },
  cron: {
    label: "Cron",
    enabled: "Cron habilitado",
    disabled: "Cron desabilitado",
    schedule: "Agendamento"
  }
};
