# Cloudflare Pages 部署指南

## 🚀 部署到Cloudflare Pages

### 方法一：通过Git仓库自动部署（推荐）

1. **将代码推送到Git仓库**
   ```bash
   git init
   git add .
   git commit -m "初始化搏一搏项目"
   git branch -M main
   git remote add origin https://github.com/你的用户名/boyibo.git
   git push -u origin main
   ```

2. **在Cloudflare Pages中创建项目**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - 进入 "Pages" 页面
   - 点击 "创建项目" -> "连接到Git"
   - 选择你的Git仓库（GitHub/GitLab）
   - 授权Cloudflare访问仓库

3. **配置构建设置**
   ```
   项目名称: boyibo
   生产分支: main
   构建命令: npm run build
   构建输出目录: dist
   根目录: /
   ```

4. **环境变量配置**
   在Cloudflare Pages项目设置中添加：
   ```
   NODE_VERSION=18
   ENVIRONMENT=production
   ```

### 方法二：直接上传部署

1. **本地构建项目**
   ```bash
   npm run build
   ```

2. **上传dist文件夹**
   - 在Cloudflare Pages中选择"直接上传"
   - 将生成的 `dist` 文件夹拖拽上传
   - 等待部署完成

### 方法三：使用Wrangler CLI

1. **安装Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署项目**
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=boyibo
   ```

## 🔧 R2存储配置

### 1. 确认R2存储桶

确保你的R2存储桶 `boyibo-storage` 已创建并配置正确：
- 存储桶名称: `boyibo-storage`
- 账户ID: `9d12d28ae909512f60a7ad1545c2dacd`

### 2. 配置CORS（重要）

在R2存储桶设置中添加CORS规则：

```json
[
  {
    "AllowedOrigins": [
      "https://boyibo.pages.dev",
      "https://你的自定义域名.com",
      "http://localhost:3000"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

### 3. 设置公共访问（可选）

如果需要公共读取访问，在R2存储桶中：
- 启用"公共访问"
- 配置自定义域名（推荐）

## 🌐 自定义域名配置

### 1. 添加自定义域名

在Cloudflare Pages项目中：
- 进入"自定义域"设置
- 添加你的域名（例如：boyibo.com）
- 按照提示配置DNS记录

### 2. 更新存储配置

部署后，更新 `src/js/storage.js` 中的域名引用：

```javascript
// 如果使用自定义域名，更新baseUrl
this.baseUrl = 'https://你的域名.com/api'; // 或直接使用R2端点
```

## 📊 部署后验证

### 1. 功能测试清单

- [ ] 页面正常加载
- [ ] 社区发帖功能
- [ ] 点赞功能
- [ ] 推荐内容显示
- [ ] 管理员面板（双击Logo）
- [ ] 数据持久化（刷新页面数据不丢失）

### 2. 网络请求检查

打开浏览器开发者工具，检查：
- R2 API请求是否成功
- 是否有CORS错误
- 数据是否正确保存和读取

### 3. 性能优化

- 启用Cloudflare缓存
- 配置压缩
- 优化图片资源

## 🔍 常见问题解决

### CORS错误
```
Access to fetch at 'https://xxx.r2.cloudflarestorage.com' from origin 'https://boyibo.pages.dev' has been blocked by CORS policy
```
**解决方案**: 在R2存储桶中正确配置CORS规则

### 404错误
```
GET https://xxx.r2.cloudflarestorage.com/recommendations.json 404
```
**解决方案**: 
1. 确认文件路径正确
2. 检查R2存储桶权限
3. 初始化示例数据

### 构建失败
```
Build failed: Command failed with exit code 1
```
**解决方案**:
1. 检查package.json中的构建脚本
2. 确认Node.js版本兼容性
3. 检查依赖项是否正确安装

## 📈 监控和维护

### 1. Cloudflare Analytics

在Cloudflare Pages中查看：
- 访问量统计
- 性能指标
- 错误日志

### 2. R2存储监控

在Cloudflare R2中监控：
- 存储使用量
- API调用次数
- 带宽使用情况

### 3. 定期维护

- 清理旧数据（30天以上）
- 监控存储成本
- 更新安全配置

## 🎯 部署成功后

部署成功后，你将获得：
- Cloudflare Pages URL: `https://boyibo.pages.dev`
- 全球CDN加速
- 自动HTTPS证书
- 无服务器架构
- 高可用性保障

项目将完全运行在Cloudflare的边缘网络上，为全球用户提供快速、稳定的访问体验！