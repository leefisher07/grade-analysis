@echo off
chcp 65001 >nul
title 睿析成绩分析系统 - 本地服务器

cls
echo ======================================
echo   睿析成绩分析系统 正在启动...
echo ======================================
echo.

REM 切换到脚本所在目录
cd /d "%~dp0"

REM 设置端口
set PORT=8899

:CHECK_PORT
netstat -ano | findstr ":%PORT%" | findstr "LISTENING" >nul 2>&1
if %errorlevel%==0 (
    set /a PORT+=1
    goto CHECK_PORT
)

echo ✓ 准备启动本地服务器...
echo ✓ 端口: %PORT%
echo.
echo 提示：
echo 1. 服务器启动后会自动打开浏览器
echo 2. 请勿关闭此窗口，否则系统将停止运行
echo 3. 使用完毕后，按 Ctrl+C 关闭服务器
echo.
echo ======================================
echo.

REM 检测Python版本并启动服务器
python --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 服务器已启动: http://localhost:%PORT%
    echo.
    REM 延迟2秒后打开浏览器
    start /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%/"
    python -m http.server %PORT%
    goto END
)

py --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 服务器已启动: http://localhost:%PORT%
    echo.
    start /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%/"
    py -m http.server %PORT%
    goto END
)

python3 --version >nul 2>&1
if %errorlevel%==0 (
    echo ✓ 服务器已启动: http://localhost:%PORT%
    echo.
    start /min cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%/"
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
echo 或者使用备选方法：
echo - 直接双击"睿析成绩分析系统.html"
echo - 在Chrome浏览器中打开
echo - 允许文件访问权限
echo.
pause

:END
