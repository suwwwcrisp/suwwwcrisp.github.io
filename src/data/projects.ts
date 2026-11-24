import { resolveAssetUrl } from './siteConfig';

// ============================================================================
// 项目作品墙配置文件（参考 xiaoshengyvlin.github.io 第五页）
// ----------------------------------------------------------------------------
// 以后新增项目只需 2 步：
//   1. 将 16:10 封面图放到 public/images/projects/ 目录（例如 my-app.png）
//   2. 在下方 projects 数组头部或末尾追加一条对象即可，分类筛选与分页会自动更新！
// ============================================================================

export type ProjectCategory = 'Web 应用' | '创意交互' | '工具';

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: ProjectCategory;
  status: string;
  year: string;
  cover: string;
  techStack: string[];
  purpose: string;
  highlights: string[];
  repoUrl: string;
  demoUrl?: string;
}

export const projectCategories: Array<'全部' | ProjectCategory> = [
  '全部',
  'Web 应用',
  '创意交互',
  '工具',
];

export const projects: ProjectItem[] = [
  {
    id: 'proj-01',
    slug: 'miku-3d-stage',
    title: 'Miku 3D Stage',
    summary: '基于 Three.js 的轻量级初音全景旋转舞台与 GLB 模型预览器。',
    category: '创意交互',
    status: '开源示例',
    year: '2026',
    cover: resolveAssetUrl('images/projects/proj-01.svg'),
    techStack: ['Three.js', 'Vue 3', 'TypeScript', 'GLTF/Draco'],
    purpose: '为个人主页或模型作者提供开箱即用的 Web 3D 展示台，不抢占页面滚轮，自动适配白天通透与夜间舞台光效。',
    highlights: [
      '支持自动居中归一化与 Draco 压缩模型加载',
      '缺省状态下内置程序化几何体 Q 版舞台占位体',
      '兼顾鼠标拖拽、方向键旋转与移动端竖滑防冲突',
    ],
    repoUrl: 'https://github.com/suwwwcrisp',
    demoUrl: '#hero',
  },
  {
    id: 'proj-02',
    slug: 'vocaloid-lyric-sync',
    title: 'Lyric Sync Studio',
    summary: '浏览器端多轨道 LRC / ASS 歌词时间轴编辑器与节拍对齐工具。',
    category: 'Web 应用',
    status: '持续迭代',
    year: '2026',
    cover: resolveAssetUrl('images/projects/proj-02.svg'),
    techStack: ['Vue 3', 'Web Audio API', 'Canvas 2D', 'IndexedDB'],
    purpose: '帮助翻唱、调教或 PV 创作者直接在浏览器里可视化波形并精准打点逐字歌词，无需安装大型桌面软件。',
    highlights: [
      '本地音频零上传解析，波形缩放流畅不卡顿',
      '支持 BPM 网格吸附与快捷键逐拍微调',
      '一键导出标准 LRC 与卡拉 OK 双语时间轴',
    ],
    repoUrl: 'https://github.com/suwwwcrisp',
  },
  {
    id: 'proj-03',
    slug: 'liquid-glass-ui',
    title: 'Liquid Glass UI Kit',
    summary: '受未来感玻璃材质启发的高透光磨砂组件与明暗双主题变量库。',
    category: 'Web 应用',
    status: 'v1.2',
    year: '2025',
    cover: resolveAssetUrl('images/projects/proj-03.svg'),
    techStack: ['CSS Variables', 'SVG Filter', 'Vue 3', 'Vite'],
    purpose: '整理一套能在亮色网格和深色霓虹背景下都保持高对比度、低视觉噪点的玻璃拟态设计规范。',
    highlights: [
      '内置双层高光描边与克制景深模糊层级',
      '自动降级兼容 prefers-reduced-motion 与低性能设备',
      '提供导航胶囊、macOS 弹窗与 Bento 卡片预设',
    ],
    repoUrl: 'https://github.com/suwwwcrisp',
  },
  {
    id: 'proj-04',
    slug: 'pixel-sprite-maker',
    title: 'Sprite Atlas Maker',
    summary: '面向二次元 Q 版像素立绘的快速调色板切换与换装导出工具。',
    category: '工具',
    status: 'v1.0',
    year: '2025',
    cover: resolveAssetUrl('images/projects/proj-04.svg'),
    techStack: ['Node.js', 'Canvas API', 'TypeScript'],
    purpose: '把同一套基础骨架通过映射不同色板和装饰图层，批量生成透明底 PNG 像素立绘，用于网页换装卡片。',
    highlights: [
      '像素网格对齐校验，换装切换时人物坐标零抖动',
      '支持邻近像素放大导出，保持锐利边缘',
      '可导出 JSON 清单供前端零配置读取',
    ],
    repoUrl: 'https://github.com/suwwwcrisp',
  },
  {
    id: 'proj-05',
    slug: 'miku-39hz-visualizer',
    title: '39 Hz Audio Visualizer',
    summary: '环形 FFT 音频频谱可视化实验，跟随电子节拍律动的青粉光环。',
    category: '创意交互',
    status: '实验原型',
    year: '2025',
    cover: resolveAssetUrl('images/projects/proj-05.svg'),
    techStack: ['Web Audio API', 'Canvas 2D', 'GSAP'],
    purpose: '探索声波频谱与轻量几何粒子的映射关系，为个人网站和音乐播放卡片提供低功耗的动态视觉反馈。',
    highlights: [
      '基于 AnalyserNode 实时分离低频鼓点与高频人声',
      '支持麦克风输入或本地 MP3/FLAC 拖拽播放',
      '无活跃音频时自动休眠渲染循环，几乎不占 CPU',
    ],
    repoUrl: 'https://github.com/suwwwcrisp',
  },
  {
    id: 'proj-06',
    slug: 'gh-pages-starter',
    title: 'Pages Deploy Kit',
    summary: '零后端静态个人站自动化构建脚手架，适配 GitHub Pages 根路径与子路径。',
    category: '工具',
    status: '模板仓库',
    year: '2026',
    cover: resolveAssetUrl('images/projects/proj-06.svg'),
    techStack: ['GitHub Actions', 'Vite', 'TypeScript'],
    purpose: '解决静态博客和作品集在 GitHub Pages 部署时常见的静态资源 404、字体加载缓慢和构建缓存问题。',
    highlights: [
      '内置 Actions 自动构建工作流，推送即上线',
      '统一 BASE_URL 静态资产解析封装，杜绝相对路径错误',
      '支持一键扩展自定义域名 CNAME 与暗色模式切换',
    ],
    repoUrl: 'https://github.com/suwwwcrisp',
  },
];
