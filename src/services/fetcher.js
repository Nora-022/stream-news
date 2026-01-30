"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsFetcher = void 0;
const rss_parser_1 = __importDefault(require("rss-parser"));
const config_1 = require("../config");
const parser = new rss_parser_1.default();
class NewsFetcher {
    async fetchAll() {
        const allNews = [];
        for (const source of config_1.NEWS_SOURCES) {
            try {
                console.log(`Fetching news from ${source.name}...`);
                const feed = await parser.parseURL(source.url);
                // 获取最近24小时的新闻
                const oneDayAgo = new Date().getTime() - (24 * 60 * 60 * 1000);
                const recentItems = feed.items.filter(item => {
                    const itemDate = item.pubDate ? new Date(item.pubDate).getTime() : 0;
                    return itemDate > oneDayAgo;
                });
                const mappedItems = recentItems.map(item => ({
                    title: item.title || 'No Title',
                    link: item.link || '',
                    pubDate: item.pubDate || '',
                    contentSnippet: item.contentSnippet || '',
                    source: source.name,
                    category: source.category
                }));
                allNews.push(...mappedItems);
            }
            catch (error) {
                console.error(`Error fetching from ${source.name}:`, error);
            }
        }
        return allNews;
    }
}
exports.NewsFetcher = NewsFetcher;
//# sourceMappingURL=fetcher.js.map