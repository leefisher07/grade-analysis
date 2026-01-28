@echo off
chcp 65001 >nul
title 睿析成绩分析系统 - 网页版打包

echo ======================================
echo   睿析成绩分析系统 - 网页版打包
echo ======================================
echo.

:: 设置变量
set TODAY=%date:~0,4%%date:~5,2%%date:~8,2%
set DEST_FOLDER=%USERPROFILE%\Desktop\睿析成绩分析系统_网页版_%TODAY%
set PROJECT_DIR=%~dp0

:: 1. 构建项目
echo 📦 步骤1/4: 正在构建Web应用...
cd /d "%PROJECT_DIR%"
call npm run build

if not exist "dist\index.html" (
    echo ❌ 构建失败！请检查错误信息
    pause
    exit /b 1
)

echo ✅ 构建完成
echo.

:: 2. 创建目标文件夹
echo 📁 步骤2/4: 正在准备文件...
if exist "%DEST_FOLDER%" rmdir /s /q "%DEST_FOLDER%"
mkdir "%DEST_FOLDER%"

:: 3. 复制文件
copy /y "dist\index.html" "%DEST_FOLDER%\睿析成绩分析系统.html" >nul
copy /y "启动程序.bat" "%DEST_FOLDER%\" >nul
copy /y "启动程序.command" "%DEST_FOLDER%\" >nul

:: 创建快速开始文件
(
echo ====================================
echo   睿析成绩分析系统 - 快速开始
echo ====================================
echo.
echo 【Windows用户】
echo 双击"启动程序.bat"即可开始使用
echo.
echo 【Mac用户】
echo 双击"启动程序.command"即可开始使用
echo.
echo 【或者】
echo 直接双击"睿析成绩分析系统.html"文件
echo.
echo 【首次使用】
echo 1. 点击"配置科目并下载模板"
echo 2. 在Excel中填写学生成绩
echo 3. 上传填好的成绩表
echo 4. 查看自动生成的分析报告
echo.
echo 【重要提示】⚠️
echo - 数据保存在浏览器中，请勿清理浏览器缓存
echo - 建议定期复制HTML文件到其他位置备份
echo - 不同浏览器的数据是独立的
echo.
echo 【常见问题】
echo Q: 为什么我的数据不见了？
echo A: 可能清理了浏览器缓存，请使用备份的HTML文件
echo.
echo Q: 可以在多台电脑上使用吗？
echo A: 可以！复制HTML文件到U盘，在任何电脑上打开即可
echo.
echo 【技术支持】
echo 如有问题，请联系：
echo 📧 邮箱：support@example.com
echo 📱 微信：your-wechat-id
echo ⏰ 工作时间：周一至周五 9:00-18:00
echo.
echo 祝您使用愉快！🎉
) > "%DEST_FOLDER%\快速开始.txt"

echo ✅ 文件准备完成
echo.

:: 4. 创建压缩包（需要7-Zip或WinRAR）
echo 📦 步骤3/4: 正在创建压缩包...

:: 检查7-Zip
if exist "%ProgramFiles%\7-Zip\7z.exe" (
    "%ProgramFiles%\7-Zip\7z.exe" a -tzip "%USERPROFILE%\Desktop\睿析成绩分析系统_网页版_%TODAY%.zip" "%DEST_FOLDER%\*" >nul
    goto :COMPRESSED
)

:: 检查WinRAR
if exist "%ProgramFiles%\WinRAR\WinRAR.exe" (
    "%ProgramFiles%\WinRAR\WinRAR.exe" a -afzip "%USERPROFILE%\Desktop\睿析成绩分析系统_网页版_%TODAY%.zip" "%DEST_FOLDER%\*" >nul
    goto :COMPRESSED
)

:: 使用PowerShell压缩
echo 使用PowerShell压缩...
powershell -command "Compress-Archive -Path '%DEST_FOLDER%\*' -DestinationPath '%USERPROFILE%\Desktop\睿析成绩分析系统_网页版_%TODAY%.zip' -Force"

:COMPRESSED
echo ✅ 压缩包创建完成
echo.

:: 5. 显示结果
echo ======================================
echo ✅ 打包完成！
echo ======================================
echo.
echo 📁 文件夹位置：
echo    %DEST_FOLDER%
echo.
echo 📦 压缩包位置：
echo    %USERPROFILE%\Desktop\睿析成绩分析系统_网页版_%TODAY%.zip
echo.
echo 📊 文件列表：
dir /b "%DEST_FOLDER%"
echo.
echo 💡 下一步：
echo 1. 测试：打开文件夹，双击启动程序测试
echo 2. 分享：将压缩包发送给老师
echo 3. 说明：提醒老师查看"快速开始.txt"
echo.

:: 询问是否打开文件夹
set /p choice="是否现在打开文件夹查看？(y/n): "
if /i "%choice%"=="y" (
    explorer "%DEST_FOLDER%"
)

echo.
echo 🎉 祝您销售顺利！
echo.
pause
