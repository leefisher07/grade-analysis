# 应用图标创建指南

## 快速方案（推荐）

我已经为你打开了一个图标生成器页面，它会自动下载一个 1024x1024 的 PNG 图标。

### 步骤 1：下载图标
图标已自动下载到你的"下载"文件夹，名为 `app-icon.png`

### 步骤 2：转换为 macOS 格式（.icns）

**在线转换（最简单）**：
1. 访问：https://cloudconvert.com/png-to-icns
2. 上传 `app-icon.png`
3. 点击"Convert"
4. 下载转换后的文件
5. 重命名为 `icon.icns`
6. 移动到 `build/` 文件夹

**或使用命令行（如果安装了 iconutil）**：
```bash
# 创建 iconset 文件夹
mkdir app-icon.iconset

# 生成各种尺寸（需要 sips 命令）
sips -z 16 16     app-icon.png --out app-icon.iconset/icon_16x16.png
sips -z 32 32     app-icon.png --out app-icon.iconset/icon_16x16@2x.png
sips -z 32 32     app-icon.png --out app-icon.iconset/icon_32x32.png
sips -z 64 64     app-icon.png --out app-icon.iconset/icon_32x32@2x.png
sips -z 128 128   app-icon.png --out app-icon.iconset/icon_128x128.png
sips -z 256 256   app-icon.png --out app-icon.iconset/icon_128x128@2x.png
sips -z 256 256   app-icon.png --out app-icon.iconset/icon_256x256.png
sips -z 512 512   app-icon.png --out app-icon.iconset/icon_256x256@2x.png
sips -z 512 512   app-icon.png --out app-icon.iconset/icon_512x512.png
sips -z 1024 1024 app-icon.png --out app-icon.iconset/icon_512x512@2x.png

# 转换为 icns
iconutil -c icns app-icon.iconset -o build/icon.icns
```

### 步骤 3：转换为 Windows 格式（.ico）

**在线转换**：
1. 访问：https://convertio.co/zh/png-ico/
2. 上传 `app-icon.png`
3. 选择输出大小：256x256
4. 下载转换后的文件
5. 重命名为 `icon.ico`
6. 移动到 `build/` 文件夹

## 临时方案（先打包测试）

如果你想先测试打包，可以暂时跳过图标：

**方法 1：使用默认图标**
```bash
# 打包时会使用系统默认图标
npm run build:mac
```

**方法 2：使用占位图标**
```bash
# 我帮你创建一个简单的占位图标
# 然后你可以直接打包
```

## 专业方案（推荐给客户）

如果要作为产品销售，建议找设计师设计专业图标：

**图标设计要点**：
- ✅ 简洁明了，易于识别
- ✅ 在小尺寸下依然清晰
- ✅ 配色与应用主题一致
- ✅ 避免过多细节

**推荐设计元素**：
- 📝 笔记本 + 笔
- 🎓 毕业帽
- ⭐ 星星（代表评价）
- 💬 对话气泡
- 🤖 AI 元素

## 当前状态

✅ 图标生成器已打开
⏳ 等待下载 app-icon.png
⏳ 等待转换为 .icns 格式
⏳ 等待转换为 .ico 格式

完成后，你的 build 文件夹应该包含：
```
build/
├── icon.icns    (macOS 图标)
└── icon.ico     (Windows 图标)
```

然后就可以运行打包命令了！
