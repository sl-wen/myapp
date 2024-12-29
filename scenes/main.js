import { Cat } from '../game/sprites/cat'
import { ITEMS, ItemType } from '../game/items/items';
import { Inventory } from '../game/inventory';
import { TaskManager } from '../game/tasks/task_manager';

export class MainScene {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // 用户数据
        this.userData = null;      // 用户数据
        this.isLoggedIn = false;   // 登录状态
        
        // 初始化数据
        this.coins = 0;     // 金币
        this.catFood = 0;   // 猫粮数量
        this.isLoading = true;  // 加载状态
        this.loadingProgress = 0;  // 加载进度
        this.loadingDots = '';  // 加载动画点
        this.loadingFrame = 0;  // 加载动画帧
        
        // 添加金币累计相关属性
        this.pendingCoins = 0;    // 待领取的金币数
        this.lastCoinTime = Date.now();  // 上次累计金币的时间
        
        // 添加签到相关属性
        this.signInDays = 0;      // 连续签到天数
        this.lastSignInDate = null;  // 上次签到日期（UTC时
        this.hasSignedToday = false; // 今日是否已签到
        
        // 初始化按钮
        const buttonSize = Math.min(this.canvas.width, this.canvas.height) * 0.12;
        const margin = buttonSize * 0.2;
        const bottomY = this.canvas.height - buttonSize * 2;  // 将按钮位置往上移动一个按钮高度
        const totalButtons = 5; // 总按钮数（减少一个）
        const totalWidth = buttonSize * totalButtons + margin * (totalButtons - 1);
        const startX = (this.canvas.width - totalWidth) / 2;
        
        this.buttons = {
            signIn: {
                x: startX,
                y: bottomY,
                width: buttonSize,
                height: buttonSize,
                text: '签到',
                icon: '📅'
            },
            collect: {
                x: startX + buttonSize + margin,
                y: bottomY,
                width: buttonSize,
                height: buttonSize,
                text: '领取',
                icon: '💰'
            },
            shop: {
                x: startX + (buttonSize + margin) * 2,
                y: bottomY,
                width: buttonSize,
                height: buttonSize,
                text: '小卖部',
                icon: '🏪'
            },
            bag: {
                x: startX + (buttonSize + margin) * 3,
                y: bottomY,
                width: buttonSize,
                height: buttonSize,
                text: '背包',
                icon: '🎒'
            },
            activity: {
                x: startX + (buttonSize + margin) * 4,
                y: bottomY,
                width: buttonSize,
                height: buttonSize,
                text: '活动',
                icon: '🎮'
            }
        };
        
        // 添加背包系统
        this.inventory = new Inventory();
        
        // 添加商店数据
        this.shopData = {
            isOpen: false,
            currentTab: 'food',  // 当前选中的商品类型
            tabs: ['food', 'toy', 'decoration', 'special']
        };
        
        // 添加任务管理器
        this.taskManager = new TaskManager(this);
        
