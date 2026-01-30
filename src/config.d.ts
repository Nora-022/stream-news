export interface NewsSource {
    name: string;
    url: string;
    category: 'DRM' | 'Streaming' | 'Tech';
    description?: string;
}
export declare const NEWS_SOURCES: NewsSource[];
export declare const CONFIG: {
    FEISHU_WEBHOOK_URL: string;
    SCHEDULE_CRON: string;
    KEYWORDS: string[];
};
//# sourceMappingURL=config.d.ts.map