# 微信小游戏 - 养猫咪

一个基于微信小游戏平台的虚拟宠物养成游戏。玩家可以通过喂食和抚摸来照顾自己的虚拟猫咪，提升猫咪的能量和幸福度。

## 项目结构

```
├── game.js              # 游戏主入口文件
├── game/
│   └── sprites/
│       └── cat.js       # 猫咪精灵类
├── scenes/
│   └── main.js         # 主场景
├── js/
│   ├── background.js   # 背景生成
│   └── cat.js         # 猫咪图像生成
└── images/            # 图片资源目录
```

## 主要功能

### 游戏系统
- 实时更新的猫咪状态系统（能量和幸福度）
- 资源管理系统（金币和猫粮）
- 互动系统（喂食和抚摸）

### 游戏界面
- 木质风格的背景设计
- 动态生成的猫咪和背景图像
- 响应式UI设计，适配不同屏幕尺寸

### 交互功能
- 触摸控制
- 圆形按钮设计
- 状态反馈系统

## 技术特点

### 画布渲染
- 使用 Canvas API 进行游戏渲染
- 动态生成图像资源
- 优化的渲染性能

### 状态管理
- 实时状态更新
- 数据持久化
- 事件驱动的交互系统

### 适配系统
- 自适应屏幕尺寸
- 响应式UI布局
- 统一的缩放系统

## 开发说明

### 环境要求
- 微信开发者工具
- 微信小游戏 API 支持

### 开发流程
1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 编译运行游戏

### 注意事项
- 游戏使用 ES6 模块系统
- 所有图像资源都是动态生成的
- 确保微信开发者工具版本支持相关API

## 游戏玩法

### 基本操作
- 点击"喂食"按钮给猫咪补充能量
- 点击"抚摸"按钮提升猫咪幸福度
- 通过商店购买猫粮和其他道具

### 状态说明
- 能量：影响猫咪的活动状态
- 幸福度：影响猫咪的心情表现
- 金币：游戏内购买道具的货币
- 猫粮：喂食消耗的必需品

## 后续开发计划

### 功能扩展
- [ ] 添加更多互动方式
- [ ] 实现猫咪成长系统
- [ ] 添加成就系统
- [ ] 引入社交功能

### 优化改进
- [ ] 优化游戏性能
- [ ] 增强视觉效果
- [ ] 添加音效系统
- [ ] 完善数据存储 