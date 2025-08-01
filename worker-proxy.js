// Cloudflare Worker代理 - 解决R2存储CORS问题
// 部署到 Workers & Pages -> Create Worker

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS头部配置
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Max-Age': '86400',
    };
    
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      });
    }
    
    // R2存储配置
    const R2_ENDPOINT = 'https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com';
    
    // 提取文件路径（移除/api前缀）
    let filePath = url.pathname;
    if (filePath.startsWith('/api/')) {
      filePath = filePath.substring(5);
    } else if (filePath === '/') {
      filePath = 'index.json';
    }
    
    // 构建R2 URL
    const r2Url = `${R2_ENDPOINT}/${filePath}`;
    
    try {
      // 代理请求到R2
      const r2Request = new Request(r2Url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });
      
      const response = await fetch(r2Request);
      
      // 创建新的响应，添加CORS头
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...corsHeaders,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'public, max-age=300', // 5分钟缓存
        },
      });
      
      return newResponse;
      
    } catch (error) {
      console.error('Worker代理错误:', error);
      
      // 返回错误响应
      return new Response(JSON.stringify({ 
        error: '代理请求失败',
        message: error.message,
        path: filePath 
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  },
};