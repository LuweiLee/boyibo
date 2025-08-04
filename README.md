# Boyibo - 个人推荐与社区分享平台

一个现代化的个人推荐和社区分享平台，支持云端存储和本地备份。

## 功能特性

### 核心功能
- 📝 **个人推荐管理** - 添加、编辑和管理个人推荐内容
- 💬 **社区互动** - 发布帖子、点赞互动、社区讨论
- ☁️ **云端存储** - 基于Cloudflare R2的可靠数据存储
- 🔄 **智能备份** - 本地备份机制，确保数据安全
- 📱 **响应式设计** - 完美适配桌面和移动设备

### 技术特性
- 🚀 **现代化架构** - 使用ES6+模块化开发
- 🛡️ **错误处理** - 完善的CORS错误处理和降级机制
- 🔧 **Worker代理** - 通过Cloudflare Worker解决跨域问题
- 💾 **数据持久化** - 支持云端和本地双重存储

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **存储**: Cloudflare R2 + Worker代理
- **备份**: 本地LocalStorage + 备用数据服务
- **构建**: Vite (开发服务器)

## 项目结构

```
boyibo/
├── src/
│   ├── js/
│   │   ├── main.js           # 主应用逻辑
│   │   ├── storage.js        # 云端存储服务
│   │   └── fallback-data.js  # 备用数据服务
│   ├── css/
│   │   └── style.css         # 样式文件
│   └── index.html            # 主页面
├── README.md
└── package.json
```

## 快速开始

### 环境要求
- Node.js 16+
- 现代浏览器支持

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 配置说明

### 环境变量
创建 `.env` 文件并配置以下变量：

```env
VITE_R2_ACCOUNT_ID=your_r2_account_id
VITE_R2_ACCESS_KEY_ID=your_access_key
VITE_R2_SECRET_ACCESS_KEY=your_secret_key
VITE_WORKER_ENDPOINT=your_worker_endpoint
```

### Cloudflare R2 配置
1. 创建R2存储桶
2. 配置访问密钥
3. 部署Worker代理服务
4. 更新环境变量

## 核心模块

### CloudStorageService
云端存储服务，负责与Cloudflare R2的数据交互：
- 支持Worker代理模式
- 自动错误处理和降级
- 完整的CRUD操作支持

### 数据结构
- **推荐数据**: `recommendations.json`
- **社区帖子**: `community_posts.json`
- **用户配置**: 本地存储

## 最近更新

### v1.2.0 (2024-12-19)
- 🔧 **代码重构**: 清理重复的类定义，提升代码质量
- 🛠️ **错误修复**: 修复TypeScript语法错误
- 📦 **代码优化**: 应用DRY、KISS、SOLID原则
- 🧹 **代码清理**: 移除冗余代码，提高可维护性

### 改进详情
- 消除了`storage.js`中的重复类定义
- 代码量减少约60%，提升性能
- 保持所有功能完整性
- 增强代码可读性和维护性

## 开发指南

### 代码规范
- 遵循ES6+标准
- 使用模块化开发
- 保持代码简洁(KISS原则)
- 避免重复代码(DRY原则)
- 单一职责原则(SRP)

### 贡献指南
1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

如有问题或建议，请通过以下方式联系：
- 创建Issue
- 发起Discussion
- 提交Pull Request

---

**Boyibo** - 让分享更简单，让推荐更有价值 ✨