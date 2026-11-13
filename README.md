# DeskBox

> 写代码，也写生活。

DeskBox 是一个用 [Astro](https://astro.build) 构建的个人博客，部署在 GitHub Pages：<https://xlyxh.github.io/deskbox-blog/>

这是对原博客 [Chronicle-IRAS/deskbox-blog](https://github.com/Chronicle-IRAS/deskbox-blog) 的完全重做：原仓库只用来提取文章、标签、关于页与评论配置等内容，视觉、结构与交互全部重新设计。

## 设计方向

**「桌上的台灯」**：白天是一张纸，夜里是一盏台灯。

- **配色**：白天是暖灰纸面 `#F1EEE8` + 墨色 `#1B1A17` + 焦橙 `#C2410C`；夜晚是深色桌面 `#0F0E0C` + 台灯琥珀 `#FFB054`。背景是一层很淡的切割垫网格和纸面颗粒。
- **字体**：标题用 Fraunces（拉丁）+ Noto Serif SC（中文，按页面实际用字子集化，约 40 KB），正文与界面用 Geist + 系统中文黑体，代码用 Geist Mono。全部自托管，没有 Google Fonts 等外部请求，国内访问友好。
- **阅读优先**：正文 700px 栏宽、1.9 倍行高、中西文自动间距；所有动效只出现在导航、列表与过渡里，不打扰阅读。开启「减少动态效果」后动画全部关闭。

### 交互

| 交互 | 位置 |
|---|---|
| 液态玻璃导航：SVG 位移贴图做边缘折射，滑动的玻璃水滴标示当前页，下滚收起、上滚出现 | 全站（Chrome / Edge 有真折射，其它浏览器为磨砂玻璃） |
| 台灯拉绳：拖动右上角的灯绳切换深色模式，新主题从灯绳处以圆形光扩散开 | 全站 |
| 跟随鼠标的台灯光、卡片边框聚光 | 首页、列表、标签 |
| 标题解码动效、实时时钟与问候、数字滚动 | 首页 |
| 列表悬停时跟随鼠标的预览卡（封面或首字色块），带速度倾斜 | 首页、文章、标签页 |
| 标签筛选：滑动指示条 + FLIP 平滑重排，筛选状态写入 URL | 文章页 |
| 页面间视图过渡，文章标题从列表「飞」到文章页 | 全站（Astro View Transitions） |
| 目录滚动高亮 + 发光指示条、阅读进度（导航底线 + 进度环）| 文章 |
| 代码块复制、图片 FLIP 放大、脚注悬浮预览、字号 / 黑体宋体切换 | 文章 |
| 写作日历热力图、随滚动绘制的时间线 | 归档 |
| ⌘K / `/` 命令面板搜索（Pagefind 全文索引）| 全站 |
| 磁吸按钮、页脚字标靠近点亮、404 闪烁台灯 | 全站 |

### 参考

- [rainzt.cn（朝朝听雨）](https://rainzt.cn/) 及其友链中的博客：借鉴了「站点即仪表盘」的思路——首页的时钟问候、站点统计（文章 / 标签 / 字数 / 运行天数）、分类胶囊筛选、带年份的时间线归档、带编号与高亮的文章目录、右下角阅读进度环与回到顶部。视觉上没有沿用它的二次元风格，代码与素材均为自写。
- [muyudada 的液态玻璃导航教程](https://muyudada.dpdns.org/posts/liquid-glass-navbar/)：位移贴图折射的思路。
- 个人网站 [chronicle-site](https://xlyxh.github.io/chronicle-site/)：同一家族的液态玻璃语言，博客另有自己的配色与气质。

## 写文章

文章放在 `src/content/blog/年/月/slug/index.md`（或 `.mdx`），图片和正文放在同一目录。

```md
---
title: 文章标题                # 必填，≤ 80 字
description: 一句能独立成立的摘要  # 必填，20–160 字
slug: my-post                  # 必填，kebab-case，全站唯一，决定 URL /blog/my-post/
pubDate: 2026-11-13            # 必填，按 Asia/Shanghai 日期判断是否已发布
updatedDate: 2026-11-20        # 可选
tags: [前端, 工程实践]          # 可选，最多 3 个，须在 src/config.ts 中登记
draft: false                   # 可选，true 时不会被构建
cover: ./cover.png             # 可选，需同时写 coverAlt
coverAlt: 封面说明
series: { name: 工程实践札记, order: 3 }  # 可选，专栏
---
```

- 草稿和未来日期的文章会在构建时排除（不进入列表、RSS、搜索与站点地图）。
- 新标签先在 `src/config.ts` 的 `tags` 里加一项（名称、slug、描述）。
- 支持 GFM 表格、脚注、代码高亮（Shiki 双主题），`##` / `###` 自动进入目录。
- 作者信息、社交链接、评论配置都在 `src/config.ts`。原站的邮箱和一句话简介是占位符，已暂时隐藏，填上真实内容即可。

## 本地开发

```bash
npm install
npm run dev        # http://localhost:4321/deskbox-blog/
npm run build      # 构建到 dist/，并生成搜索索引与中文标题字体子集
npm run preview    # 预览构建结果
```

需要 Node 22+。`npm run build` 会调用 `python3 -m fontTools.subset` 和系统里的 Noto Serif CJK（Debian/Ubuntu：`fonts-noto-cjk`）给中文标题字子集化；没有时会跳过并沿用仓库里已提交的字体文件。拉丁字体由 `npm run fonts` 一次性下载并裁剪（需 `pip install fonttools brotli`）。

## 部署

```bash
npm run deploy
```

脚本会构建并把 `dist/` 强制推送到 `gh-pages` 分支；仓库的 Pages 设置为「Deploy from a branch → gh-pages / (root)」。换域名时修改 `astro.config.mjs` 里的 `SITE` 与 `BASE`。

## 目录

```
src/
  config.ts            站点信息、标签、评论配置
  content/blog/        文章（Markdown / MDX）
  components/          导航、页脚、搜索面板、文章行、预览卡…
  layouts/Base.astro   页面骨架、SEO、主题初始化
  pages/               首页、文章、标签、归档、关于、隐私、搜索、404、RSS、OG 图
  scripts/             客户端交互（无框架，原生 TypeScript）
  styles/              设计令牌与正文排版
scripts/               构建后处理、字体下载、部署
```
