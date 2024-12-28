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
        this.tasks = new Map();
        this.lastDailyReset = null;
        this.lastWeeklyReset = null;
        this.initializeTasks();
    }

    // 初始化任务列表
    initializeTasks() {
        // 添加每日任务
        this.addTask(new Task(
            'daily_signin',
            '每日签到',
            '完成每日签到',
            TaskType.DAILY,
            1,
            { coins: 100 }
        ));

        this.addTask(new Task(
            'daily_feed',
            '投喂猫咪',
            '给猫咪喂食3次',
            TaskType.DAILY,
            3,
            { coins: 50 }
        ));

        this.addTask(new Task(
            'daily_pet',
            '抚摸猫咪',
            '抚摸猫咪10次',
            TaskType.DAILY,
            10,
            { coins: 50 }
        ));

        // 添加每周任务
        this.addTask(new Task(
            'weekly_signin',
            '连续签到',
            '连续签到7天',
            TaskType.WEEKLY,
            7,
            { coins: 500 }
        ));

        // 添加主线任务
        this.addTask(new Task(
            'main_level',
            '猫咪升级',
            '将猫咪升到5级',
            TaskType.MAIN,
            5,
            { coins: 1000 }
        ));
    }

    // 添加任务
    addTask(task) {
        this.tasks.set(task.id, task);
    }

    // 获取任务
    getTask(taskId) {
        return this.tasks.get(taskId);
    }

    // 获取所有任务
    getAllTasks() {
        return Array.from(this.tasks.values());
    }

    // 获取可领取的任务
    getClaimableTasks() {
        return this.getAllTasks().filter(task => task.completed && !task.claimed);
    }

    // 更新任务进度
    updateTaskProgress(taskId, amount = 1) {
        const task = this.getTask(taskId);
        if (task && !task.completed) {
            const completed = task.updateProgress(amount);
            if (completed) {
                wx.showToast({
                    title: `任务"${task.name}"已完成`,
                    icon: 'success'
                });
            }
            return completed;
        }
        return false;
    }

    // 领取任务奖励
    claimReward(taskId) {
        const task = this.getTask(taskId);
        if (task) {
            const reward = task.claim();
            if (reward) {
                if (reward.coins) {
                    this.scene.addCoins(reward.coins);
                }
                wx.showToast({
                    title: `获得${reward.coins}金币`,
                    icon: 'success'
                });
                return true;
            }
        }
        return false;
    }

    // 重置每日任务
    resetDailyTasks() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        
        if (this.lastDailyReset !== today) {
            this.getAllTasks().forEach(task => {
                if (task.type === TaskType.DAILY) {
                    task.progress = 0;
                    task.completed = false;
                    task.claimed = false;
                }
            });
            this.lastDailyReset = today;
        }
    }

    // 重置每周任务
    resetWeeklyTasks() {
        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();
        
        if (this.lastWeeklyReset !== weekStart) {
            this.getAllTasks().forEach(task => {
                if (task.type === TaskType.WEEKLY) {
                    task.progress = 0;
                    task.completed = false;
                    task.claimed = false;
                }
            });
            this.lastWeeklyReset = weekStart;
        }
    }

    // 转换为JSON
    toJSON() {
        return {
            tasks: Array.from(this.tasks.entries()).map(([id, task]) => task.toJSON()),
            lastDailyReset: this.lastDailyReset,
            lastWeeklyReset: this.lastWeeklyReset
        };
    }

    // 从JSON恢复
    fromJSON(json) {
        this.tasks.clear();
        json.tasks.forEach(taskData => {
            const task = Task.fromJSON(taskData);
            this.tasks.set(task.id, task);
        });
        this.lastDailyReset = json.lastDailyReset;
        this.lastWeeklyReset = json.lastWeeklyReset;
    }
} 