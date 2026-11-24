# 初音未来 3D 模型接入指南（支持 `.pmx` / `.glb` / `.vrm`）

首页右侧的开放式悬浮舞台已原生支持 **`.pmx` / `.pmd`（MMD）、`.glb` / `.gltf`（含 Draco 压缩）以及 `.vrm`** 三类格式，找到喜欢的模型后无需转换格式即可直接接入。

---

## 方法一：直接接入你找到的 MMD `.pmx` 模型（推荐）

> **关键注意事项**：`.pmx` 模型自身只保存网格骨架数据，衣服和脸部贴图保存在同目录的图片文件或 `tex/` 子目录里。**一定要把整个模型文件夹（连同贴图）一起复制过来**，否则模型会变成纯白素模。

1. 将解压后的整个初音 `.pmx` 模型文件夹放到项目的 `public/models/` 下，例如：
   ```text
   public/models/miku_model/
     ├── 初音ミク.pmx
     └── tex/ (或各种 .png / .tga / .bmp 贴图)
   ```
2. 打开 [`public/models/manifest.json`](public/models/manifest.json)，把 `modelFile` 改为该文件相对 `public/models/` 的路径（支持日文/中文文件名）：
   ```json
   {
     "modelFile": "miku_model/初音ミク.pmx"
   }
   ```
3. 刷新页面或运行 `npm run build` 即可直接预览！

> 若上线 GitHub Pages 后发现模型体积太大（例如贴图和 `.pmx` 合计超过 30MB）影响访问速度，也可以用 Blender（`blender_mmd_tools`）再将其导出压缩为单文件 `.glb`。

---

## 方法二：接入 `.glb` 或 `.vrm` 模型

- **Sketchfab**（下载 `.glb`）：https://sketchfab.com/ （搜索 `Hatsune Miku` 并勾选 Downloadable）
- **VRoid Hub / BOOTH**（下载 `.vrm`）：https://hub.vroid.com/ / https://booth.pm/

将 `.glb` 或 `.vrm` 直接放进 `public/models/`，并在 [`public/models/manifest.json`](public/models/manifest.json) 填入 `"modelFile": "你的文件名.glb"`（或 `.vrm`）即可自动居中归一化展示。
