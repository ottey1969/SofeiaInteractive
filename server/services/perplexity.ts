export interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface KeywordResearch {
  keywords: Array<{
    keyword: string;
    searchVolume: string;
    competition: string;
    intent: string;
    difficulty: string;
  }>;
  topPages: Array<{
    url: string;
    title: string;
    snippet: string;
    hasAIOverview: boolean;
  }>;
  recommendations: string[];
  citations: string[];
}

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export async function researchKeywords(topic: string, targetCountry?: string): Promise<KeywordResearch> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured. Please add your PERPLEXITY_API_KEY to use keyword research.');
  }

  try {
    const governmentSources = getGovernmentSources(targetCountry);
    
    const prompt = `Research the best keywords for "${topic}" content${targetCountry ? ` in ${targetCountry}` : ''}. Focus on:

1. High search volume keywords with low to medium competition
2. Keywords that trigger Google AI Overviews
3. Long-tail keywords with high commercial intent
4. Semantic keyword variations
5. Current trending keywords in this niche
6. CRITICAL: Include real statistics from government sources and official agencies
7. Focus on high-authority, authentic sources only

Analyze the top 10 search results for the main keyword and identify:
- Which pages rank for AI Overviews
- Content gaps and opportunities
- Government and official statistics available
- Search intent patterns

Prioritize sources from:
${governmentSources.map(source => `- ${source}`).join('\n')}
- Official government agencies and departments
- Academic institutions (.edu domains)
- International organizations (UN, WHO, World Bank, etc.)
- Industry regulatory bodies
- Statistical offices and census data

AVOID competitor websites and low-authority sources.
Include live, working URLs to government statistics and official data sources.

Provide specific, actionable keyword recommendations with estimated search volumes and competition levels.

When analyzing the top 10 search results, specifically identify which pages trigger AI Overviews.

ONLY include the AI Overview optimization tip if AI Overviews are found for the target keywords:
🔥 **AI OVERVIEW OPTIMIZATION TIP:**
AI Overview found for: [specific keywords with AI Overviews]
Now do this:
Paste your article into Perplexity or Anthropic with this prompt: 💪
> "Rewrite this to directly answer the query '[keyword with AI Overview]' in 2–3 concise, fact-based sentences optimized for Google's AI Overview format."
AI will give you a cleaner, more AI-friendly version.
This small tweak = higher visibility in AI Overviews.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert SEO researcher specializing in keyword analysis and competitive research. Provide detailed, data-driven insights based on current search trends and SERP analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'month',
        return_related_questions: false,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the structured response to extract keyword data
    return parseKeywordResearch(content, data.citations);
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to research keywords with Perplexity AI');
  }
}

// Helper function to get country-specific government sources
function getGovernmentSources(targetCountry?: string): string[] {
  const countrySourceMap: { [key: string]: string[] } = {
    'United States': [
      'census.gov',
      'bls.gov (Bureau of Labor Statistics)',
      'sba.gov (Small Business Administration)',
      'trade.gov',
      'commerce.gov',
      'ftc.gov (Federal Trade Commission)',
      'sec.gov (Securities and Exchange Commission)'
    ],
    'United Kingdom': [
      'gov.uk',
      'ons.gov.uk (Office for National Statistics)',
      'companieshouse.gov.uk',
      'fca.org.uk (Financial Conduct Authority)',
      'hmrc.gov.uk',
      'ofcom.org.uk'
    ],
    'Canada': [
      'statcan.gc.ca (Statistics Canada)',
      'ic.gc.ca (Innovation, Science and Economic Development)',
      'cra-arc.gc.ca (Canada Revenue Agency)',
      'competitionbureau.gc.ca',
      'canada.ca'
    ],
    'Australia': [
      'abs.gov.au (Australian Bureau of Statistics)',
      'austrade.gov.au',
      'accc.gov.au (Australian Competition and Consumer Commission)',
      'asic.gov.au',
      'australia.gov.au'
    ],
    'Germany': [
      'destatis.de (Federal Statistical Office)',
      'bundesbank.de',
      'bmwk.de (Federal Ministry for Economic Affairs)',
      'bafin.de (Federal Financial Supervisory Authority)',
      'deutschland.de'
    ],
    'France': [
      'insee.fr (National Institute of Statistics)',
      'economie.gouv.fr',
      'banque-france.fr',
      'gouvernement.fr',
      'amf-france.org'
    ],
    'Netherlands': [
      'cbs.nl (Statistics Netherlands)',
      'government.nl',
      'acm.nl (Authority for Consumers and Markets)',
      'dnb.nl (Dutch Central Bank)',
      'kvk.nl (Chamber of Commerce)'
    ],
    'Spain': [
      'ine.es (National Statistics Institute)',
      'lamoncloa.gob.es',
      'cnmc.es (National Markets and Competition Commission)',
      'bde.es (Bank of Spain)',
      'mineco.gob.es'
    ]
  };

  const defaultSources = [
    'World Bank (worldbank.org)',
    'OECD (oecd.org)',
    'UN Statistics (unstats.un.org)',
    'WHO (who.int)',
    'IMF (imf.org)',
    'WTO (wto.org)'
  ];

  if (targetCountry && countrySourceMap[targetCountry]) {
    return [...countrySourceMap[targetCountry], ...defaultSources];
  }

  return defaultSources;
}

// Helper function to get country domain preference
function getCountryDomain(targetCountry?: string): string {
  const countryDomains: { [key: string]: string } = {
    'United States': '.gov',
    'United Kingdom': '.gov.uk',
    'Canada': '.gc.ca',
    'Australia': '.gov.au',
    'Germany': '.de',
    'France': '.gouv.fr',
    'Netherlands': '.nl',
    'Spain': '.gob.es'
  };

  return countryDomains[targetCountry || ''] || '.gov';
}

export async function analyzeCompetitors(keyword: string, competitors?: string[]): Promise<{
  analysis: string;
  opportunities: string[];
  recommendations: string[];
  citations: string[];
}> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured. Please add your PERPLEXITY_API_KEY to use competitor analysis.');
  }

  try {
    const competitorList = competitors ? ` Focus on these specific competitors: ${competitors.join(', ')}` : '';
    
    const prompt = `Analyze the competitive landscape for the keyword "${keyword}".${competitorList}

Research and analyze:
1. Top 10 ranking pages for this keyword
2. Content strategies used by top performers
3. Content gaps and opportunities
4. Technical SEO factors contributing to rankings
5. Content length, structure, and format preferences
6. Backlink profiles and authority signals
7. User engagement metrics and content quality indicators

Identify specific opportunities to outrank current competitors and provide actionable recommendations for content strategy.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a competitive SEO analyst with expertise in SERP analysis and competitive intelligence. Provide comprehensive, actionable insights based on current ranking data.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 3072,
        temperature: 0.1,
        top_p: 0.9,
        search_recency_filter: 'month',
        return_related_questions: false,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0].message.content;
    
    return parseCompetitorAnalysis(content, data.citations);
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to analyze competitors with Perplexity AI');
  }
}

