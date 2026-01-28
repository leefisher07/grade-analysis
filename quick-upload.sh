#!/bin/bash

# 智能评语系统 - GitHub 上传脚本
# 使用方法：
# 1. 先在 GitHub 上创建仓库
# 2. 生成 Personal Access Token（Token 只显示一次，保存好！）
# 3. 运行此脚本并输入 Token

echo "🚀 开始上传智能评语系统到 GitHub..."
echo ""

# 项目目录
PROJECT_DIR="$HOME/Desktop/project/Intelligent Comment System"
cd "$PROJECT_DIR"

# 检查 git 状态
echo "📋 检查项目状态..."
git status

echo ""

# 获取 Token
read -p "请输入您的 GitHub Personal Access Token: " GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Token 不能为空"
    exit 1
fi

# 设置远程仓库
git remote remove origin 2>/dev/null || true
echo "🔗 配置远程仓库..."
git remote add origin https://leefisher07:$GITHUB_TOKEN@github.com/leefisher07/Intelligent-Comment-System.git

# 验证远程仓库
echo "✅ 远程仓库配置成功："
git remote -v

echo ""
echo "📤 开始推送代码..."

# 推送代码
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 上传成功！"
    echo ""
    echo "📍 仓库地址："
    echo "   https://github.com/leefisher07/Intelligent-Comment-System"
    echo ""
    echo "🌐 访问项目："
    open "https://github.com/leefisher07/Intelligent-Comment-System"
    echo ""
else
    echo ""
    echo "❌ 上传失败！"
    echo ""
    echo "可能的原因："
    echo "1. Token 无效或已过期"
    echo "2. Token 权限不足（需要 repo 权限）"
    echo "3. 网络连接问题"
    echo ""
    echo "解决方案："
    echo "1. 重新生成 Token（https://github.com/settings/tokens）"
    echo "2. 确保 Token 包含 repo 权限"
    echo "3. 检查网络连接"
    echo ""
fi
