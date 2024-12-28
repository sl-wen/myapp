// 任务基类
class Task {
    constructor(id, name, description, reward) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.reward = reward;
        this.completed = false;
        this.progress = 0;
        this.maxProgress = 1;
    }
    
    // 更新任务进度
    updateProgress(amount = 1) {
        if (this.completed) return false;
        this.progress = Math.min(this.maxProgress, this.progress + amount);
        if (this.progress >= this.maxProgress) {
            this.completed = true;
            return true;
        }
        return false;
    }
    
    // 领取奖励
    claim(scene) {
        if (!this.completed || this.claimed) return false;
        
        // 发放奖励
        if (this.reward.coins) {
            scene.coins += this.reward.coins;
        }
        if (this.reward.exp) {
            scene.cat.gainExp(this.reward.exp);
        }
        if (this.reward.items) {
            this.reward.items.forEach(itemData => {
                scene.inventory.addItem(itemData.item, itemData.quantity);
            });
        }
        
        this.claimed = true;
        return true;
    }
    
    // 重置任务
    reset() {
        this.completed = false;
        this.claimed = false;
        this.progress = 0;
    }
}

// 每日任务
class DailyTask extends Task {
    constructor(id, name, description, reward) {
        super(id, name, description, reward);
        this.type = 'daily';
        this.lastResetTime = null;
    }
    
    // 检查是否需要重置
    checkReset() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        if (!this.lastResetTime || this.lastResetTime < now.getTime()) {
            this.reset();
            this.lastResetTime = now.getTime();
        }
    }
}

// 成就任务
class AchievementTask extends Task {
    constructor(id, name, description, reward, maxProgress) {
        super(id, name, description, reward);
        this.type = 'achievement';
        this.maxProgress = maxProgress || 1;
    }
}

// 主线任务
class MainTask extends Task {
    constructor(id, name, description, reward, requiredTasks = []) {
        super(id, name, description, reward);
        this.type = 'main';
        this.requiredTasks = requiredTasks;  // 前置任务ID列表
    }
    
    // 检查是否可以开始
    canStart(completedTasks) {
        return this.requiredTasks.every(taskId => completedTasks.has(taskId));
    }
}

// 预定义任务列表
const TASKS = {
    // 每日任务
    dailyPet: new DailyTask(
        'daily_pet',
        '抚摸猫咪',
        '抚摸猫咪10次',
        { coins: 100, exp: 20 }
    ),
    dailyFeed: new DailyTask(
        'daily_feed',
        '喂养猫咪',
        '喂养猫咪3次',
        { coins: 150, exp: 30 }
    ),
    dailyPlay: new DailyTask(
        'daily_play',
        '玩耍时光',
        '使用玩具与猫咪玩耍5次',
        { coins: 200, exp: 40 }
    ),
    
    // 成就任务
    petMaster: new AchievementTask(
        'pet_master',
        '撸猫达人',
        '累计抚摸猫咪1000次',
        { coins: 1000, exp: 100 },
        1000
    ),
    feedMaster: new AchievementTask(
        'feed_master',
        '喂养专家',
        '累计喂养猫咪500次',
        { coins: 1500, exp: 150 },
        500
    ),
    richCat: new AchievementTask(
        'rich_cat',
        '富贵猫生',
        '累计获得10000金币',
        { coins: 2000, exp: 200 },
        10000
    ),
    
    // 主线任务
    welcome: new MainTask(
        'welcome',
        '欢迎来到猫咪世界',
        '完成新手教程',
        { coins: 500, exp: 50 }
    ),
    firstFeed: new MainTask(
        'first_feed',
        '第一次喂养',
        '购买猫粮并喂养猫咪',
        { coins: 200, exp: 30 },
        ['welcome']
    ),
    firstToy: new MainTask(
        'first_toy',
        '玩具时光',
        '购买玩具并与猫咪玩耍',
        { coins: 300, exp: 40 },
        ['first_feed']
    )
};

module.exports = {
    Task,
    DailyTask,
    AchievementTask,
    MainTask,
    TASKS
}; 