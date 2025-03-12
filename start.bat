@echo off
echo ===================================================
echo        组织架构设计工具 - 启动程序
echo ===================================================
echo.

:: 检查虚拟环境是否存在
if not exist venv (
    echo 虚拟环境不存在！请先运行 install.bat 安装程序。
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 激活虚拟环境
echo 正在激活虚拟环境...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo 激活虚拟环境失败！
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

:: 启动应用
echo.
echo 正在启动组织架构设计工具...
echo 应用将在浏览器中自动打开。
echo 如果没有自动打开，请手动访问: http://127.0.0.1:5000
echo.
echo 按 Ctrl+C 可以停止应用。
echo.
python run.py 