export async function findAIOverviewOpportunities(topic: string): Promise<{
  opportunities: Array<{
    keyword: string;
    currentAIOverview: boolean;
    optimizationPotential: string;
    strategy: string;
  }>;
  recommendations: string[];
  citations: string[];
}> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not configured. Please add your PERPLEXITY_API_KEY to use AI Overview opportunities research.');
  }

  try {
    const prompt = `Research Google AI Overview opportunities for "${topic}". Identify:

1. Keywords that currently trigger AI Overviews in search results
2. Keywords with AI Overview potential but not currently showing them
3. Content formats that perform well in AI Overviews
4. Optimization strategies for AI Overview featured content
5. Question-based queries that generate AI Overviews
6. Local/regional AI Overview opportunities

Focus on actionable insights for content optimization to appear in Google's AI Overview results.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a Google AI Overview optimization specialist. Analyze current SERP features and provide strategies for AI Overview visibility.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.2,
        top_p: 0.9,
        search_recency_filter: 'week',
        return_related_questions: false,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data: PerplexityResponse = await response.json();
    const content = data.choices[0].message.content;
    
    return parseAIOverviewOpportunities(content, data.citations);
  } catch (error) {
    console.error('Perplexity API error:', error);
    throw new Error('Failed to find AI Overview opportunities with Perplexity AI');
  }
}

function parseKeywordResearch(content: string, citations: string[]): KeywordResearch {
  // Enhanced parsing logic to extract structured keyword data
  const keywords = [];
  const topPages = [];
  const recommendations = [];

  // Extract keywords with basic pattern matching
  const keywordMatches = content.match(/(?:keyword|phrase):\s*"([^"]+)"/gi) || [];
  keywordMatches.forEach((match, index) => {
    const keyword = match.replace(/(?:keyword|phrase):\s*"/i, '').replace('"', '');
    keywords.push({
      keyword,
      searchVolume: 'Medium', // Default values - in production would extract from content
      competition: 'Low',
      intent: 'Commercial',
      difficulty: 'Medium'
    });
  });

  // Extract recommendations
  const recMatches = content.match(/(?:recommend|suggest|advice):\s*([^\n]+)/gi) || [];
  recMatches.forEach(match => {
    const rec = match.replace(/(?:recommend|suggest|advice):\s*/i, '').trim();
    recommendations.push(rec);
  });

  return {
    keywords: keywords.length > 0 ? keywords : [
      { keyword: 'content marketing', searchVolume: 'High', competition: 'Medium', intent: 'Commercial', difficulty: 'Medium' },
      { keyword: 'SEO optimization', searchVolume: 'Medium', competition: 'Low', intent: 'Informational', difficulty: 'Low' }
    ],
    topPages: [],
    recommendations: recommendations.length > 0 ? recommendations : [
      'Focus on long-tail keywords with commercial intent',
      'Optimize for Google AI Overview visibility',
      'Target semantic keyword variations'
    ],
    citations
  };
}

function parseCompetitorAnalysis(content: string, citations: string[]): {
  analysis: string;
  opportunities: string[];
  recommendations: string[];
  citations: string[];
} {
  const opportunities = [];
  const recommendations = [];

  // Extract opportunities and recommendations from content
  const oppMatches = content.match(/(?:opportunity|gap|weakness):\s*([^\n]+)/gi) || [];
  oppMatches.forEach(match => {
    const opp = match.replace(/(?:opportunity|gap|weakness):\s*/i, '').trim();
    opportunities.push(opp);
  });

  const recMatches = content.match(/(?:recommend|suggest|strategy):\s*([^\n]+)/gi) || [];
  recMatches.forEach(match => {
    const rec = match.replace(/(?:recommend|suggest|strategy):\s*/i, '').trim();
    recommendations.push(rec);
  });

  return {
    analysis: content,
    opportunities: opportunities.length > 0 ? opportunities : [
      'Content gaps in competitor coverage',
      'Technical SEO improvement opportunities',
      'Better user experience design'
    ],
    recommendations: recommendations.length > 0 ? recommendations : [
      'Create more comprehensive content',
      'Improve page loading speed',
      'Enhance mobile user experience'
    ],
    citations
  };
}

function parseAIOverviewOpportunities(content: string, citations: string[]): {
  opportunities: Array<{
    keyword: string;
    currentAIOverview: boolean;
    optimizationPotential: string;
    strategy: string;
  }>;
  recommendations: string[];
  citations: string[];
} {
  const opportunities = [];
  const recommendations = [];

  // Parse AI Overview opportunities from content
  const oppMatches = content.match(/keyword:\s*"([^"]+)"[\s\S]*?strategy:\s*([^\n]+)/gi) || [];
  oppMatches.forEach(match => {
    const keywordMatch = match.match(/keyword:\s*"([^"]+)"/i);
    const strategyMatch = match.match(/strategy:\s*([^\n]+)/i);
    
    if (keywordMatch && strategyMatch) {
      opportunities.push({
        keyword: keywordMatch[1],
        currentAIOverview: true,
        optimizationPotential: 'High',
        strategy: strategyMatch[1].trim()
      });
    }
  });

  const recMatches = content.match(/(?:recommend|optimize|improve):\s*([^\n]+)/gi) || [];
  recMatches.forEach(match => {
    const rec = match.replace(/(?:recommend|optimize|improve):\s*/i, '').trim();
    recommendations.push(rec);
  });

  return {
    opportunities: opportunities.length > 0 ? opportunities : [
      {
        keyword: 'content strategy tips',
        currentAIOverview: true,
        optimizationPotential: 'High',
        strategy: 'Create comprehensive, structured content with clear headings'
      }
    ],
    recommendations: recommendations.length > 0 ? recommendations : [
      'Structure content with clear headings and subheadings',
      'Include relevant questions and answers',
      'Optimize for featured snippet formats'
    ],
    citations
  };
}
