#!/bin/bash

# 睿析成绩分析系统 - 本地服务器启动脚本

clear
echo "======================================"
echo "  睿析成绩分析系统 正在启动..."
echo "======================================"
echo ""

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 检查端口是否被占用
PORT=8899
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT+1))
done

echo "✓ 准备启动本地服务器..."
echo "✓ 端口: $PORT"
echo ""
echo "提示："
echo "1. 服务器启动后会自动打开浏览器"
echo "2. 请勿关闭此窗口，否则系统将停止运行"
echo "3. 使用完毕后，按 Ctrl+C 关闭服务器"
echo ""
echo "======================================"
echo ""

# 启动Python HTTP服务器（兼容Python 2和3）
if command -v python3 &> /dev/null; then
    # 延迟2秒后打开浏览器
    (sleep 2 && open "http://localhost:$PORT/") &
    echo "✓ 服务器已启动: http://localhost:$PORT"
    echo ""
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    (sleep 2 && open "http://localhost:$PORT/") &
    echo "✓ 服务器已启动: http://localhost:$PORT"
    echo ""
    python -m SimpleHTTPServer $PORT
else
    echo "❌ 错误：系统未安装Python"
    echo ""
    echo "解决方法："
    echo "1. 安装Python（访问 https://www.python.org/downloads/）"
    echo "2. 或使用其他浏览器方式："
    echo "   - 右键HTML文件 → 打开方式 → Chrome"
    echo "   - 在Chrome中打开后，允许文件访问权限"
    echo ""
    read -p "按回车键退出..."
    exit 1
fi
