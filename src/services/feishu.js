"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const fetcher_1 = require("./fetcher");
class FeishuService {
    webhookUrl;
    constructor() {
        this.webhookUrl = config_1.CONFIG.FEISHU_WEBHOOK_URL;
    }
    async sendNewsDigest(newsItems) {
        if (!this.webhookUrl) {
            console.error('Feishu Webhook URL is not configured.');
            return;
        }
        if (newsItems.length === 0) {
            console.log('No new news to send.');
            return;
        }
        // 按类别分组
        const groupedNews = {
            'DRM': [],
            'Streaming': [],
            'Tech': []
        };
        newsItems.forEach(item => {
            if (groupedNews[item.category]) {
                groupedNews[item.category].push(item);
            }
        });
        const cardContent = {
            config: {
                wide_screen_mode: true
            },
            header: {
                title: {
                    tag: 'plain_text',
                    content: `📅 每日流媒体与DRM资讯推送 - ${new Date().toLocaleDateString()}`
                },
                template: 'blue'
            },
            elements: []
        };
        // 构建卡片内容
        for (const [category, items] of Object.entries(groupedNews)) {
            if (items.length > 0) {
                cardContent.elements.push({
                    tag: 'div',
                    text: {
                        tag: 'lark_md',
                        content: `**${category} 专区**`
                    }
                });
                items.forEach(item => {
                    cardContent.elements.push({
                        tag: 'div',
                        text: {
                            tag: 'lark_md',
                            content: `[${item.title}](${item.link})\n来源: ${item.source} | 时间: ${new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n${item.contentSnippet?.substring(0, 100)}...`
                        }
                    });
                    cardContent.elements.push({
                        tag: 'hr'
                    });
                });
            }
        }
        // 添加底部信息
        cardContent.elements.push({
            tag: 'note',
            elements: [
                {
                    tag: 'plain_text',
                    content: 'Powered by AI News Aggregator'
                }
            ]
        });
        try {
            await axios_1.default.post(this.webhookUrl, {
                msg_type: 'interactive',
                card: cardContent
            });
            console.log('Feishu message sent successfully.');
        }
        catch (error) {
            console.error('Error sending Feishu message:', error);
        }
    }
}
exports.FeishuService = FeishuService;
//# sourceMappingURL=feishu.js.map