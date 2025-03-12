#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
组织架构设计工具启动脚本
"""

import os
import sys
import webbrowser
from app import app

def main():
    """启动应用并打开浏览器"""
    print("正在启动组织架构设计工具...")
    
    # 确保数据目录存在
    os.makedirs('data', exist_ok=True)
    
    # 打开浏览器
    webbrowser.open('http://127.0.0.1:5000')
    
    # 启动应用
    app.run(debug=True)

if __name__ == "__main__":
    main() 