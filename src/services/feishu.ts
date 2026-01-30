import axios from 'axios';
import { CONFIG, type Category } from '../config.js';
import type { NewsItem } from './fetcher.js';

export class FeishuService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = CONFIG.FEISHU_WEBHOOK_URL;
  }

  async sendNewsDigest(groupedNews: Record<Category, NewsItem[]>) {
    if (!this.webhookUrl) {
      console.error('Feishu Webhook URL is not configured.');
      return;
    }

    const hasNews = Object.values(groupedNews).some(items => items.length > 0);
    if (!hasNews) {
      console.log('No new news to send.');
      return;
    }

    const cardContent = {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: `📡 每日行业情报简报 - ${new Date().toLocaleDateString()}`
        },
        template: 'blue'
      },
      elements: [] as any[]
    };

    const categoryEmojis: Record<Category, string> = {
      'Technology Update': '🔔 技术预警',
      'Competitor Intelligence': '⚔️ 竞品情报',
      'Industry News': '📰 行业新闻'
    };

    const categoryChinese: Record<Category, string> = {
      'Technology Update': '技术预警',
      'Competitor Intelligence': '竞品情报',
      'Industry News': '行业新闻'
    };

    // Build Card Content
    for (const [category, items] of Object.entries(groupedNews)) {
      if (items.length > 0) {
        // Section Header (Category)
        const cat = category as Category;
        const catTitle = categoryEmojis[cat] || `🔹 ${category}`;

        cardContent.elements.push({
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `**${catTitle}**`
          }
        });
        
        cardContent.elements.push({
           tag: 'hr'
        });

        // Items
        items.forEach((item, index) => {
          // Determine Color for Impact Level
          let impactColor = 'grey';
          if (item.impactLevel === '高') impactColor = 'red';
          else if (item.impactLevel === '中') impactColor = 'orange';
          else impactColor = 'green';

          // Content Block
          const contentBlock = `**影响等级**：<font color="${impactColor}">${item.impactLevel}</font>\n\n**内容摘要**：\n${item.summary}\n\n**潜在影响**：\n${item.potentialImpact}\n\n**行动建议**：\n${item.actionSuggestion}\n\n**来源**：\n[${item.source}](${item.link})`;

          cardContent.elements.push({
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: contentBlock
            }
          });

          // Separator between items (except last one)
          if (index < items.length - 1) {
            cardContent.elements.push({
              tag: 'hr'
            });
          }
        });
        
        // Large Separator between Categories
        cardContent.elements.push({
            tag: 'markdown',
            content: '---' 
        });
      }
    }

    // Footer
    cardContent.elements.push({
      tag: 'note',
      elements: [
        {
          tag: 'plain_text',
          content: 'Powered by StreamDRM Bot | 每日 09:00 推送'
        }
      ]
    });

    try {
      await axios.post(this.webhookUrl, {
        msg_type: 'interactive',
        card: cardContent
      });
      console.log('Feishu message sent successfully.');
    } catch (error) {
      console.error('Error sending Feishu message:', error);
    }
  }
}
