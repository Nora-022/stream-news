import Parser from 'rss-parser';
import { 
  NEWS_SOURCES, 
  CATEGORY_KEYWORDS, 
  TECH_SIGNALS, 
  NOISE_KEYWORDS, 
  AUTHORITY_WEIGHTS,
  type NewsSource, 
  type Category 
} from '../config.js';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

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

          // Process each item
          const processedItem = this.processItem(item, source);
          
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

    // 3. Group and Sort (Top 3)
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

    // Sort by score and take Top 3
    for (const key of Object.keys(result) as Category[]) {
      result[key].sort((a, b) => b.score - a.score);
      result[key] = result[key].slice(0, 3);
    }

    return result;
  }

  private processItem(item: Parser.Item, source: NewsSource): NewsItem {
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

    // 3. Generate Analysis (Rule-based Mock AI)
    const analysis = this.generateAnalysis(fullText, category, score);

    return {
      title: item.title || 'No Title',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || '',
      source: source.name,
      category,
      score,
      ...analysis
    };
  }

  private generateAnalysis(text: string, category: Category, score: number): { impactLevel: '高' | '中' | '低', summary: string, potentialImpact: string, actionSuggestion: string } {
    // Impact Level
    let impactLevel: '高' | '中' | '低' = '低';
    if (score >= 60) impactLevel = '高';
    else if (score >= 40) impactLevel = '中';

    // Summary (In a real scenario, call LLM here. Now just use first 150 chars of text)
    // IMPORTANT: Since we don't have an LLM, we just use the English text but labeled in Chinese structure.
    // If the user *really* needs translation, we'd need an API key.
    const summary = text.substring(0, 200) + '...';

    // Potential Impact (Rule-based)
    let potentialImpact = '暂无明显直接影响，建议持续关注。';
    if (text.includes('widevine') || text.includes('drm')) {
      potentialImpact = '可能涉及内容保护机制变更，影响下载/播放成功率。';
    } else if (text.includes('netflix') || text.includes('disney')) {
      potentialImpact = '主流平台策略调整，需验证产品兼容性。';
    } else if (text.includes('streamfab') || text.includes('downloader')) {
      potentialImpact = '竞品功能更新，可能改变市场竞争格局。';
    }

    // Action Suggestion
    let actionSuggestion = '保持关注即可。';
    if (impactLevel === '高') {
      actionSuggestion = '建议立即安排技术调研，验证是否影响核心功能。';
    } else if (category === 'Competitor Intelligence') {
      actionSuggestion = '建议下载竞品最新版本进行对比测试。';
    } else if (text.includes('update') || text.includes('upgrade')) {
      actionSuggestion = '建议检查相关模块的稳定性。';
    }

    return {
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
