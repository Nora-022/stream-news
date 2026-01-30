export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    contentSnippet?: string;
    source: string;
    category: string;
}
export declare class NewsFetcher {
    fetchAll(): Promise<NewsItem[]>;
}
//# sourceMappingURL=fetcher.d.ts.map