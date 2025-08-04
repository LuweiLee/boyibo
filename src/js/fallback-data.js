// 备用数据服务 - 处理CORS错误时的数据管理
class FallbackDataService {
    constructor() {
        this.data = {
            recommendations: [],
            communityPosts: []
        };
        this.corsNoticeShown = false;
    }

    // 显示CORS错误提示
    showCorsNotice() {
        if (this.corsNoticeShown) return;
        
        const notice = document.createElement('div');
        notice.setAttribute('data-cors-notice', 'true');
        notice.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ee5a24);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 350px;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        notice.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
                <strong>CORS配置提醒</strong>
            </div>
            <div style="margin-bottom: 10px;">
                检测到跨域访问限制，当前使用演示数据模式。
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
                请按照部署文档配置R2存储的CORS规则以启用完整功能。
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="position: absolute; top: 5px; right: 8px; 
                           background: none; border: none; color: white; 
                           font-size: 16px; cursor: pointer;">×</button>
        `;
        
        document.body.appendChild(notice);
        this.corsNoticeShown = true;
        
        // 10秒后自动隐藏
        setTimeout(() => {
            if (notice.parentElement) {
                notice.remove();
            }
        }, 10000);
    }

    // 获取推荐数据
    async getRecommendations() {
        // 返回演示推荐数据
        return [
            {
                id: 'demo_rec_1',
                expert: '金融专家老王',
                content: '近期A股市场震荡，建议关注新能源板块的投资机会',
                confidence: 85,
                category: '股票',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
            },
            {
                id: 'demo_rec_2',
                expert: '币圈大V小李',
                content: 'BTC技术面显示支撑位较强，短期可能反弹',
                confidence: 72,
                category: '数字货币',
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5小时前
            },
            {
                id: 'demo_rec_3',
                expert: '期货高手张三',
                content: '原油期货受地缘政治影响，建议谨慎操作',
                confidence: 68,
                category: '期货',
                createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8小时前
            }
        ];
    }

    // 保存推荐（演示模式）
    async saveRecommendation(recommendation) {
        const newRecommendation = {
            ...recommendation,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };
        
        this.data.recommendations.unshift(newRecommendation);
        
        // 显示保存成功提示
        this.showMessage('推荐已保存到演示数据中', 'success');
        
        return newRecommendation.id;
    }

    // 获取社区帖子
    async getCommunityPosts() {
        // 返回演示帖子数据
        return [
            {
                id: 'demo_post_1',
                author: '投资新手',
                content: '刚入市不久，请问大家对当前市场怎么看？',
                likes: 12,
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30分钟前
            },
            {
                id: 'demo_post_2',
                author: '老股民',
                content: '今天的行情真是让人心惊肉跳，大家都还好吗？',
                likes: 8,
                createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() // 90分钟前
            },
            {
                id: 'demo_post_3',
                author: '理财达人',
                content: '分享一个小技巧：定投是普通人最好的投资方式',
                likes: 25,
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3小时前
            }
        ];
    }

    // 保存社区帖子（演示模式）
    async saveCommunityPost(post) {
        const newPost = {
            ...post,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            likes: 0
        };
        
        this.data.communityPosts.unshift(newPost);
        
        // 显示保存成功提示
        this.showMessage('帖子已发布到演示数据中', 'success');
        
        return newPost.id;
    }

    // 更新帖子点赞数（演示模式）
    async updatePostLikes(postId, likes) {
        const post = this.data.communityPosts.find(p => p.id === postId);
        if (post) {
            post.likes = likes;
            post.updatedAt = new Date().toISOString();
            
            // 显示点赞成功提示
            this.showMessage('点赞已更新到演示数据中', 'info');
            return true;
        }
        return false;
    }

    // 更新社区帖子（演示模式）
    async updateCommunityPost(postId, updates) {
        const post = this.data.communityPosts.find(p => p.id === postId);
        if (post) {
            Object.assign(post, updates);
            post.updatedAt = new Date().toISOString();
            
            // 显示更新成功提示
            this.showMessage('帖子已更新到演示数据中', 'info');
            return true;
        }
        return false;
    }

    // 显示消息提示
    showMessage(message, type = 'info') {
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 10001;
            font-size: 14px;
            max-width: 300px;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        // 动画显示
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // 3秒后自动隐藏
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentElement) {
                    messageEl.remove();
                }
            }, 300);
        }, 3000);
    }

    // 生成唯一ID
    generateId() {
        return 'demo_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // 获取演示数据状态
    getStatus() {
        return {
            mode: 'fallback',
            recommendationsCount: this.data.recommendations.length,
            postsCount: this.data.communityPosts.length,
            corsNoticeShown: this.corsNoticeShown
        };
    }
}

// 创建并导出备用数据服务实例
const fallbackDataService = new FallbackDataService();
export default fallbackDataService;