export class Cat {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // 成长系统
        this.level = 1;           // 当前等级
        this.exp = 0;             // 当前经验值
        this.maxExp = 100;        // 升级所需经验值
        this.growth = 'kitten';   // 成长阶段: kitten(幼猫), adult(成年), elder(老年)
        this.growthTime = 0;      // 成长时间计数
        this.skills = new Set();  // 已学习的技能
        
        // 状态
        this.happiness = 100;     // 幸福度
        this.energy = 100;        // 能量
        this.status = 'idle';  // 状态：idle, sleeping, walking, dragging, eating
        
        // 移动相关
        this.targetX = x;      // 目标位置X
        this.targetY = y;      // 目标位置Y
        this.speed = 3;        // 移动速度
        this.moveTimer = 0;    // 移动计时器
        this.direction = 1;    // 朝向：1右，-1左
        this.showStatus = false; // 状态条显示标志
        this.statusShowTime = 0; // 状态条显示时间
        
        // 拖拽相关
        this.isDragging = false;   // 是否正在拖拽
        this.dragStartX = 0;       // 拖拽开始时的X坐标
        this.dragStartY = 0;       // 拖拽开始时的Y坐标
        this.dragOffsetX = 0;      // 拖拽偏移X
        this.dragOffsetY = 0;      // 拖拽偏移Y
        this.lastDragTime = 0;     // 上次拖拽时间
        this.dragSpeed = 0;        // 拖拽速度
        
        // 活动范围
        this.bounds = {
            left: 100,
            right: scene.canvas.width - 100,
            top: 100,
            bottom: scene.canvas.height - scene.canvas.height * 0.25 - 100
        };
        
        // 图像缓存
        this.processedImageLeft = null;
        this.processedImageRight = null;
        this.initImage();
        
        // 初始化触摸检测区域
        this.touchArea = {
            width: 100,
            height: 100
        };
        
        // 添加触摸事件
        this.initTouchEvents();
        