        console.log('主场景创建成功');
    }
    
    async init() {
        console.log('初始化主场景...');
        try {
            // 设置为已登录态
            this.isLoggedIn = true;
            
            // 使用默认数据，增加初始金币
            this.coins = 1000;  // 修改初始金币为1000
            this.signInDays = 0;
            this.lastSignInDate = null;
            this.hasSignedToday = false;
            this.lastCoinTime = Date.now();
            this.pendingCoins = 0;
            
            // 模拟加载过程
            this.loadingProgress = 0;
            while (this.loadingProgress < 100) {
                await new Promise(resolve => setTimeout(resolve, 50));
                this.loadingProgress += Math.random() * 15;
                if (this.loadingProgress > 100) this.loadingProgress = 100;
            }
            
            // 检查必要资源
            if (!this.game.resources.cat) {
                console.error('猫咪图片资源未加载');
                throw new Error('猫咪图片资源未加载');
            }
            
            // 创建猫咪
            this.cat = new Cat(this, this.canvas.width/2, this.canvas.height/2);
            console.log('猫咪创建成功，位置:', {
                x: this.canvas.width/2,
                y: this.canvas.height/2
            });
            
            // 初始化触摸事件
            this.initTouchEvents();
            console.log('触摸事件初始化完成');
            
            // 完成加载
            this.isLoading = false;
            console.log('主场景初始化完成');
        } catch (error) {
            console.error('主场景初始化失败:', error);
            throw error;
        }
    }
    
    // 注释掉登录相关方法
    /*
    async login() {
        // ... 登录相关代码 ...
    }

    async getPhoneNumber() {
        // ... 获取手机号相关代码 ...
    }

    async verifyCode(phone) {
        // ... 验证码相关代码 ...
    }
    */
    
    async loadUserData() {
        // 使用默认数据
        const defaultData = {
            coins: 100,
            catFood: 5,
            signInDays: 0,
            lastSignInDate: null,
            hasSignedToday: false,
            lastCoinTime: Date.now(),
            pendingCoins: 0
        };
        
        // 使用默认数据
        this.coins = defaultData.coins;
        this.catFood = defaultData.catFood;
        this.signInDays = defaultData.signInDays;
        this.lastSignInDate = defaultData.lastSignInDate;
        this.hasSignedToday = defaultData.hasSignedToday;
        this.lastCoinTime = defaultData.lastCoinTime;
        this.pendingCoins = defaultData.pendingCoins;
        
        console.log('加载默认数据成功');
    }
    
    async saveUserData() {
        // 仅在本地保存数据
        const gameData = {
            coins: this.coins,
            catFood: this.catFood,
            signInDays: this.signInDays,
            lastSignInDate: this.lastSignInDate,
            hasSignedToday: this.hasSignedToday,
            lastCoinTime: this.lastCoinTime,
            pendingCoins: this.pendingCoins,
            inventory: this.inventory.toJSON(),
            tasks: this.taskManager.toJSON(),
            lastSaveTime: Date.now()
        };
        
        try {
            wx.setStorageSync('gameData_local', gameData);
            console.log('保存游戏数据成功');
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    }
    
    async callServerAPI(endpoint, data) {
        try {
            console.log(`[开发模式] 使用本地模拟数据: ${endpoint}`);
            
            // 直接返回模拟数据，不进行网络请求
            if (endpoint === 'sendVerifyCode') {
                return {
                    success: true,
                    message: '验证码发送成功',
                    code: '123456'  // 开发测试用验证码
                };
            }
            
            if (endpoint === 'login') {
                return {
                    success: true,
                    token: 'dev_token_' + Date.now(),
                    userId: 'dev_user_' + data.phone,
                    message: '登录成功'
                };
            }
            
            if (endpoint === 'getUserData') {
                // 尝试从本地存储获取数据
                const localData = wx.getStorageSync('gameData_dev');
                if (localData) {
                    return {
                        success: true,
                        data: localData
                    };
                }
                
                // 如果没有本地数据，回初始数据
                return {
                    success: true,
                    data: {
                        coins: 100,        // 初始金币
                        catFood: 5,        // 初始猫粮
                        signInDays: 0,
                        lastSignInDate: null,
                        hasSignedToday: false,
                        lastCoinTime: Date.now(),
                        pendingCoins: 0
                    }
                };
            }
            
            if (endpoint === 'saveUserData') {
                // 保存到本地存储
                wx.setStorageSync('gameData_dev', data.gameData);
                return {
                    success: true,
                    message: '保存成功'
                };
            }
            
            return {
                success: false,
                message: '未知的接口'
            };
            
        } catch (error) {
            console.error(`[开发模式] 操作失败 [${endpoint}]:`, error);
            // 返回安全的错误响应
            return {
                success: false,
                message: error.message || '操作失败'
            };
        }
    }
    
    // 定期同步数据到服务器
    startAutoSync() {
        // 移除自动同步
        console.log('数据同步已禁用，仅在用户操作后保存');
    }
    
    stopAutoSync() {
        // 空方法，保持接口兼容
    }
    
    initTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => {
            try {
                const touch = e.touches[0];
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                
                // 检查是否点击了领取金币按钮
                if (this.pendingCoins > 0 && this.collectButtonArea) {
                    if (touchX >= this.collectButtonArea.x && 
                        touchX <= this.collectButtonArea.x + this.collectButtonArea.width &&
                        touchY >= this.collectButtonArea.y && 
                        touchY <= this.collectButtonArea.y + this.collectButtonArea.height) {
                        // 领取金币
                        this.coins += this.pendingCoins;
                        this.pendingCoins = 0;
                        return;
                    }
                }
                
                // 检查是否点击了猫咪
                if (this.cat && this.cat.checkTouched(touchX, touchY)) {
                    // 开始拖拽
                    this.cat.startDragging(touchX, touchY);
                    return;
                }
                
                // 检查按钮点击
                for (const [key, button] of Object.entries(this.buttons)) {
                    if (this.checkButtonTouched(touchX, touchY, button)) {
                        this.handleButtonClick(key);
                        return;
                    }
                }
            } catch (error) {
                console.error('触摸事件处理失败:', error);
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            try {
                if (this.cat && this.cat.isDragging) {
                    const touch = e.touches[0];
                    this.cat.updateDragging(touch.clientX, touch.clientY);
                    e.preventDefault(); // 防止页面滚动
                }
            } catch (error) {
                console.error('触摸移动事件处理失败:', error);
            }
        });

        this.canvas.addEventListener('touchend', () => {
            try {
                if (this.cat && this.cat.isDragging) {
                    this.cat.stopDragging();
                }
            } catch (error) {
                console.error('触摸结束事件处理失败:', error);
            }
        });

        this.canvas.addEventListener('touchcancel', () => {
            try {
                if (this.cat && this.cat.isDragging) {
                    this.cat.stopDragging();
                }
            } catch (error) {
                console.error('触摸取消事件处理失败:', error);
            }
        });
    }
    
    checkButtonTouched(x, y, button) {
        // 检查是否在圆形按钮范围内
        const centerX = button.x + button.width/2;
        const centerY = button.y + button.height/2;
        const radius = button.width/2;
        const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + 
            Math.pow(y - centerY, 2)
        );
        return distance <= radius;
    }
    
    handleButtonClick(buttonKey) {
        try {
            console.log('点击按钮:', buttonKey); // 添加调试日志
            switch (buttonKey) {
                case 'signIn':
                    this.handleSignIn();
                    break;
                case 'collect':
                    this.handleCollect();
                    break;
                case 'shop':
                    console.log('打开小卖部'); // 添加调试日志
                    this.openShop();
                    break;
                case 'bag':
                    this.openBag();
                    break;
                case 'activity':
                    this.openActivity();
                    break;
                case 'task':
                    this.openTaskPanel();
                    break;
                default:
                    console.warn('未知的按钮:', buttonKey);
            }
        } catch (error) {
            console.error('按钮点击处理失败:', error);
            wx.showToast({
                title: '操作失败',
                icon: 'none',
                duration: 2000
            });
        }
    }
    
    handleSignIn() {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        if (this.hasSignedToday) {
            wx.showToast({
                title: '今日已签到',
                icon: 'error',
                duration: 2000
            });
            return;
        }
        
        // 检查是否连续签到
        if (this.lastSignInDate) {
            const lastDate = new Date(this.lastSignInDate);
            lastDate.setUTCHours(0, 0, 0, 0);
            const timeDiff = today.getTime() - lastDate.getTime();
            const dayDiff = timeDiff / (1000 * 3600 * 24);
            
            if (dayDiff > 1) {
                // 签到中断，重置连续签到天数
                this.signInDays = 0;
            }
        }
        
        // 增加天数
        this.signInDays++;
        
        // 计算奖励金币（连续签到越多，奖励越多）
        let reward = Math.min(100, 20 + this.signInDays * 10);
        
        // 更新签到状态
        this.lastSignInDate = today.getTime();
        this.hasSignedToday = true;
        this.coins += reward;
        
        // 保存数据（只在签到成功后）
        this.saveUserData();
        
        // 显示奖励信息
        wx.showModal({
            title: '签到成功',
            content: `连续签到${this.signInDays}天\n获得${reward}金币`,
            showCancel: false
        });
    }
    
    handleCollect() {
        if (this.pendingCoins > 0) {
            const collectedAmount = this.pendingCoins; // 保存待领取的金币数
            this.coins += this.pendingCoins;
            this.pendingCoins = 0;
            
            // 保存数据（只在实际领取金币时）
            this.saveUserData();
            
            wx.showToast({
                title: `领取${collectedAmount}金币`,
                icon: 'success',
                duration: 2000
            });
        } else {
            wx.showToast({
                title: '暂无可领取金币',
                icon: 'error',
                duration: 2000
            });
        }
    }
    
    openActivity() {
        // 暂时使用提示框代替页面跳转
        wx.showModal({
            title: '小游戏',
            content: '小游戏在开发中，敬请期待！',
            showCancel: false
        });
    }
    
    openShop() {
        try {
            // 获取所有可购买的食物道具
            const items = Object.values(ITEMS).filter(item => 
                item.type === ItemType.FOOD && item.cost
            );
            
            if (items.length === 0) {
                wx.showToast({
                    title: '暂无商品',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }
            
            // 显示商品列表，使用图标显示属性
            const itemList = items.map(item => 
                `${item.name} - 💰${item.cost} 🍖${item.satietyValue} 💝${item.happinessValue} ⭐${item.expValue}`
            );
            
            // 先选择商品
            wx.showActionSheet({
                itemList: itemList,
                success: (res) => {
                    const selectedItem = items[res.tapIndex];
                    
                    // 再选择数量
                    const quantityList = ['1个', '5个', '10个', '20个', '50个', '99个'];
                    wx.showActionSheet({
                        itemList: quantityList,
                        success: (qRes) => {
                            const quantities = [1, 5, 10, 20, 50, 99];
                            const quantity = quantities[qRes.tapIndex];
                            
                            // 显示确认购买对话框
                            wx.showModal({
                                title: selectedItem.name,
                                content: [
                                    `确认购买 ${quantity} 个？`,
                                    '\r\n',
                                    `单价：${selectedItem.cost}金币`,
                                    `总价：${selectedItem.cost * quantity}金币`,
                                    '\r\n',
                                    '效果预览：\r\n',
                                    `  🍖 饱食度 +${selectedItem.satietyValue * quantity}`,
                                    `  💝 幸福度 +${selectedItem.happinessValue * quantity}`,
                                    `  ⭐ 经验 +${selectedItem.expValue * quantity}`
                                ].join('\n'),
                                showCancel: true,
                                success: res => {
                                    if (res.confirm) {
                                        this.purchaseItem(selectedItem, quantity);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.error('打开小卖部失败:', error);
            wx.showToast({
                title: '打开小卖部失败',
                icon: 'none',
                duration: 2000
            });
        }
    }
    
    purchaseItem(item, quantity = 1) {
        const totalCost = item.cost * quantity;
        
        if (!item || !item.cost) {
            wx.showToast({
                title: '商品无效',
                icon: 'error',
                duration: 2000
            });
            return;
        }
        
        if (this.coins < totalCost) {
            wx.showToast({
                title: '金币不足',
                icon: 'error',
                duration: 2000
            });
            return;
        }
        
        // 扣除金币并添加物品到背包
        this.coins -= totalCost;
        if (this.inventory.addItem(item.id, quantity)) {
            wx.showModal({
                title: '购买成功',
                content: `${item.name} x${quantity}\n` +
                        `消耗金币：${totalCost}\n` +
                        `剩余金币：${this.coins}`,
                showCancel: false
            });
            
            // 保存数据
            this.saveUserData();
        } else {
            // 如果添加物品失败，退还金币
            this.coins += totalCost;
            wx.showToast({
                title: '背包已满',
                icon: 'error',
                duration: 2000
            });
        }
    }
    
    feedCat() {
        // 获取背包中的食物道具
        const foodItems = this.inventory.getItemsByType(ItemType.FOOD);
        if (foodItems.length === 0) {
            wx.showToast({
                title: '没有食物道具',
                icon: 'none',
                duration: 2000
            });
            return;
        }
        
        // 显示食物选择界面
        const itemList = foodItems.map(item => `${item.name} (剩余${item.quantity}个)`);
        
        wx.showActionSheet({
            itemList: itemList,
            success: (res) => {
                const selectedItem = foodItems[res.tapIndex];
                if (selectedItem && selectedItem.quantity > 0) {
                    // 使用道具
                    if (this.inventory.useItem(selectedItem.id)) {
                        // 只增加饱食度
                        this.cat.satiety = Math.min(100, this.cat.satiety + selectedItem.satietyValue);
                        
                        // 更新猫咪状态
                        this.cat.status = 'eating';
                        this.cat.showStatus = true;
                        this.cat.statusShowTime = 120;
                        
                        // 保存数据（只在成功使用食物后）
                        this.saveUserData();
                        
                        // 显示提示
                        wx.showToast({
                            title: `使用了${selectedItem.name}`,
                            icon: 'success',
                            duration: 2000
                        });
                    }
                }
            }
        });
    }
    
    update() {
        try {
            // 检查是否要重置今日签到状态
            const today = new Date();
            today.setUTCHours(0, 0, 0, 0);
            if (this.lastSignInDate) {
                const lastDate = new Date(this.lastSignInDate);
                lastDate.setUTCHours(0, 0, 0, 0);
                if (today.getTime() > lastDate.getTime()) {
                    this.hasSignedToday = false;
                }
            }
            
            // 更新金币累计（每5秒加1个金币）
            const currentTime = Date.now();
            const timeDiff = currentTime - this.lastCoinTime;
            if (timeDiff >= 5000) { // 5秒检查一次
                const coinsToAdd = Math.floor(timeDiff / 5000); // 每5秒1个金币
                if (coinsToAdd > 0) {
                    this.pendingCoins += coinsToAdd;
                    this.lastCoinTime = currentTime - (timeDiff % 5000);
                }
            }
            
            if (this.isLoading) {
                // 更新加载动画
                const loadingDotCount = Math.floor((Date.now() % 2000) / 500); // 每500ms改变一次点的数量
                this.loadingDots = '.'.repeat(loadingDotCount);
            } else if (this.cat) {
                // 更新猫咪状态
                this.cat.update();
            }
            
            // 更新每日任务，但不保存数据
            this.taskManager.resetDailyTasks();
            
            // 检查是否有可领取的任务
            const claimableTasks = this.taskManager.getClaimableTasks();
            if (claimableTasks.length > 0) {
                // 显示任务提示图标
                this.hasClaimableTask = true;
            }
            
        } catch (error) {
            console.error('场景更新失败:', error);
        }
    }
    
    render() {
        try {
            // 清空画布
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            if (this.isLoading) {
                this.renderLoading();
                return;
            }
            
            // 绘制背景
            if (this.game.resources.background) {
                this.ctx.drawImage(this.game.resources.background, 0, 0, this.canvas.width, this.canvas.height);
            } else {
                // 默认背景色
                this.ctx.fillStyle = '#f0f0f0';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            }
            
            // 绘制猫咪
            if (this.cat) {
                this.cat.render(this.ctx);
            }
            
            // 绘制状态面板
            this.renderStatusPanel();
            
            // 绘制底部按钮
            this.renderButtons();
            
        } catch (error) {
            console.error('场景渲染失败:', error);
            // 显示错误信息
            this.ctx.fillStyle = '#FF0000';
            this.ctx.font = '14px Arial';
            this.ctx.fillText('渲染错误: ' + error.message, 10, 20);
        }
    }
    
    renderLoading() {
        // 设置背景色
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 如果未登录，显示登录提示
        if (!this.isLoggedIn) {
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#5C4033';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('请输入手机号登录', this.canvas.width/2, this.canvas.height/2 - 50);
            return;
        }
        
        // 绘制进度条背景
        const barWidth = this.canvas.width * 0.6;
        const barHeight = 10;
        const x = (this.canvas.width - barWidth) / 2;
        const y = this.canvas.height / 2;
        const radius = 5;
        
        // 绘制背景
        this.ctx.fillStyle = 'rgba(200, 230, 200, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + barWidth - radius, y);
        this.ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
        this.ctx.lineTo(x + barWidth, y + barHeight - radius);
        this.ctx.arcTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight, radius);
        this.ctx.lineTo(x + radius, y + barHeight);
        this.ctx.arcTo(x, y + barHeight, x, y + barHeight - radius, radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.arcTo(x, y, x + radius, y, radius);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制进度条
        const progress = Math.min(100, this.loadingProgress);
        const progressWidth = (barWidth * progress) / 100;
        
        this.ctx.fillStyle = 'rgba(150, 200, 150, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + progressWidth - radius, y);
        this.ctx.arcTo(x + progressWidth, y, x + progressWidth, y + radius, radius);
        this.ctx.lineTo(x + progressWidth, y + barHeight - radius);
        this.ctx.arcTo(x + progressWidth, y + barHeight, x + progressWidth - radius, y + barHeight, radius);
        this.ctx.lineTo(x + radius, y + barHeight);
        this.ctx.arcTo(x, y + barHeight, x, y + barHeight - radius, radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.arcTo(x, y, x + radius, y, radius);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制加载文本
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#5C4033';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`加载中${this.loadingDots}`, this.canvas.width/2, y - 20);
        this.ctx.fillText(`${Math.floor(progress)}%`, this.canvas.width/2, y + 40);
    }
    
    renderStatusPanel() {
        // 计算状态面板的位置和大小
        const buttonSize = Math.min(this.canvas.width, this.canvas.height) * 0.12;
        const margin = buttonSize * 0.2;
        const panelWidth = buttonSize * 1.5;  // 减小面板宽度，因为只显示金币
        const panelHeight = buttonSize * 0.8;  // 减小面板高度
        const x = margin;
        const y = margin * 3;  // 将面板向下移动
        const radius = 10;
        
        try {
            // 绘制面板背景（浅绿色半透明）
            this.ctx.fillStyle = 'rgba(200, 230, 200, 0.85)';
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius, y);
            this.ctx.lineTo(x + panelWidth - radius, y);
            this.ctx.arcTo(x + panelWidth, y, x + panelWidth, y + radius, radius);
            this.ctx.lineTo(x + panelWidth, y + panelHeight - radius);
            this.ctx.arcTo(x + panelWidth, y + panelHeight, x + panelWidth - radius, y + panelHeight, radius);
            this.ctx.lineTo(x + radius, y + panelHeight);
            this.ctx.arcTo(x, y + panelHeight, x, y + panelHeight - radius, radius);
            this.ctx.lineTo(x, y + radius);
            this.ctx.arcTo(x, y, x + radius, y, radius);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 绘制边框
            this.ctx.strokeStyle = 'rgba(150, 200, 150, 0.9)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // 绘制金币图标数量
            const iconSize = Math.min(panelWidth, panelHeight) * 0.4;
            this.ctx.font = `${iconSize}px Arial`;
            this.ctx.fillStyle = '#8B7355';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💰', x + margin, y + panelHeight/2);
            
            this.ctx.font = `${iconSize * 0.9}px Arial`;
            this.ctx.fillStyle = '#5C4033';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(this.coins.toString(), x + panelWidth - margin, y + panelHeight/2);
            
        } catch (error) {
            console.error('状态面板渲染失败:', error);
        }
    }
    
    renderButtons() {
        const buttons = Object.entries(this.buttons);
        if (!buttons || buttons.length === 0) {
            console.warn('没有按钮需要渲染');
            return;
        }
        
        try {
            buttons.forEach(([key, button]) => {
                if (!button || typeof button.x !== 'number' || typeof button.y !== 'number') {
                    console.warn('按钮数据无效:', key, button);
                    return;
                }
                
                const centerX = button.x + button.width/2;
                const centerY = button.y + button.height/2;
                const radius = button.width/2;
                
                // 绘制按钮背景
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                
                // 设置按钮颜色
                if ((key === 'signIn' && !this.hasSignedToday) || 
                    (key === 'collect' && this.pendingCoins > 0)) {
                    this.ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';  // 金色
                } else {
                    this.ctx.fillStyle = 'rgba(200, 230, 200, 0.85)';  // 默认绿色
                }
                this.ctx.fill();
                
                // 绘制按钮边框
                this.ctx.strokeStyle = 'rgba(150, 200, 150, 0.9)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // 绘制图标
                if (button.icon) {
                    this.ctx.font = `${button.width * 0.4}px Arial`;
                    this.ctx.fillStyle = '#5C4033';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(button.icon, centerX, centerY);
                }
                
                // 绘制文字
                if (button.text) {
                    this.ctx.font = `${button.width * 0.2}px Arial`;
                    this.ctx.fillStyle = '#5C4033';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'top';
                    
                    let text = button.text;
                    if (key === 'signIn') {
                        text = this.hasSignedToday ? '已签到' : '签到';
                    } else if (key === 'collect') {
                        text = '领取';
                    }
                    
                    this.ctx.fillText(text, centerX, button.y + button.height + 5);
                    
                    // 在领取按钮右侧显示未领取金币数
                    if (key === 'collect' && this.pendingCoins > 0) {
                        this.ctx.font = `${button.width * 0.25}px Arial`;
                        this.ctx.fillStyle = '#FF8C00';  // 暗橙色
                        this.ctx.textAlign = 'left';
                        this.ctx.fillText(`+${this.pendingCoins}`, centerX + radius + 5, centerY);
                    }
                }
            });
        } catch (error) {
            console.error('按钮渲染失败:', error);
        }
    }
    
    addCoins(amount) {
        this.coins += amount;
        console.log('获得金币:', amount, '当前金币:', this.coins);
    }
    
    openTaskPanel() {
        const tasks = this.taskManager.getAllTasks();
        const taskList = tasks.map(task => ({
            text: `${task.name} (${task.progress}/${task.maxProgress})${task.completed ? ' - 已完成' : ''}${task.claimed ? ' - 已领取' : ''}`,
            task: task
        }));
        
        wx.showActionSheet({
            itemList: taskList.map(item => item.text),
            success: (res) => {
                const selectedTask = taskList[res.tapIndex].task;
                if (selectedTask.completed && !selectedTask.claimed) {
                    this.taskManager.claimReward(selectedTask.id);
                } else {
                    wx.showModal({
                        title: selectedTask.name,
                        content: `${selectedTask.description}\n进度：${selectedTask.progress}/${selectedTask.maxProgress}`,
                        showCancel: false
                    });
                }
            }
        });
    }
    
    openBag() {
        try {
            // 获取背包中的所有物品
            const items = [];
            for (const [itemId, itemData] of Object.entries(this.inventory.items)) {
                if (itemData.quantity > 0) {
                    items.push({
                        id: itemId,
                        ...itemData
                    });
                }
            }

            if (items.length === 0) {
                wx.showToast({
                    title: '背包是空的',
                    icon: 'none',
                    duration: 2000
                });
                return;
            }

            // 显示物品列表，使用图标显示属性
            const itemList = items.map(item => 
                `${item.name} x${item.quantity} - 🍖${item.satietyValue} 💝${item.happinessValue} ⭐${item.expValue}`
            );

            wx.showActionSheet({
                itemList: itemList,
                success: (res) => {
                    const selectedItem = items[res.tapIndex];
                    
                    // 选择使用数量
                    const maxQuantity = Math.min(selectedItem.quantity, 99);
                    const quantities = [1, 5, 10, 20, 50, 99].filter(q => q <= maxQuantity);
                    const quantityList = quantities.map(q => `${q}个`);
                    
                    wx.showActionSheet({
                        itemList: quantityList,
                        success: (qRes) => {
                            const quantity = quantities[qRes.tapIndex];
                            
                            // 显示确认使用对话框
                            wx.showModal({
                                title: selectedItem.name,
                                content: `确认使用 ${quantity} 个？\n\n` +
                                        `效果预览：\n` +
                                        `🍖 饱食度 +${selectedItem.satietyValue * quantity}\n` +
                                        `💝 幸福度 +${selectedItem.happinessValue * quantity}\n` +
                                        `⭐ 经验 +${selectedItem.expValue * quantity}`,
                                cancelText: '取消',
                                confirmText: '使用',
                                success: (result) => {
                                    if (result.confirm) {
                                        this.useItem(selectedItem, quantity);
                                    }
                                }
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.error('打开背包失败:', error);
            wx.showToast({
                title: '打开背包失败',
                icon: 'none',
                duration: 2000
            });
        }
    }

    useItem(item, quantity = 1) {
        if (!item || item.quantity < quantity) {
            wx.showToast({
                title: '物品数量不足',
                icon: 'error',
                duration: 2000
            });
            return;
        }

        // 使用物品并应用效果
        if (this.inventory.removeItem(item.id, quantity)) {
            // 增加饱食度
            const oldSatiety = this.cat.satiety;
            if (item.satietyValue) {
                this.cat.satiety = Math.min(100, this.cat.satiety + item.satietyValue * quantity);
            }
            
            // 增加幸福度
            const oldHappiness = this.cat.happiness;
            if (item.happinessValue) {
                this.cat.happiness = Math.min(100, this.cat.happiness + item.happinessValue * quantity);
            }
            
            // 增加经验
            const oldExp = this.cat.exp;
            const oldLevel = this.cat.level;
            if (item.expValue) {
                this.cat.exp += item.expValue * quantity;
                // 检查是否升级
                while (this.cat.exp >= this.cat.maxExp) {
                    this.cat.exp -= this.cat.maxExp;
                    this.cat.level++;
                    this.cat.maxExp = Math.floor(this.cat.maxExp * 1.2); // 每级所需经验增加20%
                }
            }
            
            // 更新猫咪状态
            this.cat.showStatus = true;
            this.cat.statusShowTime = 120;
            
            // 保存数据
            this.saveUserData();
            
            // 显示使用效果
            let resultText = `使用：${item.name} x${quantity}\n\n`;
            if (item.satietyValue) {
                resultText += `饱食度：${Math.floor(oldSatiety)} → ${Math.floor(this.cat.satiety)}\n`;
            }
            if (item.happinessValue) {
                resultText += `幸福度：${Math.floor(oldHappiness)} → ${Math.floor(this.cat.happiness)}\n`;
            }
            if (item.expValue) {
                if (this.cat.level > oldLevel) {
                    resultText += `等级：${oldLevel} → ${this.cat.level}\n`;
                }
                resultText += `经验值：${Math.floor(oldExp)} → ${Math.floor(this.cat.exp)}/${this.cat.maxExp}`;
            }
            
            wx.showModal({
                title: '使用成功',
                content: resultText,
                showCancel: false
            });
        }
    }
} 