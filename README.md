# 浮世 · 潮汐 / UKIYO TIDES

以葛饰北斋《神奈川冲浪里》为灵感的身体交互艺术网页。课程：交互设计及可行性。

## 设计说明

作品以“让身体成为海的呼吸”为概念，把原画从静态观看转化为可参与的视听体验。海面随动作起伏，天空区域变化较弱，保留原画的辨识度与空间层次。

- 挥手：手腕位置影响局部水纹，运动速度增强波动并产生浪花。
- 张臂：以双腕间距除以肩宽，计算身体尺度无关的张臂程度，控制潮势与海声音色。
- 举手：双手高于鼻部时，出现暖金色浪花并触发五声音阶音符。
- 无摄像头：鼠标/触屏移动造浪，点击激起涟漪，按住增强潮势。
- 可切换合成海声、全屏体验、保存 PNG、重置画面。
- 空格暂停，M 切换声音，S 保存，R 重置。键盘焦点在按钮/链接上时保留原生操作。

## 本地运行

不要直接双击 HTML 使用摄像头。进入目录后运行：

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

浏览器访问 http://127.0.0.1:8765 。Mac 也可双击 `启动作品.command`。

所有图片、人体模型、MediaPipe JS/WASM 均包含在项目中；首次下载项目后运行无需 CDN。无需 npm 安装或构建。摄像头需要 localhost 或 HTTPS。身体模式建议用 Chrome / Edge，光线充足，退后让头、肩和双手进入镜头。

## GitHub 与 Cloudflare Pages

仓库名建议 `ukiyo-tides`。上传此文件夹全部内容（无需上传本文件夹外的课堂资料或开发临时文件）。

Cloudflare Pages 选择该 GitHub 仓库：

- 框架预设：None
- 生产分支：main
- 构建命令：留空
- 输出目录：`.`（仓库根目录）
- 根目录：默认

如果界面要求必须填写构建命令，使用 `exit 0`。也可选择 Direct Upload，上传发布包内的 `index.html`、`style.css`、`app.js`、`assets/`、`vendor/` 和 `_headers`。

## 实现与可行性

原生 HTML/CSS/JavaScript，WebGL 片元着色器负责海面位移，Canvas 2D 绘制粒子与涟漪，MediaPipe Pose Landmarker 识别人形，Web Audio 合成声音。最多识别 1 人，检测频率约 15 Hz，像素比上限 2，粒子数上限 450；设备不支持 WebGL 时保留原画、粒子和基本交互。

模型输出 33 个关键点，交互使用鼻部、双肩、双腕。坐标镜像与动作平滑减少抖动，肩宽归一化减少人与镜头距离变化的影响。动态效果是艺术化水纹位移，不是物理流体模拟。身体模式需要现场允许摄像头并由真人验证。

## 隐私

不使用后端、账号系统、统计脚本或上传接口。相机画面仅在当前设备推理；不请求麦克风，不上传视频或姿态数据。关闭身体模式、切换后台或离开页面会停止相机轨道。

## 素材与许可

- 原作：葛饰北斋，《神奈川冲浪里》，《富岳三十六景》系列，约 1830–1833。原作资料：https://www.artic.edu/artworks/24645
- 本项目图像：Wikimedia Commons 的芝加哥艺术博物馆图像，CC0。https://commons.wikimedia.org/wiki/File:The_Great_Wave_off_Kanagawa.png
- 保存原始 PNG；运行时仅裁去透明与纸边区域作为纹理，不更改素材原文件。
- 姿态模型：Google MediaPipe Pose Landmarker Lite，来自课堂提供的 starter。https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
- MediaPipe Tasks Vision 0.10.21，Apache-2.0；许可见 `vendor/LICENSE`。依赖文件下载自 npmmirror 的对应版本镜像。
- AI 协作：本项目由 Codex 辅助设计和实现。提交者应理解交互规则，并按课程要求如实说明工具使用。

## 演示建议（约一分钟）

先移动鼠标与点击证明网页可互动，开启海声；再开启身体模式，依次挥手、张臂、双手举过头顶；点击保存；最后展示 GitHub 源码与 Cloudflare 在线地址。
