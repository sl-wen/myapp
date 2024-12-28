import { Cat } from '../game/sprites/cat'

export class MainScene {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        
        // 初始化数据
        this.coins = 0;     // 金币
        this.catFood = 0;   // 猫粮数量
        this.isLoading = true;  // 加载状态
        this.loadingProgress = 0;  // 加载进度
        this.loadingDots = '';  // 加载动画点
        this.loadingFrame = 0;  // 加载动画帧
        
        // 初始化按钮
        const buttonSize = Math.min(this.canvas.width, this.canvas.height) * 0.15;
        const margin = buttonSize * 0.2;
        this.buttons = {
            shop: {
                x: margin,
                y: this.canvas.height - buttonSize - margin,
                width: buttonSize,
                height: buttonSize,
                text: '商城',
                icon: '🏪'
            },
            feed: {
                x: buttonSize + margin * 2,
                y: this.canvas.height - buttonSize - margin,
                width: buttonSize,
                height: buttonSize,
                text: '喂食',
                icon: '🍖'
            }
        };
        
        console.log('主场景创建成功');
    }
    
    async init() {
        console.log('初始化主场景...');
        try {
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
    
    initTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => {
            try {
                const touch = e.touches[0];
                const touchX = touch.clientX;
                const touchY = touch.clientY;
                
                // 检查按钮点击
                for (const [key, button] of Object.entries(this.buttons)) {
                    if (this.checkButtonTouched(touchX, touchY, button)) {
                        this.handleButtonClick(key);
                        return;
                    }
                }
                
                // 检查是否点击到猫咪
                if (this.cat && this.cat.checkTouched(touchX, touchY)) {
                    // 随机奖励金币
                    const coins = Math.floor(Math.random() * 5) + 1;
                    this.addCoins(coins);
                    this.cat.pet();
                }
            } catch (error) {
                console.error('触摸事件处理失败:', error);
            }
        });
    }
    
    checkButtonTouched(x, y, button) {
        return x >= button.x && x <= button.x + button.width &&
               y >= button.y && y <= button.y + button.height;
    }
    
    handleButtonClick(buttonKey) {
        switch (buttonKey) {
            case 'shop':
                this.openShop();
                break;
            case 'feed':
                this.feedCat();
                break;
        }
    }
    
    openShop() {
        console.log('打开商城');
        
        wx.showModal({
            title: '商城',
            content: `当前金币: ${this.coins}\n当前猫粮: ${this.catFood}\n\n购买猫粮需要100金币`,
            confirmText: '购买',
            cancelText: '关闭',
            success: (res) => {
                if (res.confirm) {
                    if (this.coins >= 100) {
                        this.coins -= 100;
                        this.catFood++;
                        wx.showToast({
                            title: '购买成功',
                            icon: 'success',
                            duration: 2000
                        });
                    } else {
                        wx.showToast({
                            title: '金币不足',
                            icon: 'error',
                            duration: 2000
                        });
                    }
                }
            }
        });
    }
    
    feedCat() {
        if (this.catFood > 0) {
            this.catFood--;
            this.cat.energy = Math.min(100, this.cat.energy + 20);
            this.cat.status = 'eating';
            this.cat.showStatus = true;
            this.cat.statusShowTime = 120;
            wx.showToast({
                title: '喂食成功',
                icon: 'success',
                position: 'bottom'
            });
        } else {
            wx.showToast({
                title: '猫粮不足',
                icon: 'error',
                position: 'bottom'
            });
        }
    }
    
    update() {
        try {
            if (this.isLoading) {
                // 更新加载动画
                this.loadingFrame++;
                if (this.loadingFrame % 15 === 0) {
                    this.loadingDots = '.'.repeat((this.loadingFrame / 15) % 4);
                }
            } else if (this.cat) {
                this.cat.update();
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
            } else {
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
                
                // 绘制UI
                this.renderUI();
            }
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
    
    renderUI() {
        // 绘制状态面板
        this.renderStatusPanel();
        
        // 绘制按钮
        this.renderButtons();
    }
    
    renderStatusPanel() {
        // 绘制面板背景
        const panelWidth = 120;
        const panelHeight = 100;
        const x = 20;  // 改为左侧
        const y = 20;
        const radius = 10;
        
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
        
        // 绘制金币
        this.ctx.font = '22px Arial';
        this.ctx.fillStyle = '#8B7355';  // 暖色调
        this.ctx.textAlign = 'left';
        this.ctx.fillText('💰', x + 15, y + 35);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#5C4033';  // 深棕色
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.coins.toString(), x + panelWidth - 15, y + 35);
        
        // 绘制猫粮
        this.ctx.font = '22px Arial';
        this.ctx.fillStyle = '#8B7355';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🍖', x + 15, y + 75);
        
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#5C4033';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.catFood.toString(), x + panelWidth - 15, y + 75);
    }
    
    renderButtons() {
        for (const button of Object.values(this.buttons)) {
            // 绘制按钮背景（浅绿色圆形）
            this.ctx.fillStyle = 'rgba(200, 230, 200, 0.85)';
            this.ctx.beginPath();
            this.ctx.arc(
                button.x + button.width/2,
                button.y + button.height/2,
                button.width/2,
                0, Math.PI * 2
            );
            this.ctx.fill();
            
            // 绘制按钮边框
            this.ctx.strokeStyle = 'rgba(150, 200, 150, 0.9)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // 绘制按钮图标
            this.ctx.font = `${button.width * 0.4}px Arial`;
            this.ctx.fillStyle = '#5C4033';  // 深棕色
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                button.icon,
                button.x + button.width/2,
                button.y + button.height/2
            );
            
            // 绘制按钮文字
            this.ctx.font = `${button.width * 0.2}px Arial`;
            this.ctx.fillStyle = '#5C4033';
            this.ctx.fillText(
                button.text,
                button.x + button.width/2,
                button.y + button.height + button.width * 0.15
            );
        }
    }
    
    addCoins(amount) {
        this.coins += amount;
        console.log('获得金币:', amount, '当前金币:', this.coins);
    }
} 