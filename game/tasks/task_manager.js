// 任务类型枚举
export const TaskType = {
    DAILY: 'daily',    // 每日任务
    WEEKLY: 'weekly',  // 每周任务
    MAIN: 'main'       // 主线任务
};

// 任务类
export class Task {
    constructor(id, name, description, type, maxProgress, reward) {
        this.id = id;                   // 任务ID
        this.name = name;               // 任务名称
        this.description = description; // 任务描述
        this.type = type;               // 任务类型
        this.maxProgress = maxProgress; // 完成所需进度
        this.progress = 0;              // 当前进度
        this.completed = false;         // 是否完成
        this.claimed = false;           // 是否已领取奖励
        this.reward = reward;           // 奖励内容
        this.createTime = Date.now();   // 创建时间
    }

    // 更新任务进度
    updateProgress(amount) {
        this.progress = Math.min(this.progress + amount, this.maxProgress);
        if (this.progress >= this.maxProgress) {
            this.completed = true;
        }
        return this.completed;
    }

    // 领取奖励
    claim() {
        if (this.completed && !this.claimed) {
            this.claimed = true;
            return this.reward;
        }
        return null;
    }

    // 转换为JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            maxProgress: this.maxProgress,
            progress: this.progress,
            completed: this.completed,
            claimed: this.claimed,
            reward: this.reward,
            createTime: this.createTime
        };
    }

    // 从JSON恢复
    static fromJSON(json) {
        const task = new Task(
            json.id,
            json.name,
            json.description,
            json.type,
            json.maxProgress,
            json.reward
        );
        task.progress = json.progress;
        task.completed = json.completed;
        task.claimed = json.claimed;
        task.createTime = json.createTime;
        return task;
    }
}

// 任务管理器类
export class TaskManager {
    constructor(scene) {
        this.scene = scene;
        this.tasks = this.initTasks();
        this.lastDailyReset = null;
    }

    initTasks() {
        return {
            daily_feeding: {
                id: 'daily_feeding',
                name: '每日喂食',
                description: '给猫咪喂食3次',
                type: 'daily',
                progress: 0,
                maxProgress: 3,
                completed: false,
                claimed: false,
                rewards: {
                    coins: 100,
                    items: [
                        { id: 'premium_cat_food', name: '高级猫粮', quantity: 1 }
                    ]
                }
            },
            daily_petting: {
                id: 'daily_petting',
                name: '每日抚摸',
                description: '抚摸猫咪10次',
                type: 'daily',
                progress: 0,
                maxProgress: 10,
                completed: false,
                claimed: false,
                rewards: {
                    coins: 50,
                    items: [
                        { id: 'fish', name: '小鱼干', quantity: 2 }
                    ]
                }
            },
            daily_training: {
                id: 'daily_training',
                name: '每日训练',
                description: '完成5次技能训练',
                type: 'daily',
                progress: 0,
                maxProgress: 5,
                completed: false,
                claimed: false,
                rewards: {
                    coins: 150,
                    items: [
                        { id: 'tuna', name: '金枪鱼', quantity: 1 }
                    ]
                }
            }
        };
    }

    updateTask(taskId, progress = 1) {
        const task = this.tasks[taskId];
        if (!task || task.completed || task.claimed) return false;

        task.progress = Math.min(task.progress + progress, task.maxProgress);
        
        // 检查是否完成
        if (task.progress >= task.maxProgress && !task.completed) {
            task.completed = true;
            // 显示完成提示
            wx.showToast({
                title: '任务完成！',
                icon: 'success',
                duration: 2000
            });
            return true;
        }
        
        return false;
    }

    claimReward(taskId) {
        const task = this.tasks[taskId];
        if (!task || !task.completed || task.claimed) return null;

        // 标记为已领取
        task.claimed = true;
        
        // 返回奖励内容
        return task.rewards;
    }

    getAllTasks() {
        return Object.values(this.tasks);
    }

    getClaimableTasks() {
        return Object.values(this.tasks).filter(task => 
            task.completed && !task.claimed
        );
    }

    resetDailyTasks() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        if (!this.lastDailyReset || this.lastDailyReset < now.getTime()) {
            Object.values(this.tasks).forEach(task => {
                if (task.type === 'daily') {
                    task.progress = 0;
                    task.completed = false;
                    task.claimed = false;
                }
            });
            this.lastDailyReset = now.getTime();
        }
    }

    toJSON() {
        return {
            tasks: this.tasks,
            lastDailyReset: this.lastDailyReset
        };
    }

    fromJSON(data) {
        if (data) {
            this.tasks = data.tasks || this.initTasks();
            this.lastDailyReset = data.lastDailyReset || null;
        }
    }
} 