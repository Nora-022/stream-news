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
  // --- Specialized DRM & Security Vendors (High Relevance) ---
  {
    name: 'CastLabs (DRM/Player)',
    url: 'https://castlabs.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'DRM licensing and player technology updates'
  },
  {
    name: 'EZDRM Blog',
    url: 'https://www.ezdrm.com/blog/rss.xml',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'DRM as a Service provider updates'
  },
  {
    name: 'Intertrust Tech',
    url: 'https://www.intertrust.com/feed/',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'Digital trust and security technology'
  },
  {
    name: 'Bitmovin Engineering',
    url: 'https://bitmovin.com/blog/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'Video infrastructure and encoding/DRM'
  },

  // --- Streaming Giants Engineering (Platform Specifics) ---
  {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com/feed',
    defaultCategory: 'Technology Update',
    authorityLevel: 'S',
    description: 'Deep dives into streaming architecture and security'
  },
  {
    name: 'Android Developers',
    url: 'https://feeds.feedburner.com/blogspot/hsDu',
    defaultCategory: 'Technology Update',
    authorityLevel: 'A',
    description: 'Android platform updates (filtered for Media/DRM)'
  },

  // --- Security & Industry News ---
  {
    name: 'TorrentFreak (DRM/Piracy)',
    url: 'https://torrentfreak.com/feed/',
    defaultCategory: 'Competitor Intelligence',
    authorityLevel: 'A',
    description: 'Tracks DRM cracks and piracy tools'
  },
  {
    name: 'Streaming Media (Encryption)',
    url: 'https://www.streamingmedia.com/RSS/',
    defaultCategory: 'Industry News',
    authorityLevel: 'B',
    description: 'General industry news (filtered)'
  }
];

export const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Technology Update': [
    'Widevine', 'PlayReady', 'FairPlay', 'DRM', 'CDM', 'EME', 
    'Encrypted Media', 'AES-128', 'CENC', 'Watermarking', 'Multi-DRM',
    'Licensing', 'Obfuscation', 'TEE', 'HDCP', 'MPEG-CENC', 'ClearKey',
    'Encoding', 'Packaging', 'Shaka', 'ExoPlayer', 'AV1', 'HEVC'
  ],
  'Competitor Intelligence': [
    'Crack', 'Bypass', 'Decryption', 'Ripper', 'Downloader', 
    'StreamFab', 'AnyStream', 'DVDFab', 'RedFox', 'Widevine L3', 
    'Key Extraction', 'Revocation', 'Piracy'
  ],
  'Industry News': [
    'Amazon', 'Disney+', 'Netflix', 'Hulu', 'HBO', 'Peacock', 
    'Paramount+', 'Apple TV+', 'Subscriber', 'Launch', 'Expansion'
  ]
};

// Strict filter: Content MUST contain at least one of these to be shown
export const DRM_FILTER_KEYWORDS = [
  'DRM', 'Widevine', 'PlayReady', 'FairPlay', 'Encryption', 'Security',
  'Watermark', 'Piracy', 'Protection', 'License', 'CDM', 'EME', 'Key'
];

export const TECH_SIGNALS = [
  'Release', 'Update', 'Vulnerability', 'Patch', 'Deprecation', 
  'L1', 'L3', 'Level 1', 'Level 3', 'Hardware Security'
];

// 噪音关键词 - 需要过滤掉的内容
export const NOISE_KEYWORDS = [
  // 营销类
  'announces partnership', 'marketing', 'campaign', 'event recap',
  'webinar', 'whitepaper', 'press release', 'award', 'hiring', 'quarterly results',

  // 中文噪音
  '活动回顾', '邀请函', '优惠', '促销', '抽奖', '福利',
  '招聘', '热招', '诚聘', '实习', '校招',
  '获奖', '荣誉', '榜单', '排名',

  // 低质量信号
  'tips', '技巧', '教程', '入门', '新手',
  'best practices', '最佳实践', '指南', '攻略',

  // 短内容
  '每日一题', '日报', '周报', '资讯汇总', '快讯', '简报',
  '一分钟', '快速了解', '速读',

  // 软广
  '限时', '免费领取', '扫码', '点击', '链接'
];

export const AUTHORITY_WEIGHTS = {
  'S': 30,
  'A': 25,
  'B': 15,
  'C': 5
};

export const CONFIG = {
  FEISHU_WEBHOOK_URL: process.env.FEISHU_WEBHOOK_URL || 'https://open.feishu.cn/open-apis/bot/v2/hook/340353ef-39df-4477-b06a-817fc33f3362',
  SCHEDULE_CRON: process.env.SCHEDULE_CRON || '0 9 * * *',

  // ========== Kimi API 配置 (推荐 - 中文能力强) ==========
  OPENAI_API_KEY: process.env.KIMI_API_KEY || 'sk-1stfewpEXbDqJdtPUoNK6A',
  OPENAI_BASE_URL: process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1',
  OPENAI_MODEL: process.env.KIMI_MODEL || 'moonshot-v1-128k',

  // ========== 备选：本地模型 (Ollama) ==========
  // OPENAI_API_KEY: process.env.LOCAL_API_KEY || 'sk-local',
  // OPENAI_BASE_URL: process.env.LOCAL_BASE_URL || 'http://localhost:11434/v1',
  // OPENAI_MODEL: process.env.LOCAL_MODEL || 'deepseek-chat',

  // ========== 备选：DeepSeek 官方 API ==========
  // OPENAI_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  // OPENAI_BASE_URL: 'https://api.deepseek.com/v1',
  // OPENAI_MODEL: 'deepseek-chat',

  // ========== 备选：OpenAI 官方 ==========
  // OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  // OPENAI_BASE_URL: 'https://api.openai.com/v1',
  // OPENAI_MODEL: 'gpt-4o',

  // 质量筛选配置
  MIN_AUTHORITY_LEVEL: 'A', // 只推送 A 级以上源的新闻
  MIN_WORD_COUNT: 100,      // 文章最小字数
  MAX_DAILY_ARTICLES: 15,   // 每日最大推送数量

  // 摘要质量配置
  SUMMARY_MAX_LENGTH: 500,  // 摘要最大长度
  SUMMARY_TEMPERATURE: 0.3, // 较低温度确保摘要准确、稳定
  SUMMARY_SYSTEM_PROMPT: `你是一位专业的科技新闻编辑。请将提供的新闻内容整理成高质量、易读的摘要。

要求：
1. 用简洁专业的中文撰写
2. 突出核心信息和价值点
3. 避免使用"据报道"、"据悉"等模糊表述
4. 结构清晰，可使用1-2个要点
5. 控制在300字以内

格式：
【标题】原新闻标题
【摘要】整理后的摘要内容
【关键词】提取3-5个核心关键词`
};
