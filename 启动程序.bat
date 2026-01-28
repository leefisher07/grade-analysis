@echo off
chcp 65001 >nul
title 睿析成绩分析系统
echo.
echo ====================================
echo   睿析成绩分析系统 正在启动...
echo ====================================
echo.
echo 提示：
echo 1. 首次使用请先阅读"使用说明.pdf"
echo 2. 请勿清理浏览器缓存，否则数据会丢失
echo 3. 建议定期备份HTML文件
echo.
echo 正在打开浏览器...
echo.

REM 尝试用Chrome打开
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%~dp0睿析成绩分析系统.html"
    goto :END
)

REM 尝试用Chrome (x86)打开
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%~dp0睿析成绩分析系统.html"
    goto :END
)

REM 尝试用Edge打开
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%~dp0睿析成绩分析系统.html"
    goto :END
)

REM 使用默认浏览器打开
start "" "%~dp0睿析成绩分析系统.html"

:END
echo.
echo 如果浏览器没有自动打开，请手动双击"睿析成绩分析系统.html"文件
echo.
timeout /t 3 >nul
