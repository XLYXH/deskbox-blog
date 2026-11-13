# DeskBox

> 写代码，也写生活。

DeskBox 是一个用 [Astro](https://astro.build) 构建的个人博客，部署在 GitHub Pages：<https://xlyxh.github.io/deskbox-blog/>

这是对原博客 [Chronicle-IRAS/deskbox-blog](https://github.com/Chronicle-IRAS/deskbox-blog) 的完全重做：原仓库只用来提取文章、标签、关于页与评论配置等内容，视觉、结构与交互全部重新设计。

## 设计方向（v2）

**「一张纸、一支红笔、一支荧光笔」**：把博客当成一份排好版的印刷品，而不是一块发光的屏幕。

v1 用了液态玻璃、跟随鼠标的台灯光晕、渐变卡片和统计小组件，看起来"很像 AI 生成的模板"。v2 把这些全部拿掉，改成文具和印刷品的语言：

- **配色**：白天是米色纸 `#F4F1E9` + 墨色 `#161513` + 校对红 `#C8321A` + 荧光黄 `#FFE36B`；夜里是深色卡纸 `#171614` + 暖白墨 + 珊瑚红。不用渐变、不用发光、不用毛玻璃，唯一的纹理是一层很淡的纸面颗粒。
- **排版**：标题用 Fraunces（拉丁）+ Noto Serif SC（中文，按页面用字子集化），正文 Geist + 系统黑体，代码 Geist Mono，全部自托管。版面左对齐、不对称：报头式的首页、错位缩进的大标题、左侧日期戳的文章头、粗细两种墨线分隔，不再是"居中大标题 + 一排数据卡片"。
- **实体感**：按钮有硬投影，按下去会"沉"到投影的位置；⌘K、Esc、阅读设置都是有侧边的键帽，按住键盘上的 ⌘/Ctrl + K 时导航里的键帽会一起按下去；主题开关是一个带螺丝的墙面翘板开关；标签是打了孔的吊牌。
- **阅读优先**：正文 700px 栏宽、1.9 倍行高；动效只出现在悬停、按压与页面切换里。开启「减少动态效果」后动画全部关闭。

### 组件与交互

| 组件 | 做法 |
|---|---|
| 报头导航 | 实心纸面 + 发丝线；当前页是一笔手写的红色下划线；阅读文章时导航底边是红色进度线；下滚收起、上滚出现 |
| 主题开关 | 墙面翘板开关（昼 / 夜），`role="switch"`；切换时新主题像一张纸从上往下盖下来 |
| 手机菜单 | 「目录」按钮打开整张纸，编号 + 大号衬线链接逐行滑入 |
| 首页 | 报纸报头：日期行（访客本地时间、文章数、总字数、起始日期）+ 错位大标题 + 手绘下划线；头条用相框 + 图注 + 首字下沉；往期是账本式的行，大号斜体序号 |
| 文章列表 | 悬停时荧光笔划过标题、序号变红并歪一下；鼠标旁边跟着一张贴了胶带的横线索引卡（摘要预览）|
| 标签筛选 | 文件夹标签页，选中的那张和下面的纸连在一起，红色指示条滑动；FLIP 重排，筛选状态写入 URL |
| 标签页 | 横线索引卡，红色页边线 + 打孔，每张歪的角度不同，悬停时摆正并浮起 |
| 搜索 | ⌘K / `/` 打开；实心纸面板、墨线边框、硬投影；输入框是内凹的；检索时是打字机式的「检索中……」；Pagefind 全文索引 |
| 文章页 | 左侧大号日期戳；`§ 1` 式小节编号；代码块顶部是文件夹标签 + 键帽式「复制」按钮；脚注是一张黄色便签；表格是账簿式的上下粗线；目录用红色手写箭头指示当前章节 |
| 阅读工具 | 右下角一列硬投影实体按键（进度环 / 目录 / 阅读设置），字号与字体是键帽单选 |
| 归档 | 写作日历用墨色方块（像盖章，略微歪斜）；时间线的节点是勾选框，滚动经过时打勾 |
| 关于 | 借书卡：统计数字像盖上去的蓝色 / 红色日期章 |
| 404 | 404 中间的 0 是一圈咖啡渍 |
| 页面切换 | 顶部红色加载条 + Astro 视图过渡（文章标题从列表飞到文章页）|

### 参考与致谢

- **[Uiverse.io](https://uiverse.io)**（组件以 MIT 协议开源，源码见 [uiverse-io/galaxy](https://github.com/uiverse-io/galaxy)）。以下组件的思路被借鉴，并按本站的配色与结构重新手写，没有直接复制代码：
  - 键帽按钮：`sahilxkhadka/pretty-snail-44`
  - 硬投影按钮的浮起与按下：`0xnihilism/quiet-dog-6`
  - 粗边框、偏移投影的输入框（搜索框）：`0xnihilism/wise-lizard-57`
  - 3D 翘板开关（主题开关）：`BernardoCuevas/old-grasshopper-54`，以及 `Praashoo7` 的几款墙面灯开关
  - 立体按键的按压层次：`njesenberger/thin-owl-11`
  - 勾选框打勾动画（归档时间线节点）：`catraco/hungry-squid-59`
- [rainzt.cn（朝朝听雨）](https://rainzt.cn/)：v1 借鉴了「站点即仪表盘」的信息结构（时钟问候、统计、时间线归档、文章目录与阅读进度），v2 保留了这些功能，换成了印刷品的呈现方式。

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
