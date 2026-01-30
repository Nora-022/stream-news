import dotenv from 'dotenv';

dotenv.config();

export type Category = 'Technology Update' | 'Industry News' | 'Competitor Intelligence';

export interface NewsSource {
  name: string;
  url: string;
  defaultCategory: Category; // 默认分类，如果无法通过关键词识别
  authorityLevel: 'S' | 'A' | 'B' | 'C';
  description?: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  // Technical / DRM Sources
  {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S'
  },
  {
    name: 'Google Widevine Blog', // 假设的URL，实际可能需要更具体的RSS或Monitor
    url: 'https://developers.google.com/widevine/news', // 这是一个网页，RSS fetcher可能需要特殊处理，暂时保留为示例
    defaultCategory: 'Technology Update',
    authorityLevel: 'S'
  },
  {
    name: 'Microsoft PlayReady', // 类似
    url: 'https://learn.microsoft.com/en-us/playready/overview',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S'
  },
  {
    name: 'TorrentFreak',
    url: 'https://torrentfreak.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'A',
    description: '关注DRM破解、反盗版和法律诉讼的核心新闻源'
  },
  {
    name: 'StreamingMedia',
    url: 'https://www.streamingmedia.com/RSS/',
    defaultCategory: 'Industry News',
    authorityLevel: 'A'
  },
  {
    name: 'TVTechnology',
    url: 'https://www.tvtechnology.com/feeds/all',
    defaultCategory: 'Industry News',
    authorityLevel: 'A'
  },
  {
    name: 'VdoCipher Blog',
    url: 'https://www.vdocipher.com/blog/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'B'
  },
  {
    name: 'Broadband TV News',
    url: 'https://www.broadbandtvnews.com/feed/',
    defaultCategory: 'Industry News',
    authorityLevel: 'B'
  },
  {
    name: 'EFF Updates',
    url: 'https://www.eff.org/rss/updates.xml',
    defaultCategory: 'Industry News',
    authorityLevel: 'B'
  }
];

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Technology Update': [
    'DRM', 'encryption', 'Widevine', 'PlayReady', 'FairPlay', 'license', 
    'content protection', 'watermarking', 'CDM', 'pipeline', 'encoding', 
    'codec', 'AV1', 'HEVC', 'anti-piracy'
  ],
  'Competitor Intelligence': [
    'StreamFab', 'CleverGet', 'AnyStream', 'KeepStreams', 'downloader', 
    'ripper', 'converter', 'DVDFab', 'RedFox', 'Tunepat', 'NoteBurner'
  ],
  'Industry News': [
    'Netflix', 'Disney+', 'YouTube', 'Prime Video', 'Hulu', 'HBO', 
    'Peacock', 'Paramount+', 'OTT', 'streaming service', 'subscriber', 
    'market share', 'partnership'
  ]
};

export const TECH_SIGNALS = [
  'update', 'upgrade', 'rollout', 'patch', 'fix', 'release', 'version', 
  'policy', 'enforcement', 'L1', 'L3', 'SL2000', 'SL3000'
];

export const NOISE_KEYWORDS = [
  'announces partnership', 'marketing', 'campaign', 'event recap', 
  'webinar', 'whitepaper', 'press release', 'award', 'hiring'
];

export const AUTHORITY_WEIGHTS = {
  'S': 30, // 30%
  'A': 25,
  'B': 15,
  'C': 5
};

export const CONFIG = {
  FEISHU_WEBHOOK_URL: process.env.FEISHU_WEBHOOK_URL || '',
  SCHEDULE_CRON: process.env.SCHEDULE_CRON || '0 9 * * *',
};
