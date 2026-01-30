"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const fetcher_1 = require("./services/fetcher");
const feishu_1 = require("./services/feishu");
const config_1 = require("./config");
const fetcher = new fetcher_1.NewsFetcher();
const feishu = new feishu_1.FeishuService();
async function runTask() {
    console.log('Starting daily news task...');
    try {
        const news = await fetcher.fetchAll();
        console.log(`Fetched ${news.length} news items.`);
        // 简单的关键词过滤（可选，目前保留所有相关源的新闻）
        // const filteredNews = news.filter(item => ...);
        await feishu.sendNewsDigest(news);
        console.log('Daily task completed.');
    }
    catch (error) {
        console.error('Error in daily task:', error);
    }
}
// 立即运行一次（用于测试）
if (process.argv.includes('--run-now')) {
    runTask();
}
else {
    // 定时任务
    console.log(`Scheduler started. Cron: ${config_1.CONFIG.SCHEDULE_CRON}`);
    node_schedule_1.default.scheduleJob(config_1.CONFIG.SCHEDULE_CRON, runTask);
}
//# sourceMappingURL=index.js.map