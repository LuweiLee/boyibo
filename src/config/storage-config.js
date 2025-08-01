// 存储服务配置文件
// 请根据你的实际配置信息修改以下内容

export const FIREBASE_CONFIG = {
    // 暂时禁用Firebase，避免配置错误
    // 如需启用，请在Firebase控制台获取正确的配置信息
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
};

export const CLOUDFLARE_R2_CONFIG = {
    // Cloudflare R2配置 - 已填入你提供的信息
    accountId: "9d12d28ae909512f60a7ad1545c2dacd",
    accessKeyId: "b8b6866a3cdb629467818ebdac4f5cae", 
    secretAccessKey: "8cde2e1621670c51e5c979ea853874c46fc663be7eeeec19bd29b5371972ef0f",
    bucketName: "boyibo-storage",
    endpoint: "https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com",
    token: "c3DDMZlDgexc7K1FpBJEB-TfPIPAVn8E6u2H8T4W", // R2 API令牌
    
    // 公共访问URL（如果设置了自定义域名）
    publicUrl: "https://9d12d28ae909512f60a7ad1545c2dacd.r2.cloudflarestorage.com"
};

// 数据库集合名称配置
export const COLLECTIONS = {
    RECOMMENDATIONS: "recommendations",
    COMMUNITY_POSTS: "community_posts",
    USERS: "users",
    COMMENTS: "comments"
};

// 存储策略配置
export const STORAGE_STRATEGY = {
    // 主要存储：firebase | r2 | local
    primary: "r2",
    
    // 备份存储：firebase | r2 | local | none
    backup: "local",
    
    // 自动同步间隔（毫秒）
    syncInterval: 5 * 60 * 1000, // 5分钟
    
    // 离线模式下的最大缓存条目数
    maxCacheItems: 100,
    
    // 是否启用实时同步
    realTimeSync: false // 暂时禁用实时同步，避免Firebase错误
};

// 功能开关配置
export const FEATURES = {
    // 是否启用云端存储
    cloudStorage: true,
    
    // 是否启用离线模式
    offlineMode: true,
    
    // 是否启用数据压缩
    dataCompression: false,
    
    // 是否启用数据加密
    dataEncryption: false,
    
    // 是否启用管理员功能
    adminPanel: true,
    
    // 是否启用实时通知
    realTimeNotifications: true,
    
    // 是否启用Firebase（暂时禁用）
    enableFirebase: false
};

// 开发环境配置
export const DEV_CONFIG = {
    // 是否启用调试日志
    enableDebugLogs: true,
    
    // 是否使用模拟数据
    useMockData: false,
    
    // API请求超时时间（毫秒）
    apiTimeout: 10000,
    
    // 重试次数
    retryAttempts: 3
};

// 生产环境检查
export const isProduction = () => {
    return window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.includes('192.168');
};

// 获取当前环境配置
export const getCurrentConfig = () => {
    const isProd = isProduction();
    
    return {
        ...FIREBASE_CONFIG,
        ...CLOUDFLARE_R2_CONFIG,
        ...COLLECTIONS,
        ...STORAGE_STRATEGY,
        ...FEATURES,
        ...(isProd ? {} : DEV_CONFIG),
        environment: isProd ? 'production' : 'development'
    };
};

// 配置验证函数
export const validateConfig = () => {
    const errors = [];
    
    // 检查Firebase配置
    if (FEATURES.cloudStorage && STORAGE_STRATEGY.primary === 'firebase') {
        if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey === 'your-firebase-api-key') {
            errors.push('Firebase API Key未配置');
        }
        if (!FIREBASE_CONFIG.projectId || FIREBASE_CONFIG.projectId === 'your-firebase-project-id') {
            errors.push('Firebase Project ID未配置');
        }
    }
    
    // 检查R2配置
    if (FEATURES.cloudStorage && (STORAGE_STRATEGY.primary === 'r2' || STORAGE_STRATEGY.backup === 'r2')) {
        if (!CLOUDFLARE_R2_CONFIG.accountId || CLOUDFLARE_R2_CONFIG.accountId === 'your-cloudflare-account-id') {
            errors.push('Cloudflare R2 Account ID未配置');
        }
        if (!CLOUDFLARE_R2_CONFIG.accessKeyId || CLOUDFLARE_R2_CONFIG.accessKeyId === 'your-r2-access-key-id') {
            errors.push('Cloudflare R2 Access Key未配置');
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// 导出默认配置
export default getCurrentConfig();