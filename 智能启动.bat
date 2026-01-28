@echo off
chcp 65001 >nul
title 睿析成绩分析系统 - 智能启动

cls
echo ==========================================
echo   睿析成绩分析系统
echo ==========================================
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 查找可用端口（从8899开始）
set PORT=8899

:CHECK_PORT
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    set /a PORT+=1
    goto CHECK_PORT
)

echo ✓ 正在启动本地服务器...
echo ✓ 地址: http://localhost:%PORT%
echo.
echo ⚠️  请保持此窗口打开
echo ⚠️  关闭窗口将停止服务
echo.
echo 按 Ctrl+C 可停止服务器
echo ==========================================
echo.

REM 检测Python版本并启动服务器
python --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 服务器已启动: http://localhost:%PORT%
    echo.
    start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:%PORT%/"
    python -m http.server %PORT%
    goto END
)

py --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 服务器已启动: http://localhost:%PORT%
    echo.
    start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:%PORT%/"
    py -m http.server %PORT%
    goto END
)

python3 --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 服务器已启动: http://localhost:%PORT%
    echo.
    start /min cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:%PORT%/"
    python3 -m http.server %PORT%
    goto END
)

REM 如果没有Python，给出提示
echo ❌ 错误：系统未安装Python
echo.
echo 解决方法：
echo 1. 安装Python（访问 https://www.python.org/downloads/）
echo 2. 安装时勾选 "Add Python to PATH"
echo 3. 安装完成后重新运行本程序
echo.
pause

:END
