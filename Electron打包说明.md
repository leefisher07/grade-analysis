# Electron 桌面应用打包说明

## 📦 已配置的打包功能

智能评语系统已经配置好 Electron 打包，可以生成专业的桌面应用程序。

## 🎯 支持的平台

- ✅ **macOS** - .dmg 安装包 + .zip 压缩包
- ✅ **Windows** - .exe 安装程序 + .zip 压缩包

## 🚀 打包命令

### 打包 macOS 应用
```bash
cd "/Users/lijiahao/Desktop/Intelligent Comment System"
npm run build:mac
```

**生成文件**：
- `release/智能评语系统-1.0.0-mac.dmg` - macOS 安装包
- `release/智能评语系统-1.0.0-mac.zip` - macOS 压缩包

### 打包 Windows 应用（需要在 Mac 上配置 wine）
```bash
npm run build:win
```

**生成文件**：
- `release/智能评语系统-1.0.0-win.exe` - Windows 安装程序
- `release/智能评语系统-1.0.0-win.zip` - Windows 压缩包

### 同时打包所有平台
```bash
npm run build
```

## 📋 打包前检查清单

- [ ] 确保所有代码已提交
- [ ] 更新版本号（package.json 中的 version 字段）
- [ ] 准备应用图标（build/icon.icns 和 build/icon.ico）
- [ ] 测试开发环境运行正常
- [ ] 检查网络连接（需要下载依赖）

## 🎨 应用图标

### macOS 图标（.icns）
放置在：`build/icon.icns`

**创建方法**：
1. 准备一个 1024x1024 的 PNG 图片
2. 使用在线工具转换为 .icns 格式
3. 推荐工具：https://cloudconvert.com/png-to-icns

### Windows 图标（.ico）
放置在：`build/icon.ico`

**创建方法**：
1. 准备一个 256x256 的 PNG 图片
2. 使用在线工具转换为 .ico 格式
3. 推荐工具：https://convertio.co/zh/png-ico/

## ⚙️ 应用配置

### 应用信息
在 `package.json` 中配置：

```json
{
  "name": "intelligent-comment-system",
  "productName": "智能评语系统",
  "version": "1.0.0",
  "description": "基于 AI 的智能学生评语生成系统",
  "author": "智能评语系统开发团队"
}
```

### 窗口设置
在 `electron/main.ts` 中配置：

```typescript
{
  width: 1400,          // 窗口宽度
  height: 900,          // 窗口高度
  minWidth: 1200,       // 最小宽度
  minHeight: 700,       // 最小高度
  title: '智能评语系统' // 窗口标题
}
```

## 📦 打包产物说明

### macOS 应用
**文件**：`智能评语系统.app`

**安装方式**：
1. 双击 .dmg 文件
2. 拖动应用图标到 Applications 文件夹
3. 在启动台或应用程序文件夹中找到并运行

**注意事项**：
- 首次运行可能提示"无法验证开发者"
- 解决方法：系统偏好设置 → 安全性与隐私 → 允许运行

### Windows 应用
**文件**：`智能评语系统 Setup.exe`

**安装方式**：
1. 双击安装程序
2. 选择安装位置
3. 完成安装

**功能**：
- ✅ 自动创建桌面快捷方式
- ✅ 自动创建开始菜单项
- ✅ 支持自定义安装路径
- ✅ 支持卸载程序

## 🔧 开发模式测试

在打包前，先用开发模式测试 Electron 应用：

```bash
npm run electron:dev
```

这会启动 Electron 应用并加载开发服务器。

## 📊 打包文件大小

预估文件大小：
- macOS .dmg: ~150-200 MB
- Windows .exe: ~180-250 MB

**文件较大的原因**：
- Electron 框架本身 (~80MB)
- Chromium 浏览器核心 (~70MB)
- Node.js 运行时 (~10MB)
- 应用代码和资源 (~10MB)

## 🚨 常见问题

### Q1: 打包时报错 "Cannot find module 'electron'"

**解决方法**：
```bash
npm install
```

### Q2: macOS 应用无法打开

**原因**：macOS 的安全机制阻止了未签名的应用

**解决方法**：
```bash
# 方法1：在系统偏好设置中允许运行
# 方法2：使用命令行移除隔离标记
xattr -cr /Applications/智能评语系统.app
```

### Q3: Windows 打包失败

**原因**：在 macOS 上打包 Windows 应用需要额外配置

**解决方法**：
1. 只打包 macOS 版本：`npm run build:mac`
2. 或在 Windows 系统上打包 Windows 版本

### Q4: 应用图标没有显示

**检查**：
- `build/icon.icns` 文件是否存在
- `build/icon.ico` 文件是否存在
- 图标文件格式是否正确

## 💡 优化建议

### 减小应用体积

1. **移除开发依赖**：
   ```bash
   npm prune --production
   ```

2. **压缩资源文件**：
   - 压缩图片
   - 移除未使用的字体

3. **使用 asar 打包**：
   已自动启用，可以减小约 10-20% 的体积

### 提升启动速度

1. **延迟加载**：
   - 非关键模块延迟加载
   - 使用代码分割

2. **缓存优化**：
   - 启用 HTTP 缓存
   - 使用 localStorage

## 📚 分发准备

### 准备发布包

打包完成后，`release` 文件夹包含：

```
release/
├── 智能评语系统-1.0.0-mac.dmg      # macOS 安装包
├── 智能评语系统-1.0.0-mac.zip      # macOS 压缩包
├── 智能评语系统-1.0.0-win.exe      # Windows 安装程序
└── 智能评语系统-1.0.0-win.zip      # Windows 压缩包
```

### 版本管理

每次发布新版本：

1. 更新 `package.json` 中的 version
2. 更新 CHANGELOG（记录改动）
3. 重新打包
4. 测试安装包
5. 发布

### 销售建议

**定价策略**：
- 基础版：按激活码售卖
- 企业版：提供定制服务
- 订阅制：年费制，持续更新

**交付方式**：
1. 提供下载链接
2. 附带激活码
3. 提供使用文档
4. 技术支持服务

## 📞 技术支持

遇到打包问题，可以：
1. 查看 Electron 官方文档
2. 查看 electron-builder 文档
3. 检查错误日志

---

**版本**：1.0.0  
**最后更新**：2026年01月20日  
**文档维护**：智能评语系统开发团队
