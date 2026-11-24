# 01 // MIKU.SPACE · 初音未来主题静态个人主页

基于 **Vue 3 + TypeScript + Vite + Three.js + GSAP + Lenis** 构建的纯静态个人主页与作品集，支持亮暗双主题（清新通透风 / 夜间电子舞台风）、3D 初音旋转舞台、像素换装、滚轮驱动短转场以及 macOS 风格作品详情弹窗，可直接白嫖 **GitHub Pages** 免费托管。

---

## 本地开发命令

```bash
# 1. 安装依赖
npm install

# 2. 启动本地开发服务器
npm run dev

# 3. 类型检查并打包静态产物到 dist/
npm run build

# 4. 本地预览打包后的产物
npm run preview
```

---

## 日常修改与个性化指南

### 1. 修改个人资料、技能、歌单与社交链接
打开 [`src/data/siteConfig.ts`](src/data/siteConfig.ts)，文件内已有完整中文注释，直接修改即可：
- `profile`：昵称、大标题、一句话介绍、状态提示、Hero 按钮链接
- `outfits`：初音像素换装列表（默认 4 套：V2 公式服 / 雪未来 / 樱未来 / 赛博未来）
- `about`：第二栏三卡组内容（个人简介、技能栈分类徽章、39 号歌单与同好词条）
- `contact`：GitHub、Bilibili、一键复制邮箱等社交入口

### 2. 添加新的个人项目到作品墙
1. 准备一张 **16:10 比例** 的项目封面图（PNG / JPG / SVG / WebP），放入 `public/images/projects/`。
2. 打开 [`src/data/projects.ts`](src/data/projects.ts)，向 `projects` 数组追加一条对象（`id`、`slug`、`title`、`summary`、`category`、`cover`、`techStack`、`purpose`、`highlights`、`repoUrl` 等）。
3. 分类筛选（`全部` / `Web 应用` / `创意交互` / `工具`）与底部分页会自动更新，点击卡片即可弹出 macOS 详情弹窗。

### 3. 替换或扩充初音换装立绘
- 默认像素立绘位于 `public/images/outfits/`，由 `scripts/generate-assets.mjs` 生成。
- 如果你有自己绘制的透明底 PNG 立绘，直接放到 `public/images/outfits/` 并在 `src/data/siteConfig.ts` 的 `outfits` 数组中更新路径或新增第 5、6 套即可。

### 4. 接入真实初音 3D `.glb` 模型
查看 [`MODEL_GUIDE.md`](MODEL_GUIDE.md)，把 `.glb` 文件放入 `public/models/` 并修改 `public/models/manifest.json` 的 `modelFile` 字段，即可自动从内置 3D 占位体无缝切换为你的模型。

---

## 免费部署到 GitHub Pages

本项目已内置自动化工作流 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)，且 `vite.config.ts` 采用相对资源路径（`base: './'`），兼容个人主站仓库（`https://<用户名>.github.io/`）与普通子仓库路径：

1. 在 GitHub 新建一个公开仓库，命名为 **`<你的GitHub用户名>.github.io`**。
2. 将本项目代码推送到仓库的 `main` 分支：
   ```bash
   git init
   git add .
   git commit -m "init: hatsune miku static portfolio"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<你的用户名>.github.io.git
   git push -u origin main
   ```
3. 打开 GitHub 仓库页面的 **Settings → Pages → Build and deployment → Source**，将下拉框选为 **GitHub Actions**。
4. 等待 Actions 运行完成，即可通过 `https://<你的用户名>.github.io/` 免费访问！之后每次更新项目只需 `git push`，页面会自动重新构建上线。
