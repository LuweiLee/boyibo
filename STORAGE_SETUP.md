# 存储服务配置指南

本项目支持使用Firebase和Cloudflare R2作为云端存储服务，用于保存推荐内容和社区留言。

## 🔥 Firebase 配置

### 1. 创建Firebase项目

1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"创建项目"或"添加项目"
3. 输入项目名称（例如：boyibo-app）
4. 选择是否启用Google Analytics（推荐启用）
5. 等待项目创建完成

### 2. 启用Firestore数据库

1. 在Firebase控制台中，点击左侧菜单的"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"（稍后可以修改安全规则）
4. 选择数据库位置（推荐选择离用户最近的区域）

### 3. 获取配置信息

1. 在Firebase控制台中，点击左侧菜单的"项目设置"（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击"</>"图标添加Web应用
4. 输入应用昵称（例如：boyibo-web）
5. 复制显示的配置对象

### 4. 配置Firebase

将获取的配置信息填入 `src/config/storage-config.js` 文件：

```javascript
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "boyibo-app.firebaseapp.com",
    projectId: "boyibo-app",
    storageBucket: "boyibo-app.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop"
};
```

### 5. 设置安全规则（可选）

在Firestore Database -> 规则中，可以设置更严格的安全规则：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 允许读取推荐和帖子
    match /recommendations/{document} {
      allow read: if true;
      allow write: if request.auth != null; // 需要认证才能写入
    }
    
    match /community_posts/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## ☁️ Cloudflare R2 配置

### 1. 创建R2存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在左侧菜单中选择"R2 Object Storage"
3. 点击"创建存储桶"
4. 输入存储桶名称（例如：boyibo-storage）
5. 选择存储桶位置
6. 点击"创建存储桶"

### 2. 创建API令牌

1. 在R2页面中，点击"管理R2 API令牌"
2. 点击"创建API令牌"
3. 选择权限：
   - **对象读取** ✅
   - **对象写入** ✅
   - **存储桶读取** ✅
4. 选择存储桶范围（选择刚创建的存储桶）
5. 点击"创建API令牌"
6. 复制显示的访问密钥ID和秘密访问密钥

### 3. 配置R2

将获取的配置信息填入 `src/config/storage-config.js` 文件：

```javascript
export const CLOUDFLARE_R2_CONFIG = {
    accountId: "your-account-id", // 在R2页面URL中可以找到
    accessKeyId: "your-access-key-id",
    secretAccessKey: "your-secret-access-key", 
    bucketName: "boyibo-storage",
    endpoint: "https://your-account-id.r2.cloudflarestorage.com"
};
```

### 4. 设置自定义域名（可选）

1. 在存储桶设置中，点击"自定义域"
2. 添加你的域名（例如：cdn.boyibo.com）
3. 按照提示配置DNS记录
4. 更新配置文件中的 `publicUrl`

## 🔧 项目配置

### 1. 修改存储策略

在 `src/config/storage-config.js` 中调整存储策略：

```javascript
export const STORAGE_STRATEGY = {
    primary: "firebase",    // 主要存储：firebase | r2 | local
    backup: "r2",          // 备份存储：firebase | r2 | local | none
    syncInterval: 5 * 60 * 1000, // 同步间隔：5分钟
    realTimeSync: true     // 启用实时同步
};
```

### 2. 功能开关

```javascript
export const FEATURES = {
    cloudStorage: true,           // 启用云端存储
    offlineMode: true,           // 启用离线模式
    adminPanel: true,            // 启用管理员功能
    realTimeNotifications: true  // 启用实时通知
};
```

## 🚀 使用方法

### 基本功能

1. **查看数据**：所有推荐和帖子会自动从云端加载
2. **发布帖子**：在社区页面发布的内容会自动保存到云端
3. **点赞功能**：点赞数会实时同步到云端
4. **离线支持**：网络断开时数据会保存在本地，恢复网络后自动同步

### 管理员功能

1. **添加推荐**：双击页面顶部的"搏一搏"logo打开管理员面板
2. **刷新数据**：按 `Ctrl+R` 手动刷新云端数据
3. **关闭面板**：按 `ESC` 关闭管理员面板

### 快捷键

- `Ctrl+R`：刷新数据
- `ESC`：关闭管理员面板
- 双击Logo：打开管理员面板

## 🔍 故障排除

### 常见问题

1. **Firebase连接失败**
   - 检查API密钥是否正确
   - 确认项目ID是否匹配
   - 检查网络连接

2. **R2上传失败**
   - 验证访问密钥是否正确
   - 检查存储桶权限设置
   - 确认账户ID是否正确

3. **数据不同步**
   - 检查浏览器控制台是否有错误信息
   - 确认配置文件中的设置是否正确
   - 尝试手动刷新数据（Ctrl+R）

### 调试模式

在开发环境中，可以启用调试日志：

```javascript
export const DEV_CONFIG = {
    enableDebugLogs: true,  // 启用调试日志
    useMockData: false,     // 使用真实数据
    apiTimeout: 10000,      // API超时时间
    retryAttempts: 3        // 重试次数
};
```

## 📊 数据结构

### 推荐数据结构
```javascript
{
    id: "unique-id",
    title: "比赛标题",
    content: "推荐内容",
    odds: "赔率",
    author: "作者",
    confidence: 85,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### 社区帖子数据结构
```javascript
{
    id: "unique-id", 
    author: "作者",
    avatar: "头像emoji",
    content: "帖子内容",
    likes: 0,
    comments: 0,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
}
```

## 🔐 安全建议

1. **不要在前端代码中暴露敏感信息**
2. **使用环境变量存储API密钥**
3. **设置适当的Firebase安全规则**
4. **定期轮换API密钥**
5. **监控存储使用量和API调用次数**

## 📈 性能优化

1. **启用数据压缩**：减少传输数据量
2. **使用CDN**：为R2设置自定义域名
3. **实现分页**：大量数据时分批加载
4. **缓存策略**：合理设置本地缓存时间

---

配置完成后，重启开发服务器，项目就可以使用云端存储功能了！

如有问题，请检查浏览器控制台的错误信息，或参考上述故障排除部分。