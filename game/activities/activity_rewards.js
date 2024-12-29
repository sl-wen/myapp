// 活动奖励系统
export class ActivityRewards {
    constructor(scene) {
        this.scene = scene;
        this.rewards = {
            // 通关奖励
            completion: {
                coins: 500,
                items: [
                    { id: 'premium_cat_food', quantity: 2 },
                    { id: 'tuna', quantity: 1 }
                ]
            },
            // 每日首次游戏奖励
            dailyPlay: {
                coins: 100,
                items: [
                    { id: 'fish', quantity: 3 }
                ]
            }
        };
        
        this.lastPlayDate = null;
    }

    // 发放通关奖励
    giveCompletionReward() {
        const reward = this.rewards.completion;
        
        // 增加金币
        this.scene.coins += reward.coins;
        
        // 添加道具
        reward.items.forEach(item => {
            this.scene.inventory.addItem(item.id, item.quantity);
        });
        
        // 显示奖励提示
        wx.showToast({
            title: `获得${reward.coins}金币和奖励道具！`,
            icon: 'success',
            duration: 2000
        });
        
        // 保存游戏数据
        this.scene.saveUserData();
    }

    // 检查并发放每日首次游戏奖励
    checkDailyReward() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (!this.lastPlayDate || this.lastPlayDate < today.getTime()) {
            const reward = this.rewards.dailyPlay;
            
            // 增加金币
            this.scene.coins += reward.coins;
            
            // 添加道具
            reward.items.forEach(item => {
                this.scene.inventory.addItem(item.id, item.quantity);
            });
            
            // 更新最后游戏日期
            this.lastPlayDate = today.getTime();
            
            // 显示奖励提示
            wx.showToast({
                title: `获得每日游戏奖励！`,
                icon: 'success',
                duration: 2000
            });
            
            // 保存游戏数据
            this.scene.saveUserData();
            return true;
        }
        return false;
    }

    // 转换为JSON用于保存
    toJSON() {
        return {
            lastPlayDate: this.lastPlayDate
        };
    }

    // 从JSON恢复数据
    fromJSON(data) {
        if (data) {
            this.lastPlayDate = data.lastPlayDate || null;
        }
    }
} 