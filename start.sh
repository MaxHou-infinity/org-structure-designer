#!/bin/bash

echo "==================================================="
echo "        组织架构设计工具 - 启动程序"
echo "==================================================="
echo

# 检查虚拟环境是否存在
if [ ! -d "venv" ]; then
    echo "虚拟环境不存在！请先运行 ./install.sh 安装程序。"
    exit 1
fi

# 激活虚拟环境
echo "正在激活虚拟环境..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "激活虚拟环境失败！"
    exit 1
fi

# 启动应用
echo
echo "正在启动组织架构设计工具..."
echo "应用将在浏览器中自动打开。"
echo "如果没有自动打开，请手动访问: http://127.0.0.1:5000"
echo
echo "按 Ctrl+C 可以停止应用。"
echo
python3 run.py 