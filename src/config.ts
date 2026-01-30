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
  // --- Technology / Engineering (S-Tier) ---
  {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'Netflix 官方技术博客，涵盖流媒体底层架构与 DRM 实践'
  },
  {
    name: 'Bitmovin Blog',
    url: 'https://bitmovin.com/blog/feed', // 修正后的 RSS 地址
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: '视频编码与播放器技术权威博客'
  },
  {
    name: 'Spotify Engineering',
    url: 'https://engineering.atspotify.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'A',
    description: '音频流媒体技术架构'
  },
  {
    name: 'Meta Engineering',
    url: 'https://engineering.fb.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'A',
    description: 'Meta 视频与基础设施技术'
  },

  // --- DRM & Security (A-Tier) ---
  {
    name: 'TorrentFreak',
    url: 'https://torrentfreak.com/feed/',
    defaultCategory: 'Technology Update', // 虽然是新闻，但常含 DRM 破解技术细节
    authorityLevel: 'A',
    description: '反盗版与版权法律核心媒体'
  },
  {
    name: 'VdoCipher Blog',
    url: 'https://www.vdocipher.com/blog/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'B',
    description: '视频安全加密技术博客'
  },
  {
    name: 'Irdeto Blog', // 搜索补充：数字平台安全
    url: 'https://irdeto.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'B',
    description: '数字平台安全与反盗版技术'
  },

  // --- Industry News (A/B-Tier) ---
  {
    name: 'Streaming Media',
    url: 'https://www.streamingmedia.com/RSS/',
    defaultCategory: 'Industry News',
    authorityLevel: 'A',
    description: '流媒体行业深度报道'
  },
  {
    name: 'Broadband TV News',
    url: 'https://www.broadbandtvnews.com/feed/',
    defaultCategory: 'Industry News',
    authorityLevel: 'B',
    description: '欧洲及全球宽带电视资讯'
  },
  {
    name: 'Digital TV Europe',
    url: 'https://www.digitaltveurope.com/feed/',
    defaultCategory: 'Industry News',
    authorityLevel: 'B',
    description: '数字电视行业新闻'
  },
  {
    name: 'EFF Updates',
    url: 'https://www.eff.org/rss/updates.xml',
    defaultCategory: 'Industry News',
    authorityLevel: 'B',
    description: '数字权利与法律更新'
  }
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
