# 🔧 Cloudflare R2 CORS配置指南

## 问题说明

当前遇到的CORS错误：
```
Access to fetch at 'https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com/recommendations.json' 
from origin 'https://boyibo.pages.dev' has been blocked by CORS policy
```

这是因为R2存储桶没有配置允许来自Pages域名的跨域访问。

## 🚀 解决方案

### 步骤1：登录Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的账户
3. 进入 "R2 Object Storage" 页面

### 步骤2：配置R2存储桶CORS

1. 找到你的存储桶 `boyibo-storage`
2. 点击存储桶名称进入详情页
3. 点击 "Settings" 标签页
4. 找到 "CORS Policy" 部分
5. 点击 "Add CORS Policy" 或 "Edit"

### 步骤3：添加CORS规则

复制以下JSON配置并粘贴到CORS Policy中：

```json
[
  {
    "AllowedOrigins": [
      "https://boyibo.pages.dev",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cache-Control"
    ],
    "ExposeHeaders": [
      "ETag",
      "Content-Length"
    ],
    "MaxAgeSeconds": 3600
  }
]
```
# 🔧 Cloudflare R2 CORS配置指南

## 问题说明

当前遇到的CORS错误：
```
Access to fetch at 'https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com/recommendations.json' 
from origin 'https://boyibo.pages.dev' has been blocked by CORS policy
```

这是因为R2存储桶没有配置允许来自Pages域名的跨域访问。

## 🚀 解决方案

### 步骤1：登录Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的账户
3. 进入 "R2 Object Storage" 页面

### 步骤2：配置R2存储桶CORS

1. 找到你的存储桶 `boyibo-storage`
2. 点击存储桶名称进入详情页
3. 点击 "Settings" 标签页
4. 找到 "CORS Policy" 部分
5. 点击 "Add CORS Policy" 或 "Edit"

### 步骤3：添加CORS规则

复制以下JSON配置并粘贴到CORS Policy中：


**重要修复说明：**
1. 移除了通配符 `"https://*.pages.dev"` - R2不支持通配符域名
2. 移除了 `"*"` 通配符头部 - 使用具体的头部名称
3. 移除了 `"OPTIONS"` 方法 - R2会自动处理预检请求
4. 简化了 `ExposeHeaders` - 只包含必要的头部
5. 移除了占位符域名，只保留实际需要的域名

**如果你有自定义域名，请手动添加到 AllowedOrigins 中：**
```json
"AllowedOrigins": [
  "https://boyibo.pages.dev",
  "https://你的实际域名.com",
  "http://localhost:3000",
  "http://localhost:5173"
]
```

### 步骤4：保存配置

1. 点击 "Save" 保存CORS配置
2. 等待配置生效（通常需要几分钟）

## 🔄 替代方案：使用Cloudflare Workers代理

如果直接配置CORS仍有问题，可以创建一个Worker作为代理：

### 创建Worker代理

1. 在Cloudflare Dashboard中进入 "Workers & Pages"
2. 点击 "Create application" -> "Create Worker"
3. 使用以下代码：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 只处理API请求
    if (!url.pathname.startsWith('/api/')) {
      return new Response('Not Found', { status: 404 });
    }
    
    // 提取文件名
    const fileName = url.pathname.replace('/api/', '');
    const r2Url = `https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com/${fileName}`;
    
    // 设置CORS头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };
    
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // 代理请求到R2
      const response = await fetch(r2Url, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? request.body : undefined,
      });
      
      // 添加CORS头到响应
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          ...corsHeaders,
        },
      });
      
      return newResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }
  },
};
```

4. 部署Worker到自定义域名（如：`api.boyibo.com`）

### 更新存储配置

如果使用Worker代理，需要更新存储配置：

```javascript
// 在 src/js/storage.js 中更新
this.r2Config = {
    accountId: "9d12d28ae909512f60a7ad1545c2dacd",
    bucketName: "boyibo-storage",
    // 使用Worker代理URL而不是直接的R2 URL
    endpoint: "https://你的worker域名.workers.dev/api",
    // 或者使用自定义域名
    // endpoint: "https://api.boyibo.com",
    accessKeyId: "b8b6866a3cdb629467818ebdac4f5cae",
    secretAccessKey: "8cde2e1621670c51e5c979ea853874c46fc663be7eeeec19bd29b5371972ef0f"
};
```

## 🧪 测试CORS配置

配置完成后，可以通过以下方式测试：

### 浏览器控制台测试

```javascript
fetch('https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com/test.json')
  .then(response => console.log('CORS配置成功'))
  .catch(error => console.log('CORS配置失败:', error));
```

### 使用curl测试

```bash
curl -H "Origin: https://boyibo.pages.dev" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com/test.json
```

## 📋 配置完成检查清单

- [ ] 登录Cloudflare Dashboard
- [ ] 找到R2存储桶 `boyibo-storage`
- [ ] 配置CORS Policy
- [ ] 添加正确的域名到AllowedOrigins
- [ ] 保存配置并等待生效
- [ ] 测试CORS是否工作正常
- [ ] 刷新boyibo.pages.dev页面验证功能

## 🔍 常见问题

### Q: CORS配置后仍然报错？
A: 等待5-10分钟让配置生效，清除浏览器缓存后重试。

### Q: 如何添加自定义域名？
A: 在AllowedOrigins中添加你的自定义域名，如 "https://boyibo.com"。

### Q: 是否需要配置认证？
A: 对于公共读取，不需要额外认证。写入操作需要正确的访问密钥。

配置完成后，你的项目应该能够正常访问R2存储，所有功能都将正常工作！