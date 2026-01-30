"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = exports.NEWS_SOURCES = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.NEWS_SOURCES = [
    {
        name: 'TorrentFreak',
        url: 'https://torrentfreak.com/feed/',
        category: 'DRM',
        description: '关注DRM破解、反盗版和法律诉讼的核心新闻源'
    },
    {
        name: 'Streaming Media',
        url: 'https://www.streamingmedia.com/RSS.aspx?xml=tab_Featured-Articles',
        category: 'Streaming',
        description: '流媒体行业深度文章和技术趋势'
    },
    {
        name: 'Digital TV Europe',
        url: 'https://www.digitaltveurope.com/feed/',
        category: 'Streaming',
        description: '欧洲及全球流媒体市场资讯'
    },
    {
        name: 'Bitmovin Blog',
        url: 'https://bitmovin.com/blog/feed',
        category: 'Tech',
        description: '流媒体技术实现，包含编码、播放器和DRM技术'
    }
];
exports.CONFIG = {
    FEISHU_WEBHOOK_URL: process.env.FEISHU_WEBHOOK_URL || '',
    SCHEDULE_CRON: process.env.SCHEDULE_CRON || '0 9 * * *', // 每天上午9点
    KEYWORDS: ['DRM', 'Encryption', 'Decryption', 'Piracy', 'Streaming', 'Widevine', 'FairPlay', 'PlayReady']
};
//# sourceMappingURL=config.js.map