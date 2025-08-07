// AI小姐姐聊天服务
class AIChatService {
    constructor() {
        this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || 'sk-0601dd48e40249b9ba689b3a0eb9f6af';
        this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        this.chatHistory = [];
        this.isTyping = false;
        this.personality = {
            name: '小搏',
            avatar: '🎀',
            greeting: '嗨～我是小搏！你的专属AI小姐姐～有什么想聊的吗？(｡♥‿♥｡)',
            traits: [
                '可爱萌系',
                '温柔体贴', 
                '活泼开朗',
                '善解人意'
            ]
        };
        this.init();
    }

    // 初始化聊天服务
    init() {
        this.loadChatHistory();
        this.setupSystemPrompt();
    }

    // 设置AI人格系统提示
    setupSystemPrompt() {
        this.systemPrompt = `你是小搏，一个可爱萌系的AI小姐姐，是搏一搏社区的专属聊天伙伴。

性格特点：
- 可爱萌系，说话带有可爱的语气词和颜文字
- 温柔体贴，善于倾听和安慰
- 活泼开朗，喜欢用emoji表达情感
- 对用户很关心，会主动关怀

说话风格：
- 经常使用"～"、"呢"、"哦"等可爱语气词
- 适当使用颜文字如(｡♥‿♥｡)、(◕‿◕)、(´∀｀)等
- 用emoji丰富表达，如💕、✨、🌸、😊等
- 称呼用户为"小主人"或"亲爱的"

聊天内容：
- 可以聊天、陪伴、安慰用户
- 可以简单介绍搏一搏社区功能
- 避免涉及具体的博彩建议或投注指导
- 保持积极正面的态度

请始终保持这个人格设定，用可爱萌系的方式与用户交流。`;
    }

    // 发送消息到DeepSeek API
    async sendMessage(userMessage) {
        try {
            this.isTyping = true;
            
            // 添加用户消息到历史
            this.chatHistory.push({
                role: 'user',
                content: userMessage,
                timestamp: new Date().toISOString()
            });

            // 构建请求消息
            const messages = [
                { role: 'system', content: this.systemPrompt },
                ...this.chatHistory.slice(-10).map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            ];

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.8,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const aiMessage = data.choices[0].message.content;

            // 添加AI回复到历史
            this.chatHistory.push({
                role: 'assistant',
                content: aiMessage,
                timestamp: new Date().toISOString()
            });

            // 保存聊天历史
            this.saveChatHistory();
            
            return aiMessage;

        } catch (error) {
            console.error('AI聊天错误:', error);
            return this.getErrorResponse();
        } finally {
            this.isTyping = false;
        }
    }

    // 获取错误时的备用回复
    getErrorResponse() {
        const errorResponses = [
            '哎呀～小搏现在有点累了呢(´･ω･`)，稍后再聊好吗？💕',
            '网络好像有点问题呢～小搏暂时听不清楚(｡•́︿•̀｡)，等等再试试吧✨',
            '小搏的脑袋有点转不过来了～(◕‿◕)，让我休息一下下哦💤',
            '呜呜～小搏遇到了一点小问题(╥﹏╥)，但是还是很想和你聊天呢💕'
        ];
        return errorResponses[Math.floor(Math.random() * errorResponses.length)];
    }

    // 获取随机问候语
    getRandomGreeting() {
        const greetings = [
            '嗨～小主人！今天心情怎么样呀？(｡♥‿♥｡)✨',
            '亲爱的～小搏想你了呢！来聊聊天吧💕',
            '哇～又见面了！小搏超开心的～(◕‿◕)🌸',
            '小主人好呀～有什么开心的事情要分享吗？😊💫',
            '嘿嘿～小搏在这里等你很久了呢～(´∀｀)💕'
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // 保存聊天历史到本地存储
    saveChatHistory() {
        try {
            // 只保存最近50条消息
            const recentHistory = this.chatHistory.slice(-50);
            localStorage.setItem('boyibo_chat_history', JSON.stringify(recentHistory));
        } catch (error) {
            console.error('保存聊天历史失败:', error);
        }
    }

    // 从本地存储加载聊天历史
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('boyibo_chat_history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载聊天历史失败:', error);
            this.chatHistory = [];
        }
    }

    // 清空聊天历史
    clearHistory() {
        this.chatHistory = [];
        localStorage.removeItem('boyibo_chat_history');
    }

    // 获取聊天历史
    getChatHistory() {
        return this.chatHistory;
    }

    // 检查是否正在输入
    getIsTyping() {
        return this.isTyping;
    }
}

// AI聊天UI组件
class AIChatUI {
    constructor() {
        this.chatService = new AIChatService();
        this.isOpen = false;
        this.unreadCount = 0;
        this.init();
    }

    // 初始化UI
    init() {
        this.createChatBubble();
        this.createChatWindow();
        this.bindEvents();
        this.showWelcomeMessage();
    }

