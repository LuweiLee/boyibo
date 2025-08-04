// 应用主要功能模块
class BoyiboApp {
    constructor() {
        this.currentSection = 'home';
        this.posts = [];
        this.recommendations = [];
        this.storageService = null;
        this.init();
    }

    // 初始化应用
    async init() {
        this.setupNavigation();
        await this.initStorage();
        await this.loadData();
        this.renderRecommendations();
        this.renderPosts();
        this.setupAutoSync();
        this.initNicknameInput(); // 初始化昵称输入框
    }

    // 初始化存储服务
    async initStorage() {
        try {
            // 动态导入存储服务
            const { default: storageService } = await import('./storage.js');
            await storageService.init();
            this.storageService = storageService;
        } catch (error) {
            this.storageService = null;
        }
    }

    // 设置自动同步
    setupAutoSync() {
        if (this.storageService) {
            // 每5分钟自动同步一次数据
            setInterval(() => {
                this.storageService.syncData();
            }, 5 * 60 * 1000);

            // 页面关闭前同步数据
            window.addEventListener('beforeunload', () => {
                this.storageService.syncData();
            });
        }
    }

    // 设置导航功能
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNav(link);
            });
        });
    }

    // 显示指定区域
    showSection(sectionId) {
        // 隐藏所有区域
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 显示目标区域
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
        }
    }

    // 更新导航激活状态
    updateActiveNav(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // 加载数据（从云端或本地）
    async loadData() {
        try {
            // 加载推荐数据
            if (this.storageService) {
                const recData = await this.storageService.getRecommendations();
                // 处理R2返回的数据格式 {recommendations: [...]} 或直接数组
                this.recommendations = Array.isArray(recData) ? recData : (recData?.recommendations || []);
                
                const postsData = await this.storageService.getCommunityPosts();
                // 处理R2返回的数据格式 {posts: [...]} 或直接数组
                let loadedPosts = Array.isArray(postsData) ? postsData : (postsData?.posts || []);
                
                // 确保每个帖子都有完整的点赞数据结构
                this.posts = loadedPosts.map(post => ({
                    ...post,
                    likes: post.likes || 0,
                    likedBy: post.likedBy || [],
                    comments: post.comments || 0
                }));
                
            }

            // 如果云端没有数据，使用模拟数据
            if (this.recommendations.length === 0) {
                this.recommendations = this.getMockRecommendations();
                // 保存模拟数据到云端
                if (this.storageService) {
                    for (const rec of this.recommendations) {
                        await this.storageService.saveRecommendation(rec);
                    }
                }
            }

            if (this.posts.length === 0) {
                this.posts = this.getMockPosts();
                // 保存模拟数据到云端（包含完整的点赞数据结构）
                if (this.storageService) {
                    for (const post of this.posts) {
                        // 确保模拟数据也有完整的点赞结构
                        const postWithLikeData = {
                            ...post,
                            likes: post.likes || 0,
                            likedBy: post.likedBy || [],
                            comments: post.comments || 0
                        };
                        await this.storageService.saveCommunityPost(postWithLikeData);
                    }
                }
            }

        } catch (error) {
            // 备选方案：使用模拟数据
            this.recommendations = this.getMockRecommendations();
            this.posts = this.getMockPosts();
        }
    }

    // 获取模拟推荐数据
    getMockRecommendations() {
        return [
            {
                id: utils.generateId(),
                title: '英超曼城 vs 阿森纳',
                content: '基于双方近期状态和历史交锋记录，推荐主胜。曼城主场优势明显，阿森纳客场表现不稳定。',
                odds: '1.85',
                author: '足球专家',
                time: '2小时前',
                confidence: 85,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: utils.generateId(),
                title: 'NBA湖人 vs 勇士',
                content: '湖人近期状态回升，主力球员伤愈复出。勇士客场作战，推荐湖人让分胜。',
                odds: '1.92',
                author: '篮球分析师',
                time: '3小时前',
                confidence: 78,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            },
            {
                id: utils.generateId(),
                title: '欧冠巴萨 vs 拜仁',
                content: '经典对决，双方实力接近。考虑到巴萨主场因素和近期进攻火力，推荐大2.5球。',
                odds: '2.10',
                author: '欧洲足球通',
                time: '5小时前',
                confidence: 72,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    // 获取模拟帖子数据
    getMockPosts() {
        return [
            {
                id: utils.generateId(),
                author: '老司机',
                avatar: '🚗',
                content: '今天跟了专家的推荐，成功上岸！感谢社区的各位大神分享经验。',
                time: '1小时前',
                likes: 15,
                likedBy: [], // 空数组，表示还没有用户点赞
                comments: 3,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
            },
            {
                id: utils.generateId(),
                author: '新手小白',
                avatar: '🔰',
                content: '刚入门，请问大家有什么好的资金管理建议吗？不想一把梭哈...',
                time: '2小时前',
                likes: 8,
                likedBy: [], // 空数组，表示还没有用户点赞
                comments: 12,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: utils.generateId(),
                author: '数据分析达人',
                avatar: '📊',
                content: '分享一个小技巧：关注球队的伤病情况和轮换政策，这些往往被忽视但很重要。',
                time: '4小时前',
                likes: 23,
                likedBy: [], // 空数组，表示还没有用户点赞
                comments: 7,
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
            }
        ];
    }

    // 渲染推荐内容
    renderRecommendations() {
        const container = document.getElementById('recommendationsGrid');
        if (!container) return;

        container.innerHTML = this.recommendations.map(rec => {
            // 计算真实时间显示，优先使用createdAt
            const recTime = rec.createdAt ? utils.formatTime(new Date(rec.createdAt)) : rec.time;
            
            return `
                <div class="recommendation-card">
                    <div class="recommendation-header">
                        <div class="recommendation-title">${rec.title}</div>
                        <div class="recommendation-odds">${rec.odds}</div>
                    </div>
                    <div class="recommendation-content">${rec.content}</div>
                    <div class="recommendation-meta">
                        <span class="recommendation-author">by ${rec.author}</span>
                        <span class="recommendation-time">${recTime}</span>
                    </div>
                    <div style="margin-top: 1rem;">
                        <div style="background: #f0f0f0; border-radius: 10px; height: 8px; overflow: hidden;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; width: ${rec.confidence}%; transition: width 0.3s ease;"></div>
                        </div>
                        <small style="color: #888; margin-top: 0.5rem; display: block;">信心指数: ${rec.confidence}%</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 渲染社区帖子
    renderPosts() {
        const container = document.getElementById('postsList');
        if (!container) return;

        container.innerHTML = this.posts.map(post => {
            // 计算真实时间显示
            const postTime = post.createdAt ? utils.formatTime(new Date(post.createdAt)) : post.time;
            const userId = this.getUserId(); // 获取当前用户ID
            const hasLiked = post.likedBy && post.likedBy.includes(userId);
            const likeButtonClass = hasLiked ? 'post-action liked' : 'post-action';
            
            return `
                <div class="post-item">
                    <div class="post-header">
                        <div class="post-avatar">${post.avatar}</div>
                        <div class="post-info">
                            <h4>${post.author}</h4>
                            <div class="post-time">${postTime}</div>
                        </div>
                    </div>
                    <div class="post-content">${post.content}</div>
                    <div class="post-actions">
                        <div class="${likeButtonClass}" onclick="app.likePost('${post.id}')">
                            <span>${hasLiked ? '❤️' : '👍'}</span>
                            <span>${post.likes || 0}</span>
                        </div>
                        <div class="post-action" onclick="app.commentPost('${post.id}')">
                            <span>💬</span>
                            <span>${post.comments || 0}</span>
                        </div>
                        <div class="post-action">
                            <span>🔗</span>
                            <span>分享</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 获取用户ID（简单的本地存储方案）
    getUserId() {
        let userId = utils.storage.get('boyibo_user_id');
        if (!userId) {
            userId = 'user_' + utils.generateId();
            utils.storage.set('boyibo_user_id', userId);
        }
        return userId;
    }

    // 点赞功能（防重复点赞，数据同步到R2）
    async likePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const userId = this.getUserId();
        
        // 初始化likedBy数组
        if (!post.likedBy) {
            post.likedBy = [];
        }

        // 检查是否已经点赞
        const hasLiked = post.likedBy.includes(userId);
        
        if (hasLiked) {
            // 取消点赞
            post.likedBy = post.likedBy.filter(id => id !== userId);
            post.likes = Math.max(0, (post.likes || 0) - 1);
            this.showNotification('已取消点赞', 'info');
        } else {
            // 添加点赞
            post.likedBy.push(userId);
            post.likes = (post.likes || 0) + 1;
            this.showNotification('点赞成功！', 'success');
        }

        // 立即重新渲染UI
        this.renderPosts();
        
        // 使用更新方法而不是保存新帖子（关键修复）
        if (this.storageService) {
            try {
                // 使用专门的更新方法，避免创建重复帖子
                const updateData = {
                    likes: post.likes,
                    likedBy: post.likedBy
                };
                
                await this.storageService.updateCommunityPost(postId, updateData);
            } catch (error) {
                this.showNotification('点赞同步失败，请检查网络', 'warning');
            }
        }
    }

    // 评论功能
    commentPost(postId) {
        // TODO: 实现评论功能
        this.showNotification('评论功能即将上线，敬请期待！');
    }

    // 创建新帖子
    async createPost() {
        const content = document.getElementById('postContent').value.trim();
        const author = document.getElementById('postAuthor').value.trim();
        
        if (!author) {
            this.showNotification('请输入昵称', 'warning');
            return;
        }
        
        if (!content) {
            this.showNotification('请输入内容', 'warning');
            return;
        }

        // 保存昵称到localStorage，下次自动填充
        utils.storage.set('boyibo_user_nickname', author);

        // 显示加载状态
        const submitBtn = document.querySelector('.post-form .btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '发布中...';
        submitBtn.disabled = true;

        try {
            const now = new Date();
            const newPost = {
                id: utils.generateId(),
                author: author,
                avatar: '😊',
                content: content,
                time: utils.formatTime(now),
                likes: 0,
                comments: 0,
                createdAt: now.toISOString(),
                likedBy: [] // 记录点赞用户，防止重复点赞
            };

            // 保存到云端
            if (this.storageService) {
                const savedId = await this.storageService.saveCommunityPost(newPost);
                newPost.id = savedId;
            }

            // 更新本地数据
            this.posts.unshift(newPost);
            this.renderPosts();
            document.getElementById('postContent').value = '';
            // 不清空昵称，保持用户输入的昵称
            
            // 显示成功提示
            this.showNotification('发布成功！', 'success');
        } catch (error) {
            this.showNotification('发布失败，请重试', 'error');
        } finally {
            // 恢复按钮状态
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // 初始化昵称输入框（页面加载时自动填充）
    initNicknameInput() {
        const nicknameInput = document.getElementById('postAuthor');
        if (nicknameInput) {
            const savedNickname = utils.storage.get('boyibo_user_nickname');
            if (savedNickname) {
                nicknameInput.value = savedNickname;
                nicknameInput.placeholder = '昵称（已保存）';
            }
        }
    }

    // 添加新推荐（管理员功能）
    async addRecommendation(recommendationData) {
        try {
            const newRecommendation = {
                id: utils.generateId(),
                ...recommendationData,
                createdAt: new Date(),
                time: '刚刚'
            };

            // 保存到云端
            if (this.storageService) {
                const savedId = await this.storageService.saveRecommendation(newRecommendation);
                newRecommendation.id = savedId;
            }

            // 更新本地数据
            this.recommendations.unshift(newRecommendation);
            this.renderRecommendations();
            
            this.showNotification('推荐发布成功！', 'success');
            return newRecommendation.id;
        } catch (error) {
            this.showNotification('发布推荐失败，请重试', 'error');
            throw error;
        }
    }

    // 刷新数据
    async refreshData() {
        try {
            this.showNotification('正在刷新数据...', 'info');
            
            if (this.storageService) {
                this.recommendations = await this.storageService.getRecommendations();
                this.posts = await this.storageService.getCommunityPosts();
                
                this.renderRecommendations();
                this.renderPosts();
                
                this.showNotification('数据刷新成功！', 'success');
            }
        } catch (error) {
            this.showNotification('刷新失败，请检查网络连接', 'error');
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        
        // 根据类型设置不同的样式
        const typeStyles = {
            success: 'background: linear-gradient(135deg, #28a745 0%, #20c997 100%);',
            error: 'background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);',
            warning: 'background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #333;',
            info: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            ${typeStyles[type]}
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 1rem 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        // 添加图标
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span>${icons[type]}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);

        // 添加动画样式（如果还没有）
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // 3秒后自动移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
}

// 全局函数，供HTML调用
function createPost() {
    if (window.app) {
        window.app.createPost();
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BoyiboApp();
    // 将app实例暴露到全局，供HTML中的内联事件使用
    window.app = app;
});

// 确保全局函数可用
window.createPost = createPost;

// 添加一些实用工具函数
const utils = {
    // 格式化时间
    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        return `${days}天前`;
    },

    // 生成随机ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 本地存储操作
    storage: {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        get(key) {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    }
};

// 全局页面切换函数，供个人页面的按钮调用
window.showSection = function(sectionId) {
    if (window.app) {
        window.app.showSection(sectionId);
        
        // 更新导航状态
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + sectionId) {
                link.classList.add('active');
            }
        });
    }
};
