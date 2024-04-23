# 草稿本
> 在V2EX冲浪时看到该帖子 [想找一种 vscode 扩展](https://www.v2ex.com/t/1033986)，确实是不错的点子，于是就有了这个插件。

选择本地文件夹或 GitHub 仓库作为草稿本，然后你将可以很方便地管理你的草稿，就像自带的资源管理器一样。

再也不用为你的 `"test"` 文件夹（临时文件、代码草稿）额外打开一个窗口了。类似于IDEA的 **Scratches** 功能。

**BUG**与**建议**请前往[Issues](https://github.com/qxchuckle/vsc-drafts/issues)讨论。

## 安装
VSCode插件市场：[草稿本(Drafts Scratch)](https://marketplace.visualstudio.com/items?itemName=qcqx.qx-drafts)

## 简介
一个命令：`草稿本：选择文件夹`，用于选择一个文件夹作为草稿本。

![image](https://github.com/qxchuckle/vsc-drafts/assets/55614189/b8737ac8-69fe-49ab-a1c5-025e85565e70)

使用**树视图**展示草稿本结构，就像自带的资源管理器一样。
1. 支持的操作：打开、创建、删除、重命名、终端打开、系统资源管理器打开、新窗口打开。
2. 草稿本列表：可以将当前草稿本保存（收藏）起来，支持快速热切换。

![image](https://github.com/qxchuckle/vsc-drafts/assets/55614189/6d77214c-a248-4a1e-b6c4-6e275076cf90)

### GitHub 远端草稿本
0.2.2 版本后支持选择一个 GitHub 仓库作为远端草稿本。一些需要**多端同步**的草稿可以使用该功能。

你需要事先在 GitHub 上创建一个仓库，然后点击 **初始化与选择**，依次填写 GitHub 用户名、Token、仓库名。

![image](https://github.com/qxchuckle/vsc-drafts/assets/55614189/5b5f4cd7-ace7-4967-b084-6fdded6b8fc9)

## TODO
1. 让 GitHub 远端草稿本也支持保存在草稿列表中

## 开发
克隆本项目：

```bash
git clone git@github.com:qxchuckle/vsc-drafts.git
cd vsc-drafts
npm install
```

项目结构：

```
├───📁 resource # 静态资源
├───📁 src # 项目源码
│   ├───📁 [功能名称] # 区分不同功能
│   │   └─── 📁 commends # 该功能的命令
│   │   └─── 📁 treeView # 该功能的树视图
|   |   └─── 📁 ...... # 该功能的其它子项
│   └───📄 extension.ts # 入口文件
├───📁 types # 定义类型
└───📄 ......
```















