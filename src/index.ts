import schedule from 'node-schedule';
import { NewsFetcher } from './services/fetcher.js';
import { FeishuService } from './services/feishu.js';
import { CONFIG } from './config.js';

const fetcher = new NewsFetcher();
const feishu = new FeishuService();

async function runTask() {
  console.log('Starting daily news task...');
  try {
    // Fetch, Process, Categorize, Score, Deduplicate, and Filter Top 3
    const groupedNews = await fetcher.fetchAndProcess();
    
    // Log summary
    let totalItems = 0;
    Object.entries(groupedNews).forEach(([category, items]) => {
      console.log(`${category}: ${items.length} items`);
      totalItems += items.length;
    });

    if (totalItems > 0) {
      await feishu.sendNewsDigest(groupedNews);
    } else {
      console.log('No relevant news found for today.');
    }
    
    console.log('Daily task completed.');
  } catch (error) {
    console.error('Error in daily task:', error);
  }
}

// 立即运行一次（用于测试）
if (process.argv.includes('--run-now')) {
  runTask();
} else {
  // 定时任务
  console.log(`Scheduler started. Cron: ${CONFIG.SCHEDULE_CRON}`);
  schedule.scheduleJob(CONFIG.SCHEDULE_CRON, runTask);
}
