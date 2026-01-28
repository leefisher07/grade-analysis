#!/bin/bash

# 智能评语系统 - GitHub 上传脚本
# 使用前请确保：
# 1. 已在 GitHub 上创建仓库：Intelligent-Comment-System
# 2. 已生成 Personal Access Token（如果需要）

echo "🚀 开始上传智能评语系统到 GitHub..."
echo ""

# 项目目录
PROJECT_DIR="$HOME/Desktop/project/Intelligent Comment System"
cd "$PROJECT_DIR"

# 检查 git 状态
echo "📋 检查项目状态..."
git status

echo ""
echo "✅ 项目已提交到本地 git 仓库"
echo ""

# 检查远程仓库配置
if git remote | grep -q origin; then
    echo "⚠️  检测到已存在 origin 远程仓库"
    echo "当前远程仓库："
    git remote -v
    echo ""
    read -p "是否要删除现有远程仓库并重新配置？(y/n): " confirm
    if [ "$confirm" = "y" ]; then
        git remote remove origin
        echo "✅ 已删除现有远程仓库配置"
    else
        echo "❌ 取消操作"
        exit 1
    fi
fi

# 添加远程仓库
echo ""
echo "🔗 添加 GitHub 远程仓库..."
git remote add origin https://github.com/leefisher07/Intelligent-Comment-System.git

# 验证远程仓库
echo ""
echo "✅ 远程仓库已添加："
git remote -v

echo ""
echo "📤 准备推送代码到 GitHub..."
echo ""
echo "⚠️  如果提示需要密码，请使用 Personal Access Token（不是 GitHub 登录密码）"
echo ""

# 推送到 GitHub
git push -u origin main

# 检查推送结果
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 成功上传到 GitHub！"
    echo ""
    echo "📍 仓库地址："
    echo "   https://github.com/leefisher07/Intelligent-Comment-System"
    echo ""
    echo "🌐 访问你的项目："
    echo "   open https://github.com/leefisher07/Intelligent-Comment-System"
    echo ""
else
    echo ""
    echo "❌ 上传失败！"
    echo ""
    echo "可能的原因："
    echo "1. 尚未在 GitHub 上创建仓库"
    echo "2. 需要 Personal Access Token 但未提供"
    echo "3. 网络连接问题"
    echo ""
    echo "解决方案："
    echo "1. 访问 https://github.com/new 创建仓库"
    echo "2. 访问 https://github.com/settings/tokens 生成 Token"
    echo "3. 检查网络连接"
    echo ""
fi
