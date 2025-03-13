# 贡献指南

感谢您对组织架构设计工具的关注！我们欢迎任何形式的贡献，包括但不限于：

- 报告问题（Issues）
- 提交改进建议
- 提交代码修改（Pull Requests）
- 完善文档
- 分享使用经验

## 如何贡献

### 报告问题

1. 在提交新问题之前，请先搜索是否已经存在相似的问题
2. 使用清晰的标题描述问题
3. 详细描述问题的复现步骤
4. 如果可能，请附上截图或错误日志
5. 说明您的运行环境（操作系统、Python版本等）

### 提交代码

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的改动 (`git commit -m '添加某个特性'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建一个 Pull Request

### 代码风格

- 遵循 PEP 8 Python代码风格指南
- 使用有意义的变量名和函数名
- 添加必要的注释
- 确保代码通过所有测试

### 提交信息规范

提交信息应该清晰地描述改动内容，建议使用以下格式：

- feat: 新特性
- fix: 修复问题
- docs: 文档改动
- style: 代码格式改动
- refactor: 代码重构
- test: 测试相关
- chore: 其他改动

示例：`feat: 添加部门拖拽排序功能`

## 开发环境设置

1. 克隆仓库
```bash
git clone https://github.com/您的用户名/org-structure-designer.git
cd org-structure-designer
```

2. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 运行测试
```bash
python -m pytest
```

## 文档

如果您要修改文档，请确保：

1. 文档语言清晰易懂
2. 示例代码可以正常运行
3. 更新相关的版本号和日期
4. 检查文档中的链接是否有效

## 发布流程

1. 更新版本号
2. 更新更新日志（CHANGELOG.md）
3. 创建新的发布标签
4. 推送到 GitHub

## 获取帮助

如果您在贡献过程中遇到任何问题，可以：

1. 查看现有的 Issues
2. 创建新的 Issue 寻求帮助
3. 在 Pull Request 中提出问题

再次感谢您的贡献！ 