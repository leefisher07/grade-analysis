#!/bin/bash

# 睿析成绩分析系统 - Mac启动脚本

clear
echo "===================================="
echo "  睿析成绩分析系统 正在启动..."
echo "===================================="
echo ""
echo "提示："
echo "1. 首次使用请先阅读\"使用说明.pdf\""
echo "2. 请勿清理浏览器缓存，否则数据会丢失"
echo "3. 建议定期备份HTML文件"
echo ""
echo "正在打开浏览器..."
echo ""

# 获取脚本所在目录
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
HTML_FILE="$DIR/睿析成绩分析系统.html"

# 尝试用Chrome打开
if [ -d "/Applications/Google Chrome.app" ]; then
    open -a "Google Chrome" --args --app="file://$HTML_FILE"
    exit 0
fi

# 尝试用Safari打开
if [ -d "/Applications/Safari.app" ]; then
    open -a "Safari" "file://$HTML_FILE"
    exit 0
fi

# 使用默认浏览器打开
open "$HTML_FILE"

echo ""
echo "如果浏览器没有自动打开，请手动双击\"睿析成绩分析系统.html\"文件"
echo ""

sleep 3
