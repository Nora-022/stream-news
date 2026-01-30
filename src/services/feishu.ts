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

    // Flatten all items to process them in a single flow
    const allItems = Object.values(groupedNews).flat();
    if (allItems.length === 0) {
      console.log('No new news to send.');
      return;
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

    // 1. Generate Global Summary (Aggregation of titles)
    const summaryText = allItems.slice(0, 5).map(i => i.title).join('；') + '。';

    const cardContent = {
      config: {
        wide_screen_mode: true
      },
      header: {
        title: {
          tag: 'plain_text',
          content: `StreamFab 情报(${dateStr})`
        },
        template: 'red' // Red header as per image
      },
      elements: [] as any[]
    };

    // 2. Global Intelligence Section
    cardContent.elements.push({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `## 🌎 StreamFab 全球情报\n${summaryText}`
      }
    });

    cardContent.elements.push({
      tag: 'hr'
    });

    // 3. Item Sections
    allItems.forEach((item, index) => {
      // Determine Icon: Red Circle for High Impact/Competitor, Diamond for others
      let icon = '💎';
      if (item.impactLevel === '高' || item.category === 'Competitor Intelligence') {
        icon = '🔴';
      }

      // Title Line: ### 💎 [Region] Title
      const titleLine = `### ${icon} [${item.region}] ${item.title}`;

      // Fields
      // Region: ... | Type: ...
      const fieldLine1 = `**区域**: ${item.region} | **类型**: ${item.type}`;
      
      // Analysis
      const analysisLine = `**分析**: ${item.potentialImpact}`;
      
      // Suggestion
      const suggestionLine = `**建议**: ${item.actionSuggestion}`;

      // Source Link
      const sourceLine = `[🔗 来源: ${item.source}](${item.link})`;

      // Combine into one markdown block
      const contentBlock = `${titleLine}\n${fieldLine1}\n${analysisLine}\n${suggestionLine}\n${sourceLine}`;

      cardContent.elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: contentBlock
        }
      });

      // Separator (except last)
      if (index < allItems.length - 1) {
        cardContent.elements.push({
          tag: 'hr'
        });
      }
    });

    // Footer
    cardContent.elements.push({
      tag: 'note',
      elements: [
        {
          tag: 'plain_text',
          content: 'Powered by StreamDRM Bot'
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
