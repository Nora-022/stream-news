import Parser from 'rss-parser';
import OpenAI from 'openai';
import { 
  NEWS_SOURCES, 
  CATEGORY_KEYWORDS, 
  TECH_SIGNALS, 
  NOISE_KEYWORDS, 
  AUTHORITY_WEIGHTS,
  DRM_FILTER_KEYWORDS,
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
  // New Fields for Enhanced Layout
  region: string;
  type: string;
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

          // Strict Filter: Must match at least one DRM keyword
          const fullText = `${item.title} ${item.content || ''} ${item.contentSnippet || ''}`.toLowerCase();
          const hasDrmKeyword = DRM_FILTER_KEYWORDS.some(kw => fullText.includes(kw.toLowerCase()));
          
          // Special exception for "S-Tier" sources (always include if score is high enough)
          const isHighAuthority = source.authorityLevel === 'S';

          if (!hasDrmKeyword && !isHighAuthority) {
            continue;
          }

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

    // Determine Type based on Category
    let type = '行业动态';
    if (category === 'Technology Update') type = '技术预警';
    else if (category === 'Competitor Intelligence') type = '竞品动态';
    else if (category === 'Industry News') type = '平台动态';

    // Determine Region (Simple Heuristic)
    let region = '全球';
    if (fullText.includes('china') || fullText.includes('cn') || fullText.includes('中国')) region = '中国';
    else if (fullText.includes('japan') || fullText.includes('jp') || fullText.includes('日本')) region = '日本';
    else if (fullText.includes('usa') || fullText.includes('us') || fullText.includes('美国')) region = '北美';
    else if (fullText.includes('europe') || fullText.includes('eu') || fullText.includes('欧洲')) region = '欧洲';

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
      actionSuggestion: 'Waiting for analysis...',
      region,
      type
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
  "actionSuggestion": "中文，针对产品研发团队的行动建议",
  "region": "国家或地区（如：全球、北美、日本、欧洲）",
  "type": "简短分类（如：技术预警、平台动态、竞品动态、新商机）"
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
          actionSuggestion: analysis.actionSuggestion,
          region: analysis.region || item.region,
          type: analysis.type || item.type
        };
      }
    } catch (error) {
      console.error(`LLM Analysis failed for ${item.title}:`, error);
    }

    return this.ruleBasedAnalysis(item);
  }

  private ruleBasedAnalysis(item: NewsItem): NewsItem {
    // Fallback logic for non-paid users (ENHANCED)
    let impactLevel: '高' | '中' | '低' = '低';
    
    const lcTitle = item.title.toLowerCase();
    const lcContent = (item.contentSnippet || '').toLowerCase();

    // 1. Impact Level Logic
    if (lcTitle.includes('vulnerability') || lcTitle.includes('exploit') || lcTitle.includes('bypass') || lcTitle.includes('widevine l3') || lcTitle.includes('key extraction')) {
      impactLevel = '高';
    } else if (lcTitle.includes('update') || lcTitle.includes('release') || lcTitle.includes('patch')) {
      impactLevel = '中';
    } else if (item.score >= 40) {
      impactLevel = '中';
    }

    // 2. Summary Logic (Use first 2 sentences instead of raw snippet)
    let summary = item.contentSnippet || '';
    // Remove HTML tags if any (basic regex)
    summary = summary.replace(/<[^>]*>?/gm, '');
    // Take first 300 chars or first 2 sentences
    const sentences = summary.split(/[.!?]/);
    if (sentences.length > 2) {
      summary = sentences.slice(0, 2).join('.') + '.';
    }
    if (summary.length > 300) {
      summary = summary.substring(0, 300) + '...';
    }
    if (!summary) summary = '暂无详细摘要，请查看原文标题。';

    // 3. Potential Impact Logic (Rule-based mapping)
    let potentialImpact = '请技术团队评估该更新对播放器/下载服务的影响。';
    if (lcTitle.includes('dmca') || lcTitle.includes('lawsuit') || lcTitle.includes('court')) {
      potentialImpact = '法律风险：可能涉及反规避条款 (Anti-Circumvention)，需法务评估合规性。';
    } else if (lcTitle.includes('widevine') || lcTitle.includes('drm') || lcTitle.includes('cdm')) {
      potentialImpact = '技术风险：DRM 机制变更可能导致现有 CDM 或解密模块失效。';
    } else if (lcTitle.includes('netflix') || lcTitle.includes('disney') || lcTitle.includes('hulu')) {
      potentialImpact = '平台变动：流媒体平台接口或加密策略可能调整，影响下载成功率。';
    } else if (lcTitle.includes('streamfab') || lcTitle.includes('anystream')) {
      potentialImpact = '竞品动态：竞争对手可能已修复相关问题或发布新功能。';
    }

    // 4. Action Suggestion Logic
    let actionSuggestion = '点击标题查看技术细节。';
    if (impactLevel === '高') {
      actionSuggestion = '高危预警：建议立即安排研发团队进行技术调研与验证。';
    } else if (lcTitle.includes('dmca') || lcTitle.includes('lawsuit')) {
      actionSuggestion = '建议排查产品功能是否涉及类似法律风险。';
    } else if (lcTitle.includes('update') || lcTitle.includes('release')) {
      actionSuggestion = '建议核对版本更新日志，检查是否影响现有功能。';
    }

    // Add Tag based on keywords
    let tag = '';
    if (lcTitle.includes('widevine')) tag = '【Widevine】';
    else if (lcTitle.includes('playready')) tag = '【PlayReady】';
    else if (lcTitle.includes('fairplay')) tag = '【FairPlay】';
    else if (lcTitle.includes('netflix')) tag = '【Netflix】';
    else if (lcTitle.includes('disney')) tag = '【Disney+】';
    else if (lcTitle.includes('dmca')) tag = '【法律合规】';

    if (tag) {
      summary = `${tag} ${summary}`;
    }

    return {
      ...item,
      impactLevel,
      summary,
      potentialImpact,
      actionSuggestion,
      // Keep pre-calculated region/type
      region: item.region,
      type: item.type
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
