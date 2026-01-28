#!/bin/bash

# 智能评语系统 - 服务器部署脚本
# 使用方法：在服务器上执行 bash deploy.sh

echo "======================================================"
echo "  智能评语系统 - 服务器部署脚本"
echo "======================================================"
echo ""

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js 已安装: $(node -v)"
fi

# 检查 npm 版本
echo "✅ npm 版本: $(npm -v)"

# 创建日志目录
echo ""
echo "📁 创建日志目录..."
mkdir -p logs
echo "✅ 日志目录创建成功: ./logs"

# 安装依赖
echo ""
echo "📦 安装依赖包..."
npm install
if [ $? -eq 0 ]; then
    echo "✅ 依赖安装成功"
else
    echo "❌ 依赖安装失败，请检查网络连接"
    exit 1
fi

# 安装 PM2（如果未安装）
if ! command -v pm2 &> /dev/null; then
    echo ""
    echo "📦 安装 PM2 进程管理器..."
    sudo npm install -g pm2
    echo "✅ PM2 安装成功"
else
    echo "✅ PM2 已安装: $(pm2 -v)"
fi

# 检查数据文件
echo ""
echo "🔍 检查激活码数据文件..."
if [ -f "data/activations.json" ]; then
    TOTAL_CODES=$(grep -o '"[A-Za-z0-9@#$%&*]*":' data/activations.json | wc -l)
    echo "✅ 激活码数据文件存在，包含 $TOTAL_CODES 个激活码"
else
    echo "❌ 激活码数据文件不存在！"
    echo "   请确保 data/activations.json 文件已上传"
    exit 1
fi

# 检查环境变量
echo ""
echo "🔍 检查环境变量配置..."
if [ -f ".env" ]; then
    if grep -q "DEEPSEEK_API_KEY" .env; then
        echo "✅ DeepSeek API Key 已配置"
    else
        echo "❌ .env 文件中未找到 DEEPSEEK_API_KEY"
        exit 1
    fi
else
    echo "❌ .env 文件不存在！"
    exit 1
fi

# 启动服务器（测试模式）
echo ""
echo "======================================================"
echo "  准备启动服务器（测试模式）"
echo "======================================================"
echo ""
echo "选择启动方式："
echo "  1. 直接启动（前台运行，用于测试）"
echo "  2. PM2启动（后台运行，推荐生产环境）"
echo ""
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        echo ""
        echo "🚀 正在启动服务器（测试模式）..."
        echo "   按 Ctrl+C 可停止服务器"
        echo ""
        npm start
        ;;
    2)
        echo ""
        echo "🚀 正在使用 PM2 启动服务器..."
        pm2 start ecosystem.config.cjs
        echo ""
        echo "✅ 服务器已在后台启动"
        echo ""
        echo "📋 常用 PM2 命令："
        echo "   pm2 status                  - 查看运行状态"
        echo "   pm2 logs comment-system-api - 查看日志"
        echo "   pm2 restart comment-system-api - 重启服务"
        echo "   pm2 stop comment-system-api - 停止服务"
        echo ""
        pm2 status
        ;;
    *)
        echo "❌ 无效的选择"
        exit 1
        ;;
esac

echo ""
echo "======================================================"
echo "  部署完成！"
echo "======================================================"
echo ""
echo "📡 服务器地址："
echo "   本地访问: http://localhost:3000"
echo "   外网访问: http://8.134.89.239:3000"
echo ""
echo "🧪 测试接口："
echo "   curl http://8.134.89.239:3000/health"
echo ""
