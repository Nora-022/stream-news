import Parser from 'rss-parser';
import OpenAI from 'openai';
import { 
  NEWS_SOURCES, 
  CATEGORY_KEYWORDS, 
  TECH_SIGNALS, 
  NOISE_KEYWORDS, 
  AUTHORITY_WEIGHTS,
  CONFIG,
  type NewsSource, 
  type Category 
} from '../config.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

let openai: OpenAI | null = null;
if (CONFIG.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: CONFIG.OPENAI_API_KEY,
    baseURL: CONFIG.OPENAI_BASE_URL
  });
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  source: string;
  category: Category;
  score: number;
  // Analysis Fields
  impactLevel: '高' | '中' | '低';
  summary: string;
  potentialImpact: string;
  actionSuggestion: string;
}

export class NewsFetcher {
  
  async fetchAndProcess(): Promise<Record<Category, NewsItem[]>> {
    const rawItems: NewsItem[] = [];

    // 1. Fetch from all sources
    for (const source of NEWS_SOURCES) {
      if (!source.url.startsWith('http')) {
        console.warn(`Skipping invalid URL source: ${source.name}`);
        continue;
      }

      try {
        console.log(`Fetching news from ${source.name}...`);
        const feed = await parser.parseURL(source.url);
        
        // Filter last 24h
        const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
        
        const recentItems = feed.items.filter(item => {
          const itemDate = item.pubDate ? new Date(item.pubDate).getTime() : 0;
          return itemDate > oneDayAgo;
        });

        for (const item of recentItems) {
          if (!item.title || !item.link) continue;

          // Process each item (Initial Scoring)
          const processedItem = this.preProcessItem(item, source);
          
          // Filter noise
          if (processedItem.score > 0) { 
            rawItems.push(processedItem);
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error);
      }
    }

    // 2. Deduplicate
    const uniqueItems = this.deduplicate(rawItems);

    // 3. Group and Sort (Top 3 Candidates)
    const result: Record<Category, NewsItem[]> = {
      'Technology Update': [],
      'Industry News': [],
      'Competitor Intelligence': []
    };

    // Group
    uniqueItems.forEach(item => {
      if (result[item.category]) {
        result[item.category].push(item);
      }
    });

    // Sort by score and take Top 3 for Analysis
    for (const key of Object.keys(result) as Category[]) {
      result[key].sort((a, b) => b.score - a.score);
      const topItems = result[key].slice(0, 3);
      
      // 4. Deep Analysis with LLM for Top Items
      console.log(`Analyzing top items for ${key}...`);
      const analyzedItems: NewsItem[] = [];
      for (const item of topItems) {
        const analyzed = await this.enrichWithLLM(item);
        analyzedItems.push(analyzed);
      }
      
      result[key] = analyzedItems;
    }

    return result;
  }

  private preProcessItem(item: Parser.Item, source: NewsSource): NewsItem {
    const title = item.title || '';
    const content = (item.contentSnippet || item.content || '').toLowerCase();
    const fullText = `${title} ${content}`.toLowerCase();

    // 1. Determine Category
    let category = this.categorize(fullText, source.defaultCategory);

    // 2. Calculate Score
    let score = 0;
    score += AUTHORITY_WEIGHTS[source.authorityLevel] || 5;

    let keywordMatches = 0;
    const keywords = CATEGORY_KEYWORDS[category];
    keywords.forEach(kw => {
      if (fullText.includes(kw.toLowerCase())) keywordMatches++;
    });
    score += Math.min(keywordMatches * 5, 25);

    score += 15; // Time freshness

    let techSignalMatches = 0;
    TECH_SIGNALS.forEach(signal => {
      if (fullText.includes(signal.toLowerCase())) techSignalMatches++;
    });
    if (techSignalMatches > 0) score += 15;

    NOISE_KEYWORDS.forEach(noise => {
      if (fullText.includes(noise.toLowerCase())) score -= 50;
    });

    // Default analysis (placeholder)
    return {
      title: item.title || 'No Title',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || item.content || '',
      source: source.name,
      category,
      score,
      impactLevel: '低',
      summary: 'Waiting for analysis...',
      potentialImpact: 'Waiting for analysis...',
      actionSuggestion: 'Waiting for analysis...'
    };
  }

  private async enrichWithLLM(item: NewsItem): Promise<NewsItem> {
    if (!openai) {
      // Fallback to rule-based if no OpenAI key
      return this.ruleBasedAnalysis(item);
    }

    try {
      const prompt = `
你是一个流媒体与DRM技术专家助手。请分析以下新闻，并以JSON格式输出中文分析结果。

【新闻标题】: ${item.title}
【新闻内容】: ${item.contentSnippet?.substring(0, 1000)}...
【来源】: ${item.source}
【分类】: ${item.category}

请输出严格的 JSON 格式（不要包含 Markdown 代码块标记）：
{
  "summary": "中文摘要，100字以内，概括核心事实",
  "impactLevel": "高" | "中" | "低",
  "potentialImpact": "中文，说明对流媒体下载/播放/DRM技术的潜在影响",
  "actionSuggestion": "中文，针对产品研发团队的行动建议"
}
`;

      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: CONFIG.OPENAI_MODEL,
        response_format: { type: "json_object" }
      });

      const content = completion.choices[0].message.content;
      if (content) {
        const analysis = JSON.parse(content);
        return {
          ...item,
          summary: analysis.summary,
          impactLevel: analysis.impactLevel,
          potentialImpact: analysis.potentialImpact,
          actionSuggestion: analysis.actionSuggestion
        };
      }
    } catch (error) {
      console.error(`LLM Analysis failed for ${item.title}:`, error);
    }