        console.log('猫咪精灵创建成功:', { x, y });
    }
    
    initTouchEvents() {
        this.scene.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            if (this.checkTouched(touchX, touchY)) {
                this.startDragging(touchX, touchY);
                this.showStatus = true;
                this.statusShowTime = 120;
            }
        });
        
        this.scene.canvas.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                const touch = e.touches[0];
                this.updateDragging(touch.clientX, touch.clientY);
            }
        });
        
        this.scene.canvas.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.stopDragging();
            }
        });
        
        this.scene.canvas.addEventListener('touchcancel', () => {
            if (this.isDragging) {
                this.stopDragging();
            }
        });
    }
    
    startDragging(x, y) {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        this.dragOffsetX = x - this.x;
        this.dragOffsetY = y - this.y;
        this.lastDragTime = Date.now();
        this.status = 'dragging';
        this.happiness = Math.min(100, this.happiness - 5); // 开始拖拽时降低幸福度
    }
    
    updateDragging(x, y) {
        const newX = x - this.dragOffsetX;
        const newY = y - this.dragOffsetY;
        
        // 计算拖拽速度
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastDragTime;
        const deltaX = newX - this.x;
        const deltaY = newY - this.y;
        this.dragSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / deltaTime;
        
        // 更新位置（限制在活动范围内）
        this.x = Math.max(this.bounds.left, Math.min(this.bounds.right, newX));
        this.y = Math.max(this.bounds.top, Math.min(this.bounds.bottom, newY));
        
        // 更新朝向
        if (deltaX !== 0) {
            this.direction = deltaX > 0 ? 1 : -1;
        }
        
        this.lastDragTime = currentTime;
        
        // 如果拖拽速度过快，降低幸福度
        if (this.dragSpeed > 0.5) {
            this.happiness = Math.max(0, this.happiness - 0.1);
        }
    }
    
    stopDragging() {
        this.isDragging = false;
        
        // 根据拖拽结束时的速度决定猫咪的反应
        if (this.dragSpeed > 0.5) {
            this.status = 'walking'; // 如果拖拽结束时速度较快，猫咪会走动
            this.happiness = Math.max(0, this.happiness - 10); // 降低更多幸福度
            // 随机选择一个远离当前位置的目标点
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            this.targetX = this.x + Math.cos(angle) * distance;
            this.targetY = this.y + Math.sin(angle) * distance;
            
            // 确保目标点在活动范围内
            this.targetX = Math.max(this.bounds.left, Math.min(this.bounds.right, this.targetX));
            this.targetY = Math.max(this.bounds.top, Math.min(this.bounds.bottom, this.targetY));
        } else {
            this.status = 'idle';
            this.happiness = Math.min(100, this.happiness + 5); // 温柔放下时增加幸福度
        }
    }
    
    findNewTarget() {
        // 在活动范围内随机选择一个目标点
        this.targetX = Math.random() * (this.bounds.right - this.bounds.left) + this.bounds.left;
        this.targetY = Math.random() * (this.bounds.bottom - this.bounds.top) + this.bounds.top;
        console.log('猫咪选择新目标点:', { x: this.targetX, y: this.targetY });
    }
    
    checkTouched(x, y) {
        const halfWidth = this.touchArea.width / 2;
        const halfHeight = this.touchArea.height / 2;
        return x >= this.x - halfWidth && x <= this.x + halfWidth &&
               y >= this.y - halfHeight && y <= this.y + halfHeight;
    }
    
    initImage() {
        if (this.scene.game.resources.cat) {
            const image = this.scene.game.resources.cat;
            
            // 创建右朝向图像
            const rightCanvas = wx.createCanvas();
            rightCanvas.width = image.width;
            rightCanvas.height = image.height;
            const rightCtx = rightCanvas.getContext('2d');
            
            // 直接绘制原始图片
            rightCtx.drawImage(image, 0, 0);
            
            // 保存右朝向图像
            this.processedImageRight = rightCanvas;
            
            // 创建左朝向图像
            const leftCanvas = wx.createCanvas();
            leftCanvas.width = image.width;
            leftCanvas.height = image.height;
            const leftCtx = leftCanvas.getContext('2d');
            
            // 翻转绘制
            leftCtx.scale(-1, 1);
            leftCtx.drawImage(rightCanvas, -rightCanvas.width, 0);
            
            // 保存左朝向图像
            this.processedImageLeft = leftCanvas;
            
            console.log('猫咪图片处理完成');
        } else {
            console.error('猫咪图片资源未加载');
        }
    }
    
    update() {
        // 更新状态显示时间
        if (this.showStatus && this.statusShowTime > 0) {
            this.statusShowTime--;
            if (this.statusShowTime <= 0) {
                this.showStatus = false;
            }
        }

        // 消耗能量并增加经验
        const energyConsumption = 0.000046;  // 每6分钟消耗1点能量
        if (this.energy > 0) {
            this.energy = Math.max(0, Math.min(100, this.energy - energyConsumption));
            // 每消耗1点能量增加2点经验
            const expGain = energyConsumption * 2;
            this.gainExp(expGain);
        }

        // 更新目标位置
        if (this.energy > 0) {
            if (!this.targetX || !this.targetY || 
                (Math.abs(this.x - this.targetX) < 1 && Math.abs(this.y - this.targetY) < 1)) {
                this.findNewTarget();
            }

            // 移动向目标位置
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 1) {
                const speed = 0.5 + (this.energy / 100) * 1.5;  // 根据能量调整速度
                this.x += (dx / distance) * speed;
                this.y += (dy / distance) * speed;
            }
        }
    }
    
    render(ctx) {
        const image = this.direction < 0 ? this.processedImageLeft : this.processedImageRight;
        if (image) {
            ctx.save();
            
            // 计算绘制位置
            let drawX = this.x;
            let drawY = this.y;
            
            // 根据状态添加效果
            switch (this.status) {
                case 'sleeping':
                    ctx.globalAlpha = 0.8;
                    ctx.translate(drawX, drawY);
                    ctx.drawImage(image, -image.width/2, -image.height/2);
                    break;
                    
                case 'dragging':
                    ctx.translate(drawX, drawY);
                    ctx.scale(0.9, 0.9);
                    ctx.drawImage(image, -image.width/2, -image.height/2);
                    break;
                    
                case 'eating':
                    ctx.translate(drawX, drawY);
                    if (this.actionFrame % 20 < 10) {
                        ctx.scale(1.1, 0.9);
                    }
                    ctx.drawImage(image, -image.width/2, -image.height/2);
                    // 添加进食效果
                    ctx.font = '20px Arial';
                    ctx.fillStyle = '#8B4513';
                    ctx.textAlign = 'center';
                    ctx.fillText('🍖', 30, -10);
                    break;
                    
                default:
                    ctx.translate(drawX, drawY);
                    ctx.drawImage(image, -image.width/2, -image.height/2);
                    break;
            }
            
            ctx.restore();
            
            // 绘制状态图标
            if (this.status === 'sleeping') {
                ctx.font = '20px Arial';
                ctx.fillStyle = '#666666';
                ctx.textAlign = 'center';
                ctx.fillText('💤', this.x + 30, this.y - 20);
            }
        }
        
        // 只在显示状态为true时绘制状态条
        if (this.showStatus) {
            this.renderStatus(ctx);
        }
        
        // 在猫咪上方显示等级
        if (this.showStatus) {
            ctx.font = '14px Arial';
            ctx.fillStyle = '#5C4033';
            ctx.textAlign = 'center';
            ctx.fillText(`Lv.${this.level}`, this.x, this.y - 80);
            
            // 显示经验值进度条
            const expBarWidth = 60;
            const expBarHeight = 4;
            const expBarX = this.x - expBarWidth/2;
            const expBarY = this.y - 75;
            
            // 经验条背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(expBarX, expBarY, expBarWidth, expBarHeight);
            
            // 经验条进度
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(expBarX, expBarY, expBarWidth * (this.exp / this.maxExp), expBarHeight);
        }
    }
    
    renderStatus(ctx) {
        if (!this.showStatus) return;
        
        const barWidth = 100;
        const barHeight = 15;
        const margin = 5;
        const cornerRadius = 7;
        
        // 计算状态条位置
        const energyY = this.y - 60;
        const happinessY = this.y - 40;
        const x = this.x - barWidth/2;
        
        // 绘制能量条
        this.renderStatusBar(ctx, x, energyY, barWidth, barHeight, cornerRadius, 
            this.energy, 100, '#FFE4B5', '#FFA500', '能量');
        
        // 绘制幸福度条
        this.renderStatusBar(ctx, x, happinessY, barWidth, barHeight, cornerRadius, 
            this.happiness, 100, '#FFB6C1', '#FF69B4', '幸福');
    }
    
    renderStatusBar(ctx, x, y, width, height, radius, value, maxValue, bgColor, fillColor, label) {
        // 绘制背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        
        // 绘制圆角矩形背景
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 计算填充宽度
        const fillWidth = (width - 4) * (value / maxValue);
        
        // 绘制填充部分
        if (fillWidth > 0) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            const innerRadius = Math.max(1, radius - 2);
            ctx.moveTo(x + 2 + innerRadius, y + 2);
            if (fillWidth >= width - 4) {
                // 如果填充满了，使用完整的圆角
                ctx.lineTo(x + fillWidth + 2 - innerRadius, y + 2);
                ctx.arcTo(x + fillWidth + 2, y + 2, x + fillWidth + 2, y + 2 + innerRadius, innerRadius);
                ctx.lineTo(x + fillWidth + 2, y + height - 2 - innerRadius);
                ctx.arcTo(x + fillWidth + 2, y + height - 2, x + fillWidth + 2 - innerRadius, y + height - 2, innerRadius);
            } else {
                // 如果没填充满，右边直角
                ctx.lineTo(x + fillWidth + 2, y + 2);
                ctx.lineTo(x + fillWidth + 2, y + height - 2);
            }
            ctx.lineTo(x + 2 + innerRadius, y + height - 2);
            ctx.arcTo(x + 2, y + height - 2, x + 2, y + height - 2 - innerRadius, innerRadius);
            ctx.lineTo(x + 2, y + 2 + innerRadius);
            ctx.arcTo(x + 2, y + 2, x + 2 + innerRadius, y + 2, innerRadius);
            ctx.closePath();
            ctx.fill();
        }
        
        // 绘制文本
        ctx.font = '12px Arial';
        ctx.fillStyle = '#5C4033';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${label}: ${Math.floor(value)}/${maxValue}`, x + width/2, y + height/2);
    }
    
    feed() {
        // 显示背包中的食物道具
        const foodItems = this.scene.inventory.getItemsByType('food');
        if (foodItems.length === 0) {
            wx.showToast({
                title: '没有食物道具',
                icon: 'none'
            });
            return false;
        }

        // 显示食物选择界面
        wx.showActionSheet({
            itemList: foodItems.map(item => `${item.name} (${item.quantity}个)`),
            success: (res) => {
                const selectedItem = foodItems[res.tapIndex];
                if (selectedItem && selectedItem.quantity > 0) {
                    // 使用道具
                    if (this.scene.inventory.useItem(selectedItem.id)) {
                        // 增加能量和幸福度
                        this.energy = Math.min(100, this.energy + selectedItem.energyValue);
                        this.happiness = Math.min(100, this.happiness + selectedItem.happinessValue);
                        // 显示使用效果
                        this.status = 'eating';
                        this.actionFrame = 0;
                        this.showStatus = true;
                        this.statusShowTime = 120;
                        // 播放音效或显示提示
                        wx.showToast({
                            title: `使用了${selectedItem.name}`,
                            icon: 'success'
                        });
                        // 保存数据
                        this.scene.saveUserData();
                        return true;
                    }
                }
            },
            fail: () => {
                return false;
            }
        });
    }
    
    pet() {
        this.happiness = Math.min(100, this.happiness + 5);
        this.showStatus = true;
        this.statusShowTime = 120;
        console.log('猫咪被抚摸，幸福度:', this.happiness);
    }
    
    // 获得经验值
    gainExp(amount) {
        this.exp += amount;
        // 检查是否升级
        while (this.exp >= this.maxExp) {
            this.exp -= this.maxExp;
            this.level++;
            this.maxExp = Math.floor(this.maxExp * 1.2);  // 每级所需经验增加20%
            this.showLevelUpEffect();
        }
        
        // 保存数据
        this.scene.saveUserData();
    }
    
    // 升级
    levelUp() {
        this.level++;
        this.exp -= this.maxExp;
        this.maxExp = Math.floor(this.maxExp * 1.5);  // 提高下一级所需经验
        
        // 检查是否达到成长阶段
        if (this.level >= 20 && this.growth === 'kitten') {
            this.growth = 'adult';
            this.updateGrowthEffects();
        } else if (this.level >= 50 && this.growth === 'adult') {
            this.growth = 'elder';
            this.updateGrowthEffects();
        }
        
        // 显示升级效果
        this.showLevelUpEffect();
        
        // 保存数据
        this.scene.saveUserData();
    }
    
    // 更新成长阶段效果
    updateGrowthEffects() {
        switch (this.growth) {
            case 'kitten':
                this.speed = 4;        // 幼猫移动较快
                this.touchArea = { width: 80, height: 80 };  // 触摸区域较小
                break;
            case 'adult':
                this.speed = 3;        // 成年猫移动速度适中
                this.touchArea = { width: 100, height: 100 };
                // 解锁新技能
                this.skills.add('jump');
                this.skills.add('roll');
                break;
            case 'elder':
                this.speed = 2;        // 老年猫移动较慢
                this.touchArea = { width: 120, height: 120 };  // 触摸区域较大
                // 解锁特殊技能
                this.skills.add('wisdom');
                break;
        }
    }
    
    // 显示升级特效
    showLevelUpEffect() {
        this.status = 'levelup';
        this.showStatus = true;
        this.statusShowTime = 120;  // 显示2秒
        
        // 播放升级音效或显示升级提示
        wx.showToast({
            title: `升级到 ${this.level} 级!`,
            icon: 'success',
            duration: 2000
        });
    }
} 