// R2存储初始化脚本
// 用于创建初始数据文件并上传到R2存储桶

const initialRecommendations = {
    "recommendations": [
        {
            "id": "rec_001",
            "title": "英超曼城 vs 阿森纳",
            "expert": "足球专家老王",
            "confidence": 85,
            "prediction": "曼城主场不败",
            "odds": "1.65",
            "reasoning": "曼城主场战绩出色，阿森纳客场表现不稳定",
            "timestamp": new Date().toISOString(),
            "category": "足球",
            "status": "active"
        },
        {
            "id": "rec_002", 
            "title": "NBA湖人 vs 勇士",
            "expert": "篮球分析师小李",
            "confidence": 78,
            "prediction": "大分 Over 225.5",
            "odds": "1.90",
            "reasoning": "两队进攻火力强劲，防守端都有漏洞",
            "timestamp": new Date().toISOString(),
            "category": "篮球",
            "status": "active"
        },
        {
            "id": "rec_003",
            "title": "欧冠巴萨 vs 拜仁",
            "expert": "欧洲足球专家",
            "confidence": 72,
            "prediction": "拜仁客场不败",
            "odds": "2.10", 
            "reasoning": "拜仁整体实力更强，巴萨主场优势有限",
            "timestamp": new Date().toISOString(),
            "category": "足球",
            "status": "active"
        }
    ]
};

const initialPosts = {
    "posts": [
        {
            "id": "post_001",
            "author": "搏彩老司机",
            "content": "昨天跟着专家推荐，成功上岸！感谢平台的专业分析 🎉",
            "timestamp": new Date(Date.now() - 3600000).toISOString(),
            "likes": 15,
            "replies": []
        },
        {
            "id": "post_002",
            "author": "新手小白",
            "content": "请问大家都是怎么分析比赛的？有什么好的方法分享吗？",
            "timestamp": new Date(Date.now() - 7200000).toISOString(),
            "likes": 8,
            "replies": [
                {
                    "id": "reply_001",
                    "author": "经验分享者",
                    "content": "多看数据，少跟感觉，控制好资金管理最重要！",
                    "timestamp": new Date(Date.now() - 3600000).toISOString()
                }
            ]
        },
        {
            "id": "post_003",
            "author": "理性投注者",
            "content": "提醒大家：理性投注，量力而行。搏一搏可以，但不要上头！💪",
            "timestamp": new Date(Date.now() - 10800000).toISOString(),
            "likes": 23,
            "replies": []
        }
    ]
};

// 创建上传脚本
console.log('=== R2存储初始化数据 ===');
console.log('\n1. recommendations.json:');
console.log(JSON.stringify(initialRecommendations, null, 2));
console.log('\n2. community_posts.json:');
console.log(JSON.stringify(initialPosts, null, 2));

console.log('\n=== 上传说明 ===');
console.log('请将以上两个JSON文件手动上传到你的R2存储桶：');
console.log('1. 登录Cloudflare控制台');
console.log('2. 进入R2存储桶: boyibo-storage');
console.log('3. 创建文件 recommendations.json，复制上面的内容');
console.log('4. 创建文件 community_posts.json，复制上面的内容');
console.log('5. 刷新页面测试');