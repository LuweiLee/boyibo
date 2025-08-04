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

        // 初始化备用数据服务
        try {
            const { default: fallbackService } = await import('./fallback-data.js');
            this.fallbackService = fallbackService;
        } catch (error) {
            console.error('备用数据服务加载失败:', error);
        }

        this.isInitialized = true;
    }


    // 从Worker获取数据
    async getFromWorker(fileName) {
        try {
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
            return data;
        } catch (error) {
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
            throw error;
        }
    }

    // 获取推荐数据
    async getRecommendations() {
        try {
            const data = await this.getFromWorker('recommendations.json');
            return data || [];
        } catch (error) {
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
                // 获取失败时创建新列表
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
            if (this.fallbackService) {
                return await this.fallbackService.getCommunityPosts();
            }
            return [];
        }
    }

    // 保存社区帖子（仅用于新帖子）
    async saveCommunityPost(post) {
        try {
            // 先获取现有数据
            let postsData = [];
            try {
                const data = await this.getFromWorker('community_posts.json');
                // 处理Worker返回的数据格式 {posts: [...]} 或直接数组
                postsData = Array.isArray(data) ? data : (data?.posts || []);
            } catch (error) {
                // 获取失败时创建新列表
            }

            // 检查是否已存在该帖子（防止重复添加）
            const existingPostIndex = postsData.findIndex(p => p.id === post.id);
            
            if (existingPostIndex >= 0) {
                // 如果帖子已存在，更新而不是新增
                postsData[existingPostIndex] = {
                    ...postsData[existingPostIndex],
                    ...post,
                    updatedAt: new Date().toISOString()
                };
            } else {
                // 添加新帖子
                const newPost = {
                    ...post,
                    id: post.id || this.generateId(),
                    createdAt: post.createdAt || new Date().toISOString()
                };
                postsData.unshift(newPost);
            }

            // 保存到Worker - 保持原有的数据格式
            const saveData = { posts: postsData };
            await this.uploadToWorker('community_posts.json', saveData);
            return post.id || this.generateId();
        } catch (error) {
            // 使用备用服务
            if (this.fallbackService) {
                return await this.fallbackService.saveCommunityPost(post);
            }
            
            throw error;
        }
    }

    // 更新社区帖子（专门用于更新现有帖子）
    async updateCommunityPost(postId, updates) {
        try {
            // 获取现有帖子数据
            const data = await this.getFromWorker('community_posts.json');
            const postsData = Array.isArray(data) ? data : (data?.posts || []);
            
            // 查找并更新指定帖子
            const postIndex = postsData.findIndex(p => p.id === postId);
            if (postIndex >= 0) {
                postsData[postIndex] = {
                    ...postsData[postIndex],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                
                // 保存更新后的数据
                const saveData = { posts: postsData };
                await this.uploadToWorker('community_posts.json', saveData);
                return true;
            }
            
            return false;
        } catch (error) {
            // 使用备用服务
            if (this.fallbackService) {
                return await this.fallbackService.updatePostLikes(postId, updates.likes);
            }
            
            return false;
        }
    }

    // 更新帖子点赞数（保留原有方法，但现在推荐使用updateCommunityPost）
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