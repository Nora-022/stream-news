import dotenv from 'dotenv';

dotenv.config();

export type Category = 'Technology Update' | 'Industry News' | 'Competitor Intelligence';

export interface NewsSource {
  name: string;
  url: string;
  defaultCategory: Category;
  authorityLevel: 'S' | 'A' | 'B' | 'C';
  description?: string;
}

export const NEWS_SOURCES: NewsSource[] = [
  // --- Chinese Tech Sources (Free & Native) ---
  {
    name: 'InfoQ CN (架构/音视频)',
    url: 'https://www.infoq.cn/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'InfoQ 中文站，涵盖架构与前沿技术'
  },
  {
    name: 'OSChina (开源/资讯)',
    url: 'https://www.oschina.net/news/rss',
    defaultCategory: 'Industry News',
    authorityLevel: 'A',
    description: '开源中国最新资讯'
  },
  {
    name: 'Solidot (硬核科技)',
    url: 'https://www.solidot.org/index.rss',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: '奇客的资讯，关注安全与黑客技术'
  },
  {
    name: '36Kr (行业资讯)',
    url: 'https://www.36kr.com/feed',
    defaultCategory: 'Industry News',
    authorityLevel: 'A',
    description: '科技创投媒体'
  },
  {
    name: 'V2EX (技术讨论)',
    url: 'https://www.v2ex.com/index.xml',
    defaultCategory: 'Industry News',
    authorityLevel: 'B',
    description: 'V2EX 社区热点'
  },

  // --- Specialized DRM/Security (English - Kept as Fallback) ---
  // 由于中文 DRM 专有源极少，保留核心英文源，若有重大更新仍需关注
  {
    name: 'TorrentFreak (DRM News)',
    url: 'https://torrentfreak.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'A',
    description: '反盗版与版权法律核心媒体'
  },
  
  /* 
  // --- English Sources (Disabled for non-paid user preference) ---
  {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'Netflix 官方技术博客'
  },
  {
    name: 'Bitmovin Blog',
    url: 'https://bitmovin.com/blog/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: '视频编码与播放器技术权威博客'
  },
  */
];

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Technology Update': [
    'DRM', 'encryption', 'Widevine', 'PlayReady', 'FairPlay', 'license', 
    'content protection', 'watermarking', 'CDM', 'pipeline', 'encoding', 
    'codec', 'AV1', 'HEVC', 'anti-piracy', 'latency', 'transcoding', 'hls', 'dash'
  ],
  'Competitor Intelligence': [
    'StreamFab', 'CleverGet', 'AnyStream', 'KeepStreams', 'downloader', 
    'ripper', 'converter', 'DVDFab', 'RedFox', 'Tunepat', 'NoteBurner'
  ],
  'Industry News': [
    'Netflix', 'Disney+', 'YouTube', 'Prime Video', 'Hulu', 'HBO', 
    'Peacock', 'Paramount+', 'OTT', 'streaming service', 'subscriber', 
    'market share', 'partnership', 'acquisition', 'launch'
  ]
};

export const TECH_SIGNALS = [
  'update', 'upgrade', 'rollout', 'patch', 'fix', 'release', 'version', 
  'policy', 'enforcement', 'L1', 'L3', 'SL2000', 'SL3000', 'deprecation', 'vulnerability'
];

export const NOISE_KEYWORDS = [
  'announces partnership', 'marketing', 'campaign', 'event recap', 
  'webinar', 'whitepaper', 'press release', 'award', 'hiring', 'quarterly results'
];

export const AUTHORITY_WEIGHTS = {
  'S': 30,
  'A': 25,
  'B': 15,
  'C': 5
};

export const CONFIG = {
  FEISHU_WEBHOOK_URL: process.env.FEISHU_WEBHOOK_URL || '',
  SCHEDULE_CRON: process.env.SCHEDULE_CRON || '0 9 * * *',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini' // 默认使用更经济的模型
};
