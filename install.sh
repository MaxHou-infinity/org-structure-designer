#!/bin/bash

# 组织架构设计工具安装脚本

echo "==================================================="
echo "        组织架构设计工具 - 安装程序"
echo "==================================================="
echo

# 检查 Python 是否已安装
echo "正在检查 Python 安装..."
if ! command -v python3 &> /dev/null; then
    echo "Python 未安装！请先安装 Python 3.7 或更高版本。"
    echo "您可以从 https://www.python.org/downloads/ 下载 Python。"
    echo
    echo "Mac 用户也可以使用 Homebrew 安装："
    echo "brew install python3"
    echo
    echo "Linux 用户可以使用包管理器安装，例如："
    echo "sudo apt-get install python3 python3-pip python3-venv  # Ubuntu/Debian"
    echo "sudo yum install python3 python3-pip  # CentOS/RHEL"
    exit 1
fi

# 检查 Python 版本
PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
echo "检测到 Python 版本: $PYTHON_VERSION"

# 创建虚拟环境
echo
echo "正在创建虚拟环境..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "创建虚拟环境失败！"
    echo "请确保您有权限在当前目录创建文件，并且已安装 venv 模块。"
    echo
    echo "Ubuntu/Debian 用户可以运行："
    echo "sudo apt-get install python3-venv"
    exit 1
fi

# 激活虚拟环境
echo "正在激活虚拟环境..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "激活虚拟环境失败！"
    exit 1
fi

# 安装依赖
echo
echo "正在安装必要的依赖..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "安装依赖失败！"
    echo "请检查您的网络连接，或尝试手动安装依赖。"
    exit 1
fi

# 创建数据目录
echo
echo "正在创建数据目录..."
mkdir -p data
mkdir -p examples

# 设置执行权限
chmod +x start.sh

# 安装完成
echo
echo "==================================================="
echo "        安装完成！"
echo "==================================================="
echo
echo "您现在可以运行 ./start.sh 启动应用。"
echo

# 检查pip是否安装
if ! command -v pip3 &> /dev/null; then
    echo "错误: 未找到pip3，请安装pip3后再试"
    echo "通常pip3随Python3一起安装，或者您可以参考: https://pip.pypa.io/en/stable/installation/"
    exit 1
fi

# 显示Python和pip版本
echo "检测到的pip版本:"
pip3 --version
echo

# 更新pip
echo "更新pip..."
pip3 install --upgrade pip

# 检查安装是否成功
if [ $? -eq 0 ]; then
    echo "依赖项安装成功！"
else
    echo "依赖项安装失败，请检查错误信息并重试。"
    exit 1
fi

# 设置启动脚本权限
echo "设置启动脚本权限..."
chmod +x start.sh

echo
echo "====================================================="
echo "安装完成！您现在可以通过以下命令启动应用："
echo "  ./start.sh"
echo
echo "或者直接运行："
echo "  python3 run.py"
echo "=====================================================" 