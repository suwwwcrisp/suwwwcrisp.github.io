# 初音未来静态网站设计蓝图（跨上下文持久化）

本文件用于持久化记录已验收成果与后续开发待办，即便执行 `/compact` 压缩会话上下文，也能在恢复后无缝衔接继续开发。

---

## 第一阶段（已完成并经用户验收通过 — 严禁回退或随意修改）

1. **项目路径与独立依赖隔离**
   - 工程根目录：`d:\deepseek harness\gemini antigravity`
   - 所有依赖（`vue`, `three`, `@pixiv/three-vrm`, `gsap`, `lenis`, `pngjs` 等）均安装于项目本地 `node_modules/`，[.npmrc](.npmrc) 将缓存锁定在 `./.npm-cache`。
   - GitHub Pages 自动化部署工作流位于 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)。

2. **首屏、外围 3D 公转实体与音律流光大背景（[HeroSection.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/HeroSection.vue) + [HeroMikuOrbitToys.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/HeroMikuOrbitToys.vue) + [createMiku3DToys.ts](file:///d:/deepseek%20harness/gemini%20antigravity/src/utils/createMiku3DToys.ts) + [App.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/App.vue)）**
   - **顶部导航栏**（[MikuNav.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/MikuNav.vue)）：顶部居中紧凑毛玻璃图标胶囊栏（`420×54px`），左侧斜体衬线 `M.` 标志，极细分割线分隔单色线条导航与工具图标（带悬停提示气泡），右侧挂载提取自用户 D 盘素材的可爱元气笑脸正脸圆形头像（[miku-nav-avatar.jpg](file:///d:/deepseek%20harness/gemini%20antigravity/public/images/portal/miku-nav-avatar.jpg)）。
   - **主卡、初音数字音律流光大背景与建筑网格**（[theme.css](file:///d:/deepseek%20harness/gemini%20antigravity/src/styles/theme.css)）：`72px × 72px` 建筑方格搭配青绿/天蓝/樱粉三色呼吸极光、两条轻透斜向缓慢滚动的初音数字歌姬字带、边缘悬浮半透明音符/四芒星及 `+ 01 // 39`、`+ 39.0 Hz` 坐标十字刻度；卡片桌面端固定高度 `clamp(530px, 70vh, 615px)` 与圆角 `32px`，并与 [CinematicStoryStage.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/CinematicStoryStage.vue) 电视窗口 `0.536` 缩放及内凹边框严格严丝合缝；`body { overflow-x: clip; }` 确保 `position: sticky` 正常工作；Hero 左栏采用垂直居中对齐与 `2×2` 按钮矩阵（`浏览作品`、`GitHub`、`关于我`、`联系我`），隐藏中心拖动提示胶囊并将 `3D 模型指南` 弹窗移作模型加载异常回退弹窗。
   - **外框环绕 3D 高光实体、轻点旋跳与投喂初音欢呼**：基于 Three.js `MeshPhysicalMaterial` 清漆高光与 `RoomEnvironment` 棚拍环境反射雕刻`初音大葱`、`黑粉方形发饰`、`初音头戴式耳机`、`青绿立体八分音符`、`粉青双色棱镜胶囊` 5 枚纯无字单体 3D 实物（零文字标注、零底框），沿主卡外框圆角安全轨道公转并 3D 自旋转；拖拽松手后采用无过冲平滑阻尼归位（`k = 13.5`、`damp = 8.15`），支持「轻点原地旋跳 + 10 音符粒子爆发」以及「拖拽投喂至右侧 3D 初音舞台触发 `stage-cheer-ring` 欢呼光环 + 18 音符礼花」，滚屏进入 CRT 电视时外围公转物平稳淡出。
   - **深色模式作用域规范**：所有组件 `<style scoped>` 内统一使用 `[data-theme='dark'] .className`，严禁使用 `:global([data-theme='dark'])`（防止 Vite/LightningCSS 编译剥离后缀导致全局样式污染）。

3. **真实 3D 模型舞台（[MikuModelStage.vue](src/components/MikuModelStage.vue)，已验收）**
   - 模型资源：「彩虹砂糖 13th」初音 `.pmx`（`public/models/miku-13th/miku.pmx`）。
   - **正面双手胸前比心姿势**：通过 FK 骨骼解算实现掌心与指尖共面贴合、搭配 `左手捩`/`右手捩` 前臂旋前与 `CCDIKSolver` 肘部单轴防折断控制。
   - **交互与物理**：鼠标悬停舞台时不中断自旋转（仅在拖拽旋转时暂停），以躯干为中心纯水平 360° 旋转；相机默认定位 `DEFAULT_CAM_POS = (0, 1.13, 3.88)`、`DEFAULT_TARGET = (0, 1.09, 0)`，完整露出头纱与薄荷蝴蝶结双鞋；飘带、双马尾、鬓发与双层蛋糕裙具备静止重力垂落与随转速离心飘浮物理效果。

4. **像素换装与动态光标（已验收，勿重新生成）**
   - **4 套等高、不同动作的 RPG 像素换装**（[MikuDressUpCard.vue](src/components/MikuDressUpCard.vue)）：
     - `public/images/outfits/miku-v2.png`（经典站姿）
     - `public/images/outfits/miku-snow.png`（胸前合十许愿）
     - `public/images/outfits/miku-sakura.png`（比耶叉腰）
     - `public/images/outfits/miku-cyber.png`（手持麦克风演唱）
   - **5 套 12 帧透明动态初音鼠标指针**（[MikuCursor.vue](src/components/MikuCursor.vue)）：存放于 `public/cursors/miku/`。

5. **预留第三阶段舞台壁纸**
   - `public/images/bg/miku-stage-bg.png`。

---

## 第二阶段（已升级整合为连续舞台并完成二轮 /grill-me 迭代与双尺寸实测 — 等待用户强刷预览确认）

核心原则：**零留白统一空间舞台衔接**（由连续舞台组件 [CinematicStoryStage.vue](src/components/CinematicStoryStage.vue) 承载八幕无断层推演，彻底替代独立空页过渡）。

### 1. 连续八幕电影感剧本与四项 `/grill-me` 迭代升级（`970vh` 总滚动长，`870vh` 有效推演程）

- **精准锚点与互动平台**（时间线以 `tl.to({}, { duration: 0.001 }, 0.999)` 锚定 `1.0` 时长，保证 `ScrollTrigger.progress` 1:1 对齐）：
  - `#hero`：`top: 0`（`p = 0.000`）；`#about`：`top: 380vh`（`p = 0.437`）；`#projects`：`top: 830vh`（`p = 0.954`）。
- **1 → 2 衔接：演播室桌面氛围 + 复古初音小电视 + 穿屏锁频（`0.00 → 0.39`）**
  - **演播室桌面氛围**：消除电视机外围大面积空白，在下方 `13%` 落脚线构建磨砂演播台面（`.tv-studio-shelf`），背景铺设大号 `MIKU-TV // 39` 水印、缓转半调音环（`halftone-ring.png`）、斜向葱绿五线谱波浪（`staff-wave-teal.png`）、飘散音符群（`notes-swarm-teal.png`），以及 `> 960px` 桌面端两侧对称的青-洋红律动电平柱（`.tv-studio-eq`）。
  - **复古初音 CRT 外壳与穿屏解锁**：带中央金属 `01` 铭牌的双天线、加厚内凹显像管边框、正面双色饰条、8 槽扬声器、电源键与双机械旋钮及右下角 Q 版贴纸；触发纯无字半透明流光故障带、RGB 错位扫线与随滚动实时色相漂移的干扰屏（移除屏内及全屏所有文字框，保留居中摇晃的双 Q 版初音），全屏扫描线噪点（`.tv-room-noise`）下 [AboutSection.vue](src/components/AboutSection.vue) 的 6 大板块（`data-tv-block="1..6"`）按顺序伴随青/洋红 RGB 错位闪烁逐块锁频至 `1.0x`。
- **第二栏"上主下副"结构重构与薄荷互动初音播放器**
  - **上排三主卡（`.about-grid`）**：展示 `01 // BIO`、`02 // SKILLS`、`03 // ACG & 39`；删除重复歌单，改为 3 行电台参数栏（`观测频段: 39.0 Hz`、`主题色值: #39C5BB`、`舞台载体: MMD / VRM 3D`）。
  - **下排双挂件（`.about-widgets-row`，`0.36fr : 0.64fr`）**：左侧紧凑版 [MikuDressUpCard.vue](src/components/MikuDressUpCard.vue)（`110×110` 像素立绘、`min-height: 186px`）与右侧新增 [MikuMusicPlayerCard.vue](src/components/MikuMusicPlayerCard.vue) 并列；播放器搭配薄荷竖纹卡面与纯净裁切封面（`miku-player-cover.jpg`），支持 `01`/`02`/`03` 切歌胶囊、绯红红心切换及 `'miku-note-burst'` 事件、可点击 `0:39 / 1:39` 进度条、上一首/播放/下一首控制与 Web Audio 三角波清脆提示音。
- **2 → 3 衔接：真实页面 6 顶点真折纸变形 + `1 : 1.38` 修长许愿漂流瓶（`0.48 → 0.93`）**
  - **真实页面 `clip-path` 真折纸（`0.48 → 0.59`）**：废弃不透明假折纸替身层（`fold-paper-stage`），直接对承载真实第二页 DOM 的 `aboutSlotRef` 执行 6 顶点 `clipPath` 形变（`polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 0% 100%, 0% 0%)` 收拢为 `polygon(50% 4%, 96% 48%, 62% 94%, 50% 70%, 38% 94%, 4% 48%)`），配合虚线折痕引导（`foldGuideRef`），背景铺设 `02 → 39 // ORIGAMI WIND` 罗盘与流动五线谱/音符气流轨迹。
  - **修长 `1 : 1.38` 许愿瓶、入水溶泡、冲盖泡沫帷幕转场（`0.59 → 0.942`）**：将 `.bottle-belly` 重塑为修长微倾瓶肩比例（`clamp(232px, 24vw, 326px)` × `clamp(348px, 49vh, 452px)`）；纸飞机入水瞬间激起柔和渐变液态水花冠与飞溅小水滴（水面向下轻陷回弹）并随即溶泡消散，随后瓶身剧烈摇晃、内部 `14` 颗晶莹碳酸气泡上涌蓄压并于顶部凝聚泡沫层，紧接将软木塞高高冲飞、瓶口喷出白色泡沫喷泉并引爆 3 层波浪海沫与 `30` 颗三景深玻璃泡泡帷幕铺满屏幕，气泡上浮散开后自然切入 [ProjectsSection.vue](src/components/ProjectsSection.vue)。
- **3 → 4 衔接 & 动态断点**：作品墙末尾自然衔接 [FooterSection.vue](src/components/FooterSection.vue)（`#contact`）；通过 `gsap.matchMedia()` 动态监听 `(min-width: 521px) and (prefers-reduced-motion: no-preference)`，兼容 `521px+` 分屏预览与 `<= 520px` 移动端降级。

### 2. 第二阶段素材、集成与浏览器验收记录

- **10 份门户视觉素材**：经 [prepare-portal-assets.mjs](scripts/prepare-portal-assets.mjs) 提取并生成于 `public/images/portal/`（`chibi-shock.png`、`chibi-fish.png`、`chibi-leek.png`、`staff-notes.png`、`halftone-ring.png`、`staff-wave-teal.png`、`notes-swarm-teal.png`、`water-miku-light.jpg`、`water-miku-dark.jpg`、`miku-player-cover.jpg`）。
- **主路由与锚点校准**：已接入 [App.vue](src/App.vue)，[useSmoothScroll.ts](src/composables/useSmoothScroll.ts) 保持 `'hero'`、`'about'`、`'projects'` 偏移 `0`、`'contact'` 偏移 `-76`。
- **构建与双尺寸浏览器实测（`http://localhost:4173/`）**：
  - `npm run build`（`vue-tsc --noEmit && vite build`）2.39s 通过（75 个模块），CSS 扫描零 `[data-theme=dark]{background` 泄漏。
  - `1440×900`（`travel = 7830px`）与 `720×820`（`travel = 7134px`）全流程实测通过：全程 0 控制台报错/警告、0 失败或 404 请求（10 份资源全部 HTTP 200）、0 横向溢出（`1424.67px <= 1440px`、`704.67px <= 720px`）、各主区块 ID 唯一；薄荷音乐播放器播放计秒（`0:39 → 0:41`）、切歌（`♪ Tell Your World`）与像素衣橱换装（`1 / 4 → 2 / 4`）交互验证通过，预览服务已就绪待用户强制刷新验收。

---

## 第三阶段（已完成二次元 Q 版海洋贴纸统一重绘、移除鼠标偏移与 3D 倾斜并修复卡片点击判定 — 等待用户强刷预览确认）

- **统一粗深棕描边扁平二次元海洋贴纸与 Q 版初音彩蛋（[prepare-marine-assets.mjs](file:///d:/deepseek%20harness/gemini%20antigravity/scripts/prepare-marine-assets.mjs) → `public/images/marine/`）**：
  - 按 `octopus.png`（日系 V 家粗棕线平涂呆萌初音小章鱼）与 `chibi-fish.png` / `chibi-fish-bite.png` 统一为粗深棕描边扁平赛璐璐画风：重绘并抠图导出透明底 `shell.png`（粉白扇贝与薄荷高光白珍珠）、`conch.png`（青绿粉双色螺旋海螺）、`starfish.png`（圆润黄桃色五点奶油星点海星），并手绘高精度同画风矢量 `jellyfish.svg`（青绿穹顶配樱粉花边触手，替换旧版写实水彩贴纸）。
- **6 张项目封面图例原生动效升级（`public/images/projects/proj-01.svg`–`proj-06.svg`）**：
  - 为全部分类封面注入原生 CSS `@keyframes`（兼容 `prefers-reduced-motion`）：`proj-01` 旋转光环+浮空菱晶+跳动电平、`proj-02` 流动正弦波与往返扫描播放指针、`proj-03` 游动光斑+双层浮空玻璃框+脉冲按钮、`proj-04` 跳跃像素初音+错落闪动色板、`proj-05` 双向逆转波环+跳动音核+放射刻度脉冲、`proj-06` 终端闪动光标与脉冲上线状态指示。
- **高帧率水下玻璃气泡与星砂画布（[UnderwaterBubbleCanvas.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/UnderwaterBubbleCanvas.vue)）**：
  - 自适应 DPR 高清 `<canvas>` 绘制 3 层景深透明折射玻璃气泡（高光月牙反射+下方反光弧+景深散景泡泡）与星砂光尘微粒（作品墙 `46` 气泡+`26` 光尘，页脚 `18` 气泡+`12` 光尘），关闭鼠标尾流跟随以保持画面专注平静，明暗双主题自动切换透亮日光蓝与生物荧光青紫配色。
- **纯自主不规律水下浮力、零鼠标偏移倾斜与点击修复（[CinematicStoryStage.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/CinematicStoryStage.vue) + [ProjectsSection.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/ProjectsSection.vue) + [FooterSection.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/FooterSection.vue)）**：
  - **移除鼠标偏移与 3D 倾斜**：彻底移除 `.project-wall` 与 `.footer-card` 的 `preserve-3d` 透视旋转（`rotateX`/`rotateY`）以及 `--mx`/`--my`、`curMx`/`curMy` 鼠标跟随位移；同步清理 `CinematicStoryStage.vue` 在 `.story-slot--projects` 上的 `rotateX` 并将交互激活阈值放宽至 `p >= 0.88`，彻底解决 3D 负 Z 深度导致的卡片/控件点击失效问题。
  - **作品墙与页脚纯自主浮力**：作品卡保留强张力三重谐波水下飘动（垂直 `±14.5–17.5px`、水平 `±8.0–10.5px`、倾角 `±2.05–2.55deg`、呼吸微缩放 `±0.013`），悬停单卡以及悬停分类标签/分页按钮均平滑收束至 `~28%` 轻稳微浮以便精确点击；同步微调页脚背景 `jellyfish.svg` 与中窄宽度下作品墙外围/卡片贴纸位置，确保明暗双主题及分屏下零文字与按钮遮挡。
- **构建与全流程实机互动验收记录（`http://localhost:4173/`）**：
  - `npm run build`（`vue-tsc --noEmit && vite build`）3.33s 通过（78 个模块，样式产物 `index-BYCKj9hu.css`），CSS 扫描零 `[data-theme=dark]{background` 泄漏。
  - `1440×900` 明暗双主题与 `720×820` 窄分屏真点击全流程通过：`.project-wall` 与 `.footer-card` 在鼠标移动时保持零位移/零倾斜，真实点击作品卡可稳定弹出并关闭 `ProjectModal`（1440px 与 720px 下均通过），分类筛选、分页翻页（`1 / 2 <-> 2 / 2`）、页脚 `39! 应援电波`（`× 67 -> × 68`）与邮箱复制反馈（`已复制到剪贴板 ✓`）全部生效；0 控制台报错/警告、0 失败请求、0 横向溢出（`704.67px <= 720px`），全部贴纸零文本及控件遮挡。

### 近期 `/grill-me` 终轮精修记录

1. **第一页清理、2×2 布局重排与 3D 物件点击/投喂互动（[HeroSection.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/HeroSection.vue) + [HeroMikuOrbitToys.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/HeroMikuOrbitToys.vue) + [siteConfig.ts](file:///d:/deepseek%20harness/gemini%20antigravity/src/data/siteConfig.ts)）**：
   - 移除卡片中央拖动提示胶囊（`.hero-drag-hint`）与左下角水涡（`.hero-vortex-zone` / `.miku-water-vortex`）；第 4 个动作按钮改为 `联系我`（信封图标，平滑滚动至 `#contact`），与 `浏览作品`、`GitHub`、`关于我` 构成垂直居中的 `2×2` 对称按钮网格，原 `3D 模型指南` 弹窗仅保留为模型加载异常回退弹窗。
   - 保留外围 5 枚纯无字高光 3D 实物公转自转与平滑零过冲阻尼归位（`k = 13.5`、`damp = 8.15`）；新增轻点原地旋跳（`10` 连音符爆发）及拖入 3D 初音舞台松手触发 `stage-cheer-ring` 霓虹欢呼光环 + `18` 连音符礼花，随后平滑回归轨道。
2. **Hero 严丝合缝嵌入 CRT 显像管与 8 格渐进绿色信号指示器（[CinematicStoryStage.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/CinematicStoryStage.vue)）**：
   - 桌面端锁定主卡高度 `clamp(530px, 70vh, 615px)` 与 `32px` 圆角，滚屏极早期（`0.005 -> 0.045`）即淡出 `.hero-scroll-cue`，`heroSlotRef` 以 `scale: 0.536`、`y: -26` 严丝合缝收入 `.crt-window` 与内凹玻璃边框（`.crt-screen-glare`），消除边缘外溢。
   - 保持电视底栏 8 槽 `.crt-vents`（`3×16px`）原始外观，随 CRT 幕进度（`p = 0.02 -> 0.275`）驱动 `.crt-vent__fill`（`#10b981 -> #2dd4bf -> #6ee7b7`）与 `.crt-vent.is-lit` 从左至右逐格填满翠绿信号柱。
3. **日系赛璐璐海浪泡沫蕾丝、喷涌水花与高密度星泡帷幕（[CinematicStoryStage.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/CinematicStoryStage.vue)）**：
   - 废弃许愿瓶水位、瓶口及全屏浪花帷幕上的粗糙大圆球；瓶内水位升级为有机双层赛璐璐蕾丝浪花带（`.bottle-foam-svg` 配 `.lace-shadow` / `.lace-front`、底缘渐隐遮罩与 `18` 颗微泡泡）及 `18` 颗瓶内升腾气泡，瓶口软木塞冲开升级为三股拱形喷涌水柱（`.plume-svg` 配 `.plume-stream`、`24` 颗泡泡与 `4` 颗星芒）。
   - 全屏浪花帷幕（`viewBox="0 0 1440 820"`）重构为水下斜向光束（`.foam-caustic`）、不规则白沫浪冠（`.foam-crest-shadow` / `.foam-crest-white` / `.foam-crest-white--crisp`）、飞溅离散水滴（`.foam-crest-drop`）、三景深高密度分簇 `96` 颗动漫气泡（`far` `34` / `mid` `38` / `near` `24`）及 `10` 枚闪烁星芒（`SPARKLE_STARS`），明暗双主题通透流畅地切换至作品墙。
4. **纸飞机单源双剪裁无穿模入瓶与作品墙底缘贴纸安全区（[CinematicStoryStage.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/CinematicStoryStage.vue) + [ProjectsSection.vue](file:///d:/deepseek%20harness/gemini%20antigravity/src/components/ProjectsSection.vue)）**：
   - 入瓶前软木塞右上方侧停避让（`x: 88, y: -62, rotation: 26`），依托瓶口静止居中基准偏移（`mouthX` / `mouthY`）在空中完成流畅 S 形俯冲交接；以同源水平切面（`39px`）对齐前景入口门户（`.bottle-air-portal` + `airEntryPlaneRef`）与瓶颈通道（`.bottle-neck-chute` + `neckPlaneRef`），实现机身丝滑穿过玻璃瓶口并沉入瓶心居中溶解后，软木塞再飞回弹性封口。
   - 抬升作品墙底部海螺（`.marine-ornament--bl`）与小章鱼（`.marine-ornament--br` / 中宽视口 `.marine-ornament--tr` `bottom: 2.9rem`）至安全区并收紧向下漂浮振幅，同步对 `.underwater-backdrop` 环境水色/画布/音符层施加底缘柔化遮罩，消除页面分界硬线并避免任意视口下的贴纸半截裁切。

---

## 第四阶段计划（待第三阶段用户验收后开始）

- 清理未使用资源，完整走查 `vue-tsc --noEmit && vite build`，核对相对路径打包在 GitHub Pages 下零 404，完成全流程浏览器终检验收。