    return this.ruleBasedAnalysis(item);
  }

  private ruleBasedAnalysis(item: NewsItem): NewsItem {
    // Fallback logic for non-paid users
    let impactLevel: '高' | '中' | '低' = '低';
    
    // Simple heuristic for impact based on score or keywords
    if (item.score >= 60 || item.title.includes('vulnerability') || item.title.includes('漏洞')) impactLevel = '高';
    else if (item.score >= 40) impactLevel = '中';

    // Generate a basic summary using the snippet (truncated)
    const snippet = item.contentSnippet ? item.contentSnippet.substring(0, 150).replace(/\n/g, ' ') + '...' : '暂无详细摘要';
    
    // Provide a generic but polite Chinese message
    const isEnglishSource = /[\u0000-\u00ff]+/.test(item.title); // Rough check if mostly ASCII
    
    let summary = snippet;
    let potentialImpact = '需要人工评估该技术更新的具体影响。';
    let actionSuggestion = '建议点击链接查看原文详情。';

    if (isEnglishSource) {
      summary = `[原语言摘要] ${snippet} (注：由于未配置 AI Key，暂不支持自动翻译)`;
      potentialImpact = '请阅读原文以评估对业务的潜在影响。';
      actionSuggestion = '请直接访问来源链接。';
    }

    return {
      ...item,
      impactLevel,
      summary,
      potentialImpact,
      actionSuggestion
    };
  }

  private categorize(text: string, defaultCategory: Category): Category {
    for (const kw of CATEGORY_KEYWORDS['Competitor Intelligence']) {
      if (text.includes(kw.toLowerCase())) return 'Competitor Intelligence';
    }
    let techCount = 0;
    for (const kw of CATEGORY_KEYWORDS['Technology Update']) {
      if (text.includes(kw.toLowerCase())) techCount++;
    }
    if (techCount >= 1) return 'Technology Update';

    let industryCount = 0;
    for (const kw of CATEGORY_KEYWORDS['Industry News']) {
      if (text.includes(kw.toLowerCase())) industryCount++;
    }
    if (industryCount >= 1) return 'Industry News';

    return defaultCategory;
  }

  private deduplicate(items: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    return items.filter(item => {
      const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(normalizedTitle)) return false;
      seen.add(normalizedTitle);
      return true;
    });
  }
}