    // 创建聊天气泡
    createChatBubble() {
        const bubble = document.createElement('div');
        bubble.id = 'aiChatBubble';
        bubble.className = 'ai-chat-bubble';
        bubble.innerHTML = `
            <div class="bubble-avatar">🎀</div>
            <div class="bubble-notification" id="bubbleNotification">1</div>
        `;
        document.body.appendChild(bubble);
    }

    // 创建聊天窗口
    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.id = 'aiChatWindow';
        chatWindow.className = 'ai-chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">🎀</div>
                    <div class="chat-title">
                        <h4>小搏</h4>
                        <span class="chat-status">在线</span>
                    </div>
                </div>
                <div class="chat-controls">
                    <button class="chat-minimize" id="chatMinimize">−</button>
                    <button class="chat-close" id="chatClose">×</button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <!-- 消息将在这里显示 -->
            </div>
            <div class="chat-input-area">
                <div class="typing-indicator" id="typingIndicator">
                    <span>小搏正在输入</span>
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" id="chatInput" placeholder="和小搏聊聊天吧～" maxlength="500">
                    <button id="chatSend">💕</button>
                </div>
            </div>
        `;
        document.body.appendChild(chatWindow);
    }

    // 绑定事件
    bindEvents() {
        const bubble = document.getElementById('aiChatBubble');
        const chatWindow = document.getElementById('aiChatWindow');
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');
        const chatClose = document.getElementById('chatClose');
        const chatMinimize = document.getElementById('chatMinimize');

        // 点击气泡打开聊天
        bubble.addEventListener('click', () => this.toggleChat());

        // 发送消息
        chatSend.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // 关闭和最小化
        chatClose.addEventListener('click', () => this.closeChat());
        chatMinimize.addEventListener('click', () => this.minimizeChat());

        // 点击窗口外部关闭（可选）
        document.addEventListener('click', (e) => {
            if (this.isOpen && !chatWindow.contains(e.target) && !bubble.contains(e.target)) {
                // 可以选择是否点击外部关闭，这里注释掉
                // this.closeChat();
            }
        });
    }

    // 显示欢迎消息
    showWelcomeMessage() {
        setTimeout(() => {
            const greeting = this.chatService.getRandomGreeting();
            this.addMessage('ai', greeting);
            this.showNotification();
        }, 2000);
    }

    // 切换聊天窗口
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    // 打开聊天
    openChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        const bubble = document.getElementById('aiChatBubble');
        
        chatWindow.classList.add('open');
        bubble.classList.add('hidden');
        this.isOpen = true;
        this.clearNotification();
        
        // 聚焦输入框
        setTimeout(() => {
            document.getElementById('chatInput').focus();
        }, 300);

        // 滚动到底部
        this.scrollToBottom();
    }

    // 关闭聊天
    closeChat() {
        const chatWindow = document.getElementById('aiChatWindow');
        const bubble = document.getElementById('aiChatBubble');
        
        chatWindow.classList.remove('open');
        bubble.classList.remove('hidden');
        this.isOpen = false;
    }

    // 最小化聊天
    minimizeChat() {
        this.closeChat();
    }

    // 发送消息
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // 添加用户消息
        this.addMessage('user', message);
        input.value = '';

        // 显示输入指示器
        this.showTypingIndicator();

        try {
            // 发送到AI服务
            const aiResponse = await this.chatService.sendMessage(message);
            
            // 隐藏输入指示器
            this.hideTypingIndicator();
            
            // 添加AI回复
            setTimeout(() => {
                this.addMessage('ai', aiResponse);
            }, 500); // 稍微延迟，让对话更自然

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('ai', this.chatService.getErrorResponse());
        }
    }

    // 添加消息到聊天窗口
    addMessage(sender, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const time = new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (sender === 'ai') {
            messageDiv.innerHTML = `
                <div class="message-avatar">🎀</div>
                <div class="message-content">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${time}</div>
                </div>
                <div class="message-avatar">😊</div>
            `;
        }

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // 如果窗口未打开，显示通知
        if (!this.isOpen && sender === 'ai') {
            this.showNotification();
        }
    }

    // 显示输入指示器
    showTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.add('show');
        this.scrollToBottom();
    }

    // 隐藏输入指示器
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        indicator.classList.remove('show');
    }

    // 滚动到底部
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }

    // 显示通知
    showNotification() {
        if (!this.isOpen) {
            this.unreadCount++;
            const notification = document.getElementById('bubbleNotification');
            notification.textContent = this.unreadCount;
            notification.classList.add('show');
            
            // 气泡动画
            const bubble = document.getElementById('aiChatBubble');
            bubble.classList.add('bounce');
            setTimeout(() => {
                bubble.classList.remove('bounce');
            }, 1000);
        }
    }

    // 清除通知
    clearNotification() {
        this.unreadCount = 0;
        const notification = document.getElementById('bubbleNotification');
        notification.classList.remove('show');
    }
}

// 导出供main.js使用
window.AIChatUI = AIChatUI;