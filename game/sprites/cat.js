export class Cat {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // 基础属性
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;
        this.satiety = 50;  // 初始饱食度设为50
        this.happiness = 50; // 初始幸福度设为50
        
        // 状态
        this.status = 'normal';
        this.showStatus = false;
        this.statusShowTime = 0;
        
        // 移动相关
        this.targetX = x;
        this.targetY = y;
        this.speed = 1;  // 基础速度
        this.lastStateChangeTime = Date.now(); // 上次状态改变的时间
        this.isMoving = false;
        this.arrivalThreshold = 2;  // 到达目标点的阈值
        this.direction = 1;  // 朝向：1为右，-1为左
        this.moveDuration = 5000;  // 移动持续时间（5秒）
        this.restDuration = 5000;  // 休息持续时间（5秒）
        
        // 成长阶段
        this.growth = 'kitten';
        
        // 技能
        this.skills = new Set();
        
        // 初始化触摸区域
        this.touchArea = { width: 80, height: 80 };
        
        // 拖拽相关
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastDragTime = 0;
        this.dragSpeed = 0;
        
        // 活动范围
        const margin = 100;
        this.bounds = {
            left: margin,
            right: scene.canvas.width - margin,
            top: margin,
            bottom: scene.canvas.height - scene.canvas.height * 0.25 - margin
        };
    }

    startDragging(touchX, touchY) {
        this.isDragging = true;
        this.dragStartX = touchX;
        this.dragStartY = touchY;
        this.dragOffsetX = touchX - this.x;
        this.dragOffsetY = touchY - this.y;
        this.lastDragTime = Date.now();
        this.isMoving = false; // 停止自动移动
        
        // 显示状态
        this.showStatus = true;
        this.statusShowTime = 120;
    }

    updateDragging(touchX, touchY) {
        if (!this.isDragging) return;

        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastDragTime;
        
        // 计算新位置
        let newX = touchX - this.dragOffsetX;
        let newY = touchY - this.dragOffsetY;
        
        // 限制在活动范围内
        newX = Math.max(this.bounds.left, Math.min(this.bounds.right, newX));
        newY = Math.max(this.bounds.top, Math.min(this.bounds.bottom, newY));
        
        // 计算拖拽速度
        const deltaX = newX - this.x;
        const deltaY = newY - this.y;
        this.dragSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / Math.max(1, deltaTime);
        
        // 更新位置
        this.x = newX;
        this.y = newY;
        
        // 更新朝向
        if (Math.abs(deltaX) > 0.1) {
            this.direction = deltaX > 0 ? 1 : -1;
        }
        
        this.lastDragTime = currentTime;
        
        // 如果拖拽速度过快，降低幸福度
        if (this.dragSpeed > 0.5) {
            this.happiness = Math.max(0, this.happiness - 0.2);
        }
    }

    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // 根据拖拽结束时的速度决定猫咪的反应
        if (this.dragSpeed > 0.5) {
            // 如果拖拽结束时速度较快，降低更多幸福度
            this.happiness = Math.max(0, this.happiness - 5);
            
            // 随机选择一个远离当前位置的目标点
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 200 + 100;
            this.targetX = this.x + Math.cos(angle) * distance;
            this.targetY = this.y + Math.sin(angle) * distance;
            
            // 确保目标点在活动范围内
            this.targetX = Math.max(this.bounds.left, Math.min(this.bounds.right, this.targetX));
            this.targetY = Math.max(this.bounds.top, Math.min(this.bounds.bottom, this.targetY));
            
            this.isMoving = true;
        } else {
            // 如果温柔放下，增��幸福度
            this.happiness = Math.min(100, this.happiness + 2);
        }
        
        // 重置拖拽相关数据
        this.dragSpeed = 0;
        this.lastDragTime = 0;
    }

    update() {
        try {
            // 更新状态显示时间
            if (this.showStatus && this.statusShowTime > 0) {
                this.statusShowTime--;
                if (this.statusShowTime <= 0) {
                    this.showStatus = false;
                }
            }

            // 如果正在拖拽，跳过自动移动逻辑
            if (this.isDragging) return;

            // 检查是否需要切换状态
            const currentTime = Date.now();
            const timeSinceLastChange = currentTime - this.lastStateChangeTime;

            if (this.isMoving && timeSinceLastChange >= this.moveDuration) {
                // 从移动切换到静止
                this.isMoving = false;
                this.lastStateChangeTime = currentTime;
            } else if (!this.isMoving && timeSinceLastChange >= this.restDuration) {
                // 从静止切换到移动
                this.findNewTarget();
                this.lastStateChangeTime = currentTime;
            }

            // 如果正在移动，更新位置
            if (this.isMoving && this.satiety > 0) {
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 更新朝向
                if (Math.abs(dx) > 0.1) {
                    this.direction = dx > 0 ? 1 : -1;
                }
                
                if (distance > this.arrivalThreshold) {
                    // 使用饱食度调整速度，但限制最大速度
                    const speedMultiplier = 0.5 + (this.satiety / 100);
                    const maxSpeed = 2;
                    const currentSpeed = Math.min(this.speed * speedMultiplier, maxSpeed);
                    
                    // 平滑移动
                    this.x += (dx / distance) * currentSpeed;
                    this.y += (dy / distance) * currentSpeed;
                } else {
                    // 到达目标点新的目标
                    this.findNewTarget();
                }
            }
        } catch (error) {
            console.error('猫咪更新失败:', error);
        }
    }

    findNewTarget() {
        // 设置活动范围
        const margin = 100;
        const minX = margin;
        const maxX = this.scene.canvas.width - margin;
        const minY = margin;
        const maxY = this.scene.canvas.height - this.scene.canvas.height * 0.25 - margin;
        
        // 在活动范围内随机选择一个目标点
        this.targetX = Math.random() * (maxX - minX) + minX;
        this.targetY = Math.random() * (maxY - minY) + minY;
        this.isMoving = true;
        console.log('猫咪设置新目标点:', { x: this.targetX, y: this.targetY });
    }

    render(ctx) {
        try {
            // 检查是否有猫咪图片资源
            const catImage = this.scene.game.resources.cat;
            if (!catImage) {
                console.error('猫咪图片资源未加载');
                return;
            }

            // 保存当前上下文状态
            ctx.save();
            
            // 移动到猫咪位置
            ctx.translate(this.x, this.y);
            
            // 根据朝向翻转图片
            if (this.direction < 0) {
                ctx.scale(-1, 1);
            }
            
            // 绘制猫咪图片
            ctx.drawImage(
                catImage,
                -catImage.width / 2,
                -catImage.height / 2,
                catImage.width,
                catImage.height
            );
            
            // 恢复上下文状态
            ctx.restore();
            
            // 如果显示状态为true，绘制状态条
            if (this.showStatus) {
                this.renderStatus(ctx);
            }
        } catch (error) {
            console.error('猫咪渲染失败:', error);
        }
    }

    renderStatus(ctx) {
        try {
            // 获取猫咪图片尺寸
            const catImage = this.scene.game.resources.cat;
            if (!catImage) {
                console.error('猫咪图片资源未加载');
                return;
            }

            const barWidth = 100;  // 状态条宽度
            const barHeight = 6;   // 状态条高度
            const margin = 12;     // 间距增加到12（原来是8）
            const cornerRadius = 8; // 圆角半径
            const totalHeight = (barHeight + margin) * 3;  // 包含三个状态条的总高度
            
            // 绘制半透明背景面板
            const panelPadding = 15;
            const panelWidth = barWidth + panelPadding * 2;
            const panelHeight = totalHeight + panelPadding * 2 + 30; // 额外高度用于显示等级
            const panelX = this.x - panelWidth/2;
            const panelY = this.y + catImage.height/2 + 10; // 将面板放在猫咪图片下方
            
            // 绘制阴影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 2;
            
            // 绘制圆角矩形背景
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.beginPath();
            ctx.moveTo(panelX + cornerRadius, panelY);
            ctx.lineTo(panelX + panelWidth - cornerRadius, panelY);
            ctx.arcTo(panelX + panelWidth, panelY, panelX + panelWidth, panelY + cornerRadius, cornerRadius);
            ctx.lineTo(panelX + panelWidth, panelY + panelHeight - cornerRadius);
            ctx.arcTo(panelX + panelWidth, panelY + panelHeight, panelX + panelWidth - cornerRadius, panelY + panelHeight, cornerRadius);
            ctx.lineTo(panelX + cornerRadius, panelY + panelHeight);
            ctx.arcTo(panelX, panelY + panelHeight, panelX, panelY + panelHeight - cornerRadius, cornerRadius);
            ctx.lineTo(panelX, panelY + cornerRadius);
            ctx.arcTo(panelX, panelY, panelX + cornerRadius, panelY, cornerRadius);
            ctx.closePath();
            ctx.fill();
            
            // 重置阴影
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // 绘制等级
            const levelY = panelY + 22;
            // 绘制等级背景圆圈
            const circleRadius = 15;
            ctx.beginPath();
            ctx.arc(this.x, levelY - 4, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFB6C1';
            ctx.fill();
            
            // 绘制等级文本
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Lv ${this.level}`, this.x, levelY - 4);
            
            const startY = panelY + 50;  // 状态条起始Y坐标
            
            // 绘制状态条
            this.renderBar(
                ctx,
                this.x - barWidth/2,
                startY,
                barWidth,
                barHeight,
                this.satiety,
                100,
                '饱食度',
                '#FFF0F5',  // 浅粉色背景
                '#FF69B4'   // 深粉色填充
            );
            
            this.renderBar(
                ctx,
                this.x - barWidth/2,
                startY + barHeight + margin,
                barWidth,
                barHeight,
                this.happiness,
                100,
                '心情',
                '#F0FFF0',  // 浅绿色背景
                '#32CD32'   // 深绿色填充
            );
            
            this.renderBar(
                ctx,
                this.x - barWidth/2,
                startY + (barHeight + margin) * 2,
                barWidth,
                barHeight,
                this.exp,
                this.maxExp,
                '经验',
                '#F0F0FF',  // 浅紫色背景
                '#9370DB'   // 深紫色填充
            );
            
        } catch (error) {
            console.error('状态条渲染失败:', error);
        }
    }

    renderBar(ctx, x, y, width, height, value, maxValue, label, bgColor, fillColor) {
        try {
            const cornerRadius = height / 2;  // 使状态条两端完全圆润
            
            // 绘制标签和数值
            ctx.font = '12px Arial';
            ctx.fillStyle = '#666666';
            ctx.textAlign = 'left';
            ctx.fillText(`${label}：${Math.floor(value)}/${maxValue}`, x, y - 4);
            
            // 绘制状态条背��阴影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetY = 1;
            
            // 绘制圆角状态条背景
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.moveTo(x + cornerRadius, y);
            ctx.lineTo(x + width - cornerRadius, y);
            ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
            ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
            ctx.lineTo(x + cornerRadius, y + height);
            ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
            ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
            ctx.closePath();
            ctx.fill();
            
            // 重置阴影
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            
            // 绘制填充部分
            const fillWidth = (width * value) / maxValue;
            if (fillWidth > 0) {
                ctx.fillStyle = fillColor;
                ctx.beginPath();
                ctx.moveTo(x + cornerRadius, y);
                if (fillWidth >= width - cornerRadius) {
                    // 如果填充接近满，使用完整的圆角
                    ctx.lineTo(x + fillWidth - cornerRadius, y);
                    ctx.arcTo(x + fillWidth, y, x + fillWidth, y + cornerRadius, cornerRadius);
                    ctx.arcTo(x + fillWidth, y + height, x + fillWidth - cornerRadius, y + height, cornerRadius);
                } else {
                    // 否则右边直角
                    ctx.lineTo(x + fillWidth, y);
                    ctx.lineTo(x + fillWidth, y + height);
                }
                ctx.lineTo(x + cornerRadius, y + height);
                ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
                ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
                ctx.closePath();
                ctx.fill();
                
                // 添加渐变光泽效果
                const gradient = ctx.createLinearGradient(x, y, x, y + height);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
        } catch (error) {
            console.error('进度条渲染失败:', error);
        }
    }

    checkTouched(x, y) {
        const halfWidth = this.touchArea.width / 2;
        const halfHeight = this.touchArea.height / 2;
        return x >= this.x - halfWidth && x <= this.x + halfWidth &&
               y >= this.y - halfHeight && y <= this.y + halfHeight;
    }

    pet() {
        try {
            // 增加幸福度
            this.happiness = Math.min(100, this.happiness + 5);
            
            // 显示状态条
            this.showStatus = true;
            this.statusShowTime = 120;  // 显示2秒
            
            console.log('猫咪被抚摸，幸福度:', this.happiness);
        } catch (error) {
            console.error('猫咪抚摸处理失败:', error);
        }
    }
} 