# 🔒 安全配置指南

## ⚠️ 重要安全提醒

**在将项目推送到GitHub之前，必须完成以下安全配置！**

## 🚨 立即处理的安全问题

### 1. 暴露的敏感信息
以下信息已在代码中暴露，需要立即更换：

```
❌ R2 Access Key ID: b8b6866a3cdb629467818ebdac4f5cae
❌ R2 Secret Access Key: 8cde2e1621670c51e5c979ea853874c46fc663be7eeeec19bd29b5371972ef0f
❌ R2 API Token: c3DDMZlDgexc7K1FpBJEB-TfPIPAVn8E6u2H8T4W
❌ Account ID: 9d12d28ae909512f60a7ad1545c2dacd
❌ Worker域名: boyibo-api.chriswu25.workers.dev
```

## 🔧 安全配置步骤

### 步骤1: 更换所有密钥

1. **登录Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 进入 "R2 Object Storage"

2. **重新生成R2 API密钥**
   - 删除现有的API密钥
   - 创建新的API密钥对
   - 记录新的Access Key ID和Secret Access Key

3. **重新生成API Token**
   - 进入 "My Profile" > "API Tokens"
   - 删除旧的token
   - 创建新的R2专用token

### 步骤2: R2存储桶安全配置

#### 关闭公开访问（推荐）
```bash
# 在Cloudflare Dashboard中：
# R2 > 你的存储桶 > Settings > Public access
# 设置为 "Disabled"
```

#### 配置自定义域名（可选）
```bash
# 1. 在R2存储桶设置中添加自定义域名
# 2. 配置DNS记录
# 3. 更新代码中的endpoint
```

### 步骤3: 代码安全化

#### 创建环境变量文件
```bash
# 创建 .env 文件（不要提交到Git）
echo "VITE_R2_ACCOUNT_ID=你的新账户ID" > .env
echo "VITE_R2_ACCESS_KEY_ID=你的新AccessKey" >> .env
echo "VITE_R2_SECRET_ACCESS_KEY=你的新SecretKey" >> .env
echo "VITE_R2_BUCKET_NAME=boyibo-storage" >> .env
echo "VITE_WORKER_ENDPOINT=https://你的worker域名.workers.dev/api" >> .env
```

#### 更新.gitignore
```bash
# 添加到.gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
echo "src/config/storage-config.js" >> .gitignore
```

#### 修改配置文件
将硬编码的密钥替换为环境变量：

```javascript
// src/js/storage.js
export const CLOUDFLARE_R2_CONFIG = {
    accountId: import.meta.env.VITE_R2_ACCOUNT_ID,
    bucketName: import.meta.env.VITE_R2_BUCKET_NAME,
    endpoint: import.meta.env.VITE_WORKER_ENDPOINT,
    accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY,
    useWorkerProxy: true
};
```

### 步骤4: Worker安全配置

#### 更新Worker代码
```javascript
// worker-proxy.js
const R2_ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

// 添加访问控制
const ALLOWED_ORIGINS = [
    'https://boyibo.pages.dev',
    'https://你的自定义域名.com',
    'http://localhost:3000' // 仅开发环境
];
```

#### 设置Worker环境变量
在Cloudflare Workers Dashboard中设置：
```
R2_ACCOUNT_ID = 你的新账户ID
R2_ACCESS_KEY_ID = 你的新AccessKey
R2_SECRET_ACCESS_KEY = 你的新SecretKey
```

## 🛡️ 最佳安全实践

### 1. 访问控制
- ✅ 使用Worker代理而不是直接访问R2
- ✅ 设置允许的域名白名单
- ✅ 关闭R2存储桶的公开访问

### 2. 密钥管理
- ✅ 使用环境变量存储敏感信息
- ✅ 定期轮换API密钥
- ✅ 最小权限原则

### 3. 代码安全
- ✅ 不在代码中硬编码密钥
- ✅ 使用.gitignore排除敏感文件
- ✅ 代码审查检查敏感信息

### 4. 部署安全
- ✅ 在Cloudflare Pages中设置环境变量
- ✅ 使用HTTPS
- ✅ 启用安全头

## 📋 安全检查清单

推送到GitHub前的检查：

- [ ] 已更换所有API密钥和Token
- [ ] 已关闭R2存储桶公开访问
- [ ] 已创建.env文件并添加到.gitignore
- [ ] 已将硬编码密钥替换为环境变量
- [ ] 已更新Worker环境变量
- [ ] 已测试新配置是否正常工作
- [ ] 已删除所有包含敏感信息的文件

## 🚀 部署后配置

### Cloudflare Pages环境变量
在Pages项目设置中添加：
```
VITE_R2_ACCOUNT_ID = 你的新账户ID
VITE_R2_ACCESS_KEY_ID = 你的新AccessKey
VITE_R2_SECRET_ACCESS_KEY = 你的新SecretKey
VITE_R2_BUCKET_NAME = boyibo-storage
VITE_WORKER_ENDPOINT = https://你的worker域名.workers.dev/api
```

### 域名安全
如果使用自定义域名：
- 配置SSL证书
- 启用HSTS
- 设置安全头

## 📞 紧急情况处理

如果密钥已经泄露：
1. 立即登录Cloudflare Dashboard
2. 删除所有相关的API密钥和Token
3. 检查R2存储桶访问日志
4. 重新生成所有密钥
5. 更新所有配置

## 🔍 安全监控

定期检查：
- API密钥使用情况
- R2存储桶访问日志
- Worker请求日志
- 异常访问模式

---

**⚠️ 重要提醒**: 完成所有安全配置后，再推送代码到GitHub！