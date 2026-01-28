#!/bin/bash

# 睿析成绩分析系统 - 智能启动脚本

# 切换到脚本所在目录
cd "$(dirname "$0")"

# 查找可用端口（从8899开始）
PORT=8899
while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; do
    PORT=$((PORT+1))
done

# 显示提示
clear
echo "=========================================="
echo "  睿析成绩分析系统"
echo "=========================================="
echo ""
echo "✓ 正在启动本地服务器..."
echo "✓ 地址: http://localhost:$PORT"
echo ""
echo "⚠️  请保持此窗口打开"
echo "⚠️  关闭窗口将停止服务"
echo ""
echo "按 Ctrl+C 可停止服务器"
echo "=========================================="
echo ""

# 延迟后自动打开浏览器
(sleep 3 && open "http://localhost:$PORT/") &

# 启动服务器
python3 -m http.server $PORT
