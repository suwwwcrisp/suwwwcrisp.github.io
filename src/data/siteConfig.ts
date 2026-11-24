// ============================================================================
// 站点集中配置文件（后续上线只需按注释修改此文件即可定制全站内容）
// ============================================================================

/**
 * 静态资源路径拼接工具：自动适配 GitHub Pages 根域名或子路径部署，避免 404
 */
export function resolveAssetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL || './';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = relativePath.replace(/^\/+/, '');
  return `${normalizedBase}${cleanPath}`;
}

export interface HeroAction {
  label: string;
  href: string;
  icon: 'play' | 'github' | 'about' | 'contact' | 'model';
  external?: boolean;
  scrollTo?: string;
  actionType?: 'model-guide';
}

export interface OutfitItem {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  accent: string;
}

export interface SkillGroup {
  title: string;
  icon: string;
  items: string[];
}

export interface FavoriteSong {
  title: string;
  producer: string;
  bpm: string;
  note: string;
}

export interface SocialLink {
  id: string;
  label: string;
  handle: string;
  href?: string;
  copyText?: string;
  badge: string;
}

export const siteConfig = {
  // 1. 第一栏个人介绍（参考 arcueidblog.top 极简布局）
  profile: {
    brandMark: '01 // MIKU.SPACE',
    siteTitle: '01 // MIKU.SPACE · 初音未来主题个人主页',
    nickname: 'MikuFan · 39 号观测站',
    greeting: "Hi, I'm",
    headlineName: 'MikuFan.',
    bio: '一个以初音未来为灵感核心的数字小站，折腾创意前端与 3D 互动实验。',
    dragHint: '↔ 拖动角色旋转 · 支持直接放入 .pmx / .glb / .vrm 模型',
    heroActions: [
      {
        label: '浏览作品',
        href: '#projects',
        icon: 'play',
        scrollTo: 'projects',
      },
      {
        label: 'GitHub',
        href: 'https://github.com/suwwwcrisp',
        icon: 'github',
        external: true,
      },
      {
        label: '关于我',
        href: '#about',
        icon: 'about',
        scrollTo: 'about',
      },
      {
        label: '联系我',
        href: '#contact',
        icon: 'contact',
        scrollTo: 'contact',
      },
    ] as HeroAction[],
  },

  // 2. 初音 3D 模型配置（将下载的 .glb 或 .vrm 放到 public/models/ 并在 manifest.json 填入文件名）
  modelConfig: {
    manifestPath: resolveAssetUrl('models/manifest.json'),
    modelsBaseDir: resolveAssetUrl('models/'),
    dracoDecoderPath: 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/',
    autoRotateSpeed: 0.4,
  },

  // 3. 初音 RPG 像素换装列表（可在 public/images/outfits/ 替换或新增）
  outfits: [
    {
      id: 'v2',
      name: 'V2 公式服',
      subtitle: 'Classic 01',
      image: resolveAssetUrl('images/outfits/miku-v2.png'),
      accent: '#39C5BB',
    },
    {
      id: 'snow',
      name: '雪未来',
      subtitle: 'Snow Miku',
      image: resolveAssetUrl('images/outfits/miku-snow.png'),
      accent: '#5BBFEF',
    },
    {
      id: 'sakura',
      name: '樱未来',
      subtitle: 'Sakura Miku',
      image: resolveAssetUrl('images/outfits/miku-sakura.png'),
      accent: '#FF75A0',
    },
    {
      id: 'cyber',
      name: '赛博未来',
      subtitle: 'Cyber Neon',
      image: resolveAssetUrl('images/outfits/miku-cyber.png'),
      accent: '#00D8F6',
    },
  ] as OutfitItem[],

  // 4. 首屏下方 Bento 档案卡 & 关于我
  about: {
    introCard: {
      title: '关于我 · 创作节点',
      paragraphs: [
        '喜欢把二次元视觉表达和现代 Web 技术揉在一起：写干净的 TypeScript，做通透轻盈的液态玻璃界面，也折腾 Three.js 实时渲染与声光互动。',
        '网站托管在 GitHub Pages 上，所有项目与资料由单份配置驱动——以后每做完一个小玩具，推一次代码就能亮出来。',
      ],
      tags: ['创意前端', 'Three.js / VRM', '像素与二次元', 'GitHub Pages'],
    },
    skillGroups: [
      {
        title: '界面与前端工程',
        icon: '◈',
        items: ['Vue 3', 'TypeScript', 'Vite', 'Liquid Glass', 'CSS Motion'],
      },
      {
        title: '图形与交互动效',
        icon: '✦',
        items: ['Three.js', 'three-vrm', 'GSAP', 'Lenis', 'Web Audio'],
      },
      {
        title: '工具与部署',
        icon: '⌘',
        items: ['GitHub Actions', 'Node.js', 'Blender → GLB', 'Figma'],
      },
    ] as SkillGroup[],
    acgCard: {
      title: '39 号歌单 & 同好词条',
      badges: ['初音未来 01', 'Project DIVA', 'MAGICAL MIRAI', '像素画', '葱绿配色控'],
      songs: [
        {
          title: 'メルト (Melt)',
          producer: 'ryo (supercell)',
          bpm: '170 BPM',
          note: '入坑原点，永远的清晨阳光感。',
        },
        {
          title: 'Tell Your World',
          producer: 'livetune',
          bpm: '150 BPM',
          note: '把代码与旋律连接向世界的歌。',
        },
        {
          title: '砂の惑星',
          producer: 'ハチ (米津玄師)',
          bpm: '98 BPM',
          note: '十年一响，电子节拍依然锋利。',
        },
      ] as FavoriteSong[],
    },
  },

  // 5. 联系方式与页脚
  contact: {
    title: '保持信号连接',
    subtitle: '如果你也喜欢初音未来、WebGL 创意交互，或者想聊聊某个项目，欢迎通过下面任意入口找到我。',
    socials: [
      {
        id: 'github',
        label: 'GitHub',
        handle: '@suwwwcrisp',
        href: 'https://github.com/suwwwcrisp',
        badge: 'CODE',
      },
      {
        id: 'bilibili',
        label: 'Bilibili',
        handle: 'Nasaki_Akira',
        href: 'https://space.bilibili.com/158956668',
        badge: 'ACG',
      },
      {
        id: 'email',
        label: 'Email（点击复制）',
        handle: 'suwwwcrisp@gmail.com',
        copyText: 'suwwwcrisp@gmail.com',
        badge: 'MAIL',
      },
    ] as SocialLink[],
    footerNote: 'Hosted free on GitHub Pages · Built with Vue 3, Three.js & GSAP · 39!',
  },
};
