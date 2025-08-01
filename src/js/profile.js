// 个人页面功能模块
class ProfileManager {
    constructor() {
        this.currentUser = this.loadUserData();
        this.avatarEmojis = ['🎯', '🎲', '🏆', '💎', '⭐', '🔥', '💪', '🎊', '🎈', '🎭'];
        this.init();
    }

    init() {
        this.updateUserStats();
        this.loadRecentActivity();
    }

    // 加载用户数据
    loadUserData() {
        const savedUser = localStorage.getItem('boyibo_user');
        if (savedUser) {
            return JSON.parse(savedUser);
        }
        
        // 默认用户数据
        return {
            username: '博彩达人',
            avatar: '🎯',
            joinDate: '2024年1月',
            level: '高级会员',
            posts: 12,
            likes: 89,
            points: 1250,
            winRate: 73,
            achievements: ['连胜达人', '社区之星']
        };
    }

    // 保存用户数据
    saveUserData() {
        localStorage.setItem('boyibo_user', JSON.stringify(this.currentUser));
    }

    // 更新用户统计
    updateUserStats() {
        document.getElementById('displayUsername').textContent = this.currentUser.username;
        document.getElementById('userAvatar').textContent = this.currentUser.avatar;
        document.getElementById('userPosts').textContent = this.currentUser.posts;
        document.getElementById('userLikes').textContent = this.currentUser.likes;
        document.getElementById('userPoints').textContent = this.currentUser.points.toLocaleString();
        document.getElementById('winRate').textContent = this.currentUser.winRate + '%';
    }

    // 更换头像
    changeAvatar() {
        const currentIndex = this.avatarEmojis.indexOf(this.currentUser.avatar);
        const nextIndex = (currentIndex + 1) % this.avatarEmojis.length;
        this.currentUser.avatar = this.avatarEmojis[nextIndex];
        
        document.getElementById('userAvatar').textContent = this.currentUser.avatar;
        this.saveUserData();
        
        // 添加动画效果
        const avatar = document.getElementById('userAvatar');
        avatar.style.transform = 'scale(1.2)';
        setTimeout(() => {
            avatar.style.transform = 'scale(1)';
        }, 200);
    }

    // 编辑用户名
    editUsername() {
        const currentUsername = this.currentUser.username;
        const newUsername = prompt('请输入新的用户名:', currentUsername);
        
        if (newUsername && newUsername.trim() && newUsername !== currentUsername) {
            this.currentUser.username = newUsername.trim();
            document.getElementById('displayUsername').textContent = this.currentUser.username;
            this.saveUserData();
            
            // 添加到活动记录
            this.addActivity('✏️', `你更新了用户名为"${this.currentUser.username}"`, '刚刚');
        }
    }

    // 加载最近活动
    loadRecentActivity() {
        const activities = this.getRecentActivities();
        const activityList = document.getElementById('activityList');
        
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <span class="activity-icon">${activity.icon}</span>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-time">${activity.time}</span>
            </div>
        `).join('');
    }

    // 获取最近活动数据
    getRecentActivities() {
        const savedActivities = localStorage.getItem('boyibo_activities');
        if (savedActivities) {
            return JSON.parse(savedActivities);
        }
        
        return [
            {
                icon: '👍',
                text: '你的帖子"英超分析"获得了5个点赞',
                time: '2小时前'
            },
            {
                icon: '💬',
                text: '有人评论了你的推荐',
                time: '4小时前'
            },
            {
                icon: '🎯',
                text: '你的推荐"曼城主胜"命中了！',
                time: '1天前'
            }
        ];
    }

    // 添加活动记录
    addActivity(icon, text, time) {
        const activities = this.getRecentActivities();
        activities.unshift({ icon, text, time });
        
        // 只保留最近10条活动
        if (activities.length > 10) {
            activities.splice(10);
        }
        
        localStorage.setItem('boyibo_activities', JSON.stringify(activities));
        this.loadRecentActivity();
    }

    // 显示我的帖子
    showMyPosts() {
        alert('我的帖子功能开发中...\n\n将显示:\n• 已发布的帖子列表\n• 帖子的点赞和评论数\n• 帖子管理功能');
    }

    // 显示我的推荐
    showMyRecommendations() {
        alert('我的推荐功能开发中...\n\n将显示:\n• 历史推荐记录\n• 推荐胜率统计\n• 收益分析图表');
    }

    // 显示关注列表
    showFollowing() {
        alert('关注功能开发中...\n\n将显示:\n• 关注的专家列表\n• 专家最新推荐\n• 专家胜率排行');
    }

    // 显示设置页面
    showSettings() {
        const settings = [
            '🔔 通知设置',
            '🎨 主题设置', 
            '🔒 隐私设置',
            '📊 数据统计',
            '❓ 帮助中心',
            '📞 联系客服'
        ];
        
        alert('设置功能开发中...\n\n可用设置:\n' + settings.join('\n'));
    }

    // 更新用户积分
    updatePoints(points) {
        this.currentUser.points += points;
        document.getElementById('userPoints').textContent = this.currentUser.points.toLocaleString();
        this.saveUserData();
        
        if (points > 0) {
            this.addActivity('💎', `你获得了${points}积分`, '刚刚');
        }
    }

    // 更新点赞数
    updateLikes(likes) {
        this.currentUser.likes += likes;
        document.getElementById('userLikes').textContent = this.currentUser.likes;
        this.saveUserData();
        
        if (likes > 0) {
            this.addActivity('👍', `你的内容获得了${likes}个点赞`, '刚刚');
        }
    }

    // 更新帖子数
    updatePosts(posts) {
        this.currentUser.posts += posts;
        document.getElementById('userPosts').textContent = this.currentUser.posts;
        this.saveUserData();
        
        if (posts > 0) {
            this.addActivity('📝', '你发布了新帖子', '刚刚');
        }
    }

    // 检查成就
    checkAchievements() {
        const achievements = [];
        
        if (this.currentUser.likes >= 100 && !this.currentUser.achievements.includes('社区之星')) {
            achievements.push('社区之星');
            this.addActivity('💎', '恭喜获得"社区之星"成就！', '刚刚');
        }
        
        if (this.currentUser.winRate >= 80 && !this.currentUser.achievements.includes('专家认证')) {
            achievements.push('专家认证');
            this.addActivity('🎖️', '恭喜获得"专家认证"成就！', '刚刚');
        }
        
        if (achievements.length > 0) {
            this.currentUser.achievements.push(...achievements);
            this.saveUserData();
            this.updateAchievementDisplay();
        }
    }

    // 更新成就显示
    updateAchievementDisplay() {
        const achievementItems = document.querySelectorAll('.achievement-item');
        achievementItems.forEach(item => {
            const name = item.querySelector('.achievement-name').textContent;
            if (this.currentUser.achievements.includes(name)) {
                item.classList.add('earned');
            }
        });
    }
}

// 全局函数，供HTML调用
let profileManager;

function changeAvatar() {
    if (profileManager) {
        profileManager.changeAvatar();
    }
}

function editUsername() {
    if (profileManager) {
        profileManager.editUsername();
    }
}

function showMyPosts() {
    if (profileManager) {
        profileManager.showMyPosts();
    }
}

function showMyRecommendations() {
    if (profileManager) {
        profileManager.showMyRecommendations();
    }
}

function showFollowing() {
    if (profileManager) {
        profileManager.showFollowing();
    }
}

function showSettings() {
    if (profileManager) {
        profileManager.showSettings();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileManager;
}