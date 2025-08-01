// 云端存储服务 - 专注于Cloudflare R2，带CORS错误处理
class CloudStorageService {
    constructor() {
        this.r2Config = null;
        this.isInitialized = false;
        this.fallbackService = null;
        this.corsError = false;
    }

    // 初始化存储服务
    async init() {
        // 调试环境变量
        console.log('🔍 环境变量调试:');
        console.log('VITE_WORKER_ENDPOINT:', import.meta.env.VITE_WORKER_ENDPOINT);
        console.log('VITE_R2_ACCOUNT_ID:', import.meta.env.VITE_R2_ACCOUNT_ID);
        console.log('所有环境变量:', import.meta.env);
        
        // R2配置 - 使用Worker代理，添加fallback
        this.r2Config = {
            accountId: import.meta.env.VITE_R2_ACCOUNT_ID || "9d12d28ae909512f60a7ad1545c2dacd",
            bucketName: "boyibo-storage",
            // Worker代理访问（推荐，完全解决CORS问题）
            endpoint: import.meta.env.VITE_WORKER_ENDPOINT || "https://boyibo-api.chriswu25.workers.dev/api",
            accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY_ID || "b8b6866a3cdb629467818ebdac4f5cae",
            secretAccessKey: import.meta.env.VITE_R2_SECRET_ACCESS_KEY || "8cde2e1621670c51e5c979ea853874c46fc663be7eeeec19bd29b5371972ef0f",
            // 是否使用Worker代理
            useWorkerProxy: true
        };
        
        console.log('📡 最终配置的endpoint:', this.r2Config.endpoint);

        // 初始化备用数据服务
        try {
            const { default: fallbackService } = await import('./fallback-data.js');
            this.fallbackService = fallbackService;
        } catch (error) {
            console.error('备用数据服务加载失败:', error);
        }

        this.isInitialized = true;
        console.log('存储服务已就绪 ✅');
    }


    // 从Worker获取数据
    async getFromWorker(fileName) {
        try {
            console.log(`从Worker获取: ${fileName}`, `${this.r2Config.endpoint}/${fileName}`);
            const response = await fetch(`${this.r2Config.endpoint}/${fileName}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`Worker获取成功: ${fileName}`, data);
            return data;
        } catch (error) {
            console.log(`Worker获取异常: ${error.message}`);
            throw error;
        }
    }

    // 上传到Worker
    async uploadToWorker(fileName, data) {
        try {
            const response = await fetch(`${this.r2Config.endpoint}/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error(`数据保存失败 ${fileName}:`, error.message);
            throw error;
        }
    }

    // 获取推荐数据
    async getRecommendations() {
        try {
            const data = await this.getFromWorker('recommendations.json');
            return data || [];
        } catch (error) {
            console.log('获取推荐失败，使用备用数据');
            if (this.fallbackService) {
                return await this.fallbackService.getRecommendations();
            }
            return [];
        }
    }

    // 保存推荐
    async saveRecommendation(recommendation) {
        try {
            // 先获取现有数据
            let recommendationsData = [];
            try {
                const data = await this.getFromWorker('recommendations.json');
                // 处理Worker返回的数据格式 {recommendations: [...]} 或直接数组
                recommendationsData = Array.isArray(data) ? data : (data?.recommendations || []);
            } catch (error) {
                console.log('获取现有推荐失败，创建新列表');
            }

            // 添加新推荐
            const newRecommendation = {
                ...recommendation,
                id: recommendation.id || this.generateId(),
                createdAt: recommendation.createdAt || new Date().toISOString()
            };

            recommendationsData.unshift(newRecommendation);

            // 保存到Worker - 保持原有的数据格式
            const saveData = { recommendations: recommendationsData };
            await this.uploadToWorker('recommendations.json', saveData);
            return newRecommendation.id;
        } catch (error) {
            console.error('保存推荐失败:', error.message);
            
            // 使用备用服务
            if (this.fallbackService) {
                return await this.fallbackService.saveRecommendation(recommendation);
            }
            
            throw error;
        }
    }

    // 获取社区帖子
    async getCommunityPosts() {
        try {
            const data = await this.getFromWorker('community_posts.json');
            return data || [];
        } catch (error) {
            console.log('获取帖子失败，使用备用数据');
            if (this.fallbackService) {
                return await this.fallbackService.getCommunityPosts();
            }
            return [];
        }
    }

    // 保存社区帖子
    async saveCommunityPost(post) {
        try {
            // 先获取现有数据
            let postsData = [];
            try {
                const data = await this.getFromWorker('community_posts.json');
                // 处理Worker返回的数据格式 {posts: [...]} 或直接数组
                postsData = Array.isArray(data) ? data : (data?.posts || []);
            } catch (error) {
                console.log('获取现有帖子失败，创建新列表');
            }

            // 添加新帖子
            const newPost = {
                ...post,
                id: post.id || this.generateId(),
                createdAt: post.createdAt || new Date().toISOString()
            };

            postsData.unshift(newPost);

            // 保存到Worker - 保持原有的数据格式
            const saveData = { posts: postsData };
            await this.uploadToWorker('community_posts.json', saveData);
            return newPost.id;
        } catch (error) {
            console.error('保存帖子失败:', error.message);
            
            // 使用备用服务
            if (this.fallbackService) {
                return await this.fallbackService.saveCommunityPost(post);
            }
            
            throw error;
        }
    }

    // 更新帖子点赞数
    async updatePostLikes(postId, likes) {
        try {
            // 获取现有帖子
            const data = await this.getFromWorker('community_posts.json');
            const postsData = Array.isArray(data) ? data : (data?.posts || []);
            
            // 更新点赞数
            const post = postsData.find(p => p.id === postId);
            if (post) {
                post.likes = likes;
                post.updatedAt = new Date().toISOString();
                
                // 保存更新后的数据 - 保持原有的数据格式
                const saveData = { posts: postsData };
                await this.uploadToWorker('community_posts.json', saveData);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log('更新点赞数失败:', error.message);
            
            // 使用备用服务
            if (this.fallbackService) {
                return await this.fallbackService.updatePostLikes(postId, likes);
            }
            
            return false;
        }
    }

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        return `${days}天前`;
    }

    // 获取存储状态
    getStorageStatus() {
        return {
            isInitialized: this.isInitialized,
            corsError: this.corsError,
            hasFallback: !!this.fallbackService,
            endpoint: this.r2Config?.endpoint,
            useWorkerProxy: this.r2Config?.useWorkerProxy
        };
    }
}

// 创建并导出存储服务实例
const storageService = new CloudStorageService();
export default storageService;