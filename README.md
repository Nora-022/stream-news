# StreamDRM News Bot - 流媒体行业情报自动推送机器人

这是一个自动化工具，用于每日抓取、筛选并推送流媒体 DRM（数字版权管理）、反盗版技术及行业动态到飞书群组。

## ✨ 功能特性

*   **多源聚合**：支持 TorrentFreak, StreamingMedia, Netflix Tech Blog 等多个权威信息源。
*   **智能分类**：自动将新闻归类为：
    *   🔔 **技术预警** (Technology Update)
    *   📰 **行业新闻** (Industry News)
    *   ⚔️ **竞品情报** (Competitor Intelligence)
*   **智能评分**：基于来源权威度、关键词匹配、技术信号提取等多维度打分，每日仅推送 Top 3。
*   **飞书卡片**：生成包含摘要、影响等级、行动建议的精美飞书交互式卡片。

## 🚀 快速开始

### 1. 环境准备
*   Node.js (v16 或更高版本)
*   npm

### 2. 安装依赖
```bash
npm install
```

### 3. 配置
1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   # Windows: copy .env.example .env
   ```
2. 编辑 `.env` 文件，填入你的飞书 Webhook 地址：
   ```env
   FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxxxxxxx-xxxx-xxxx-xxxx
   SCHEDULE_CRON=0 9 * * *  # 每天上午 9:00 运行
   ```

### 4. 编译与运行
```bash
# 编译 TypeScript 代码
npm run build

# 启动服务 (会常驻后台运行定时任务)
npm start
```

---

## 🛠️ 部署指南

### 方式一：使用 PM2 部署 (推荐 - 适用于服务器/长期运行的电脑)

PM2 是一个 Node.js 进程管理器，可以保证程序在崩溃后自动重启，并支持开机自启。

1. **全局安装 PM2**:
   ```bash
   npm install pm2 -g
   ```

2. **启动应用**:
   ```bash
   npm run build
   pm2 start dist/index.js --name "stream-drm-bot"
   ```

3. **查看日志**:
   ```bash
   pm2 logs stream-drm-bot
   ```

4. **设置开机自启**:
   ```bash
   pm2 startup
   pm2 save
   ```

### 方式二：使用 GitHub Actions (推荐 - 免费 & 无需服务器)

如果你没有服务器，可以使用 GitHub Actions 每天定时运行一次。

1. 将代码上传到 GitHub 仓库。
2. 在 GitHub 仓库设置中：`Settings` -> `Secrets and variables` -> `Actions`。
3. 添加 Repository secret: `FEISHU_WEBHOOK_URL`，填入你的 Webhook 地址。
4. 在项目根目录创建 `.github/workflows/daily-news.yml` 文件：

```yaml
name: Daily StreamDRM News

on:
  schedule:
    - cron: '0 1 * * *' # UTC 时间 1:00 (北京时间 9:00)
  workflow_dispatch: # 允许手动触发

jobs:
  run-bot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Run Bot
        env:
          FEISHU_WEBHOOK_URL: ${{ secrets.FEISHU_WEBHOOK_URL }}
        run: npm start -- --run-now
```

---

## 📁 项目结构

*   `src/config.ts`: 配置新闻源、关键词、权重和 Cron 表达式。
*   `src/services/fetcher.ts`: 负责 RSS 抓取、清洗、分类、打分和分析。
*   `src/services/feishu.ts`: 负责构建和发送飞书消息卡片。
*   `src/index.ts`: 程序入口，处理调度逻辑。

## ⚙️ 高级配置 (src/config.ts)

你可以随时在代码中调整以下策略：
*   **NEWS_SOURCES**: 添加或删除 RSS 源。
*   **CATEGORY_KEYWORDS**: 调整分类关键词。
*   **TECH_SIGNALS**: 调整识别“技术预警”的信号词。
*   **AUTHORITY_WEIGHTS**: 调整不同来源的权重。
