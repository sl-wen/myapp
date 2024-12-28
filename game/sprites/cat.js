export class Cat {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // 状态
        this.happiness = 100;  // 幸福度
        this.energy = 100;     // 能量
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
        // 更新状态条显示时间
        if (this.statusShowTime > 0) {
            this.statusShowTime--;
            if (this.statusShowTime === 0) {
                this.showStatus = false;
            }
        }
        
        // 如果没有在拖拽，才进行自动移动
        if (!this.isDragging) {
            // 更新移动计时器
            this.moveTimer++;
            if (this.moveTimer >= 300) { // 5秒 = 300帧
                this.moveTimer = 0;
                
                // 随机选择新状态
                const rand = Math.random();
                if (rand < 0.3) {
                    this.status = 'sleeping';
                } else {
                    this.status = 'walking';
                    this.findNewTarget();
                }
            }
            
            // 更新状态
            this.energy = Math.max(0, Math.min(100, this.energy - 0.005));
            this.happiness = Math.max(0, Math.min(100, this.happiness - 0.01));
            
            // 更新位置
            if (this.status === 'walking') {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > this.speed) {
                    this.x += (dx / distance) * this.speed;
                    this.y += (dy / distance) * this.speed;
                    this.direction = dx > 0 ? 1 : -1;
                } else {
                    this.x = this.targetX;
                    this.y = this.targetY;
                }
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
            this.renderStatusBars(ctx);
        }
    }
    
    renderStatusBars(ctx) {
        const barWidth = 80;
        const barHeight = 6;
        const padding = 5;
        const offsetY = this.processedImageRight ? this.processedImageRight.height / 2 + 10 : 70;
        
        // 绘制状态条背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';  // 半透明黑色背景
        ctx.fillRect(
            this.x - barWidth/2 - 2,
            this.y + offsetY - 2,
            barWidth + 4,
            (barHeight * 2 + padding) + 4
        );
        
        // 绘制能量条
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth/2, this.y + offsetY, barWidth, barHeight);
        
        ctx.fillStyle = '#44ff44';
        ctx.fillRect(
            this.x - barWidth/2,
            this.y + offsetY,
            barWidth * (this.energy/100),
            barHeight
        );
        
        // 绘制幸福度条
        ctx.fillStyle = '#333333';
        ctx.fillRect(
            this.x - barWidth/2,
            this.y + offsetY + padding + barHeight,
            barWidth,
            barHeight
        );
        
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(
            this.x - barWidth/2,
            this.y + offsetY + padding + barHeight,
            barWidth * (this.happiness/100),
            barHeight
        );
    }
    
    feed() {
        // 检查金币是否足够
        if (this.scene.coins >= 100) {
            this.scene.coins -= 100; // 扣除金币
            this.energy = Math.min(100, this.energy + 20);
            this.status = 'eating';
            this.actionFrame = 0;
            this.showStatus = true;
            this.statusShowTime = 120;
            console.log('猫咪被喂食，能量:', this.energy);
            return true;
        } else {
            console.log('金币不足，无法购买猫粮');
            return false;
        }
    }
    
    pet() {
        this.happiness = Math.min(100, this.happiness + 5);
        this.showStatus = true;
        this.statusShowTime = 120;
        console.log('猫咪被抚摸，幸福度:', this.happiness);
    }
} 