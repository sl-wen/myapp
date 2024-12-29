export class Cat {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        // 状态相关
        this.status = 'normal';  // normal, smile, leftsmile, rightsmile, sleep
        this.statusTimer = 0;
        this.nextStatusChange = Math.random() * 300 + 100;  // 3-7秒随机切换状态
        
        // 拖拽相关
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.lastDragTime = 0;
        this.dragSpeed = 0;
        
        // 属性相关
        this.level = 1;
        this.exp = 0;
        this.maxExp = 100;
        this.satiety = 50;     // 饱食度
        this.happiness = 50;   // 幸福度
        
        // 状态显示相关
        this.showStatus = false;
        this.statusShowTime = 0;
        
        // 加载白猫图片资源
        this.images = {
            normal: wx.createImage(),
            smile: wx.createImage(),
            leftsmile: wx.createImage(),
            rightsmile: wx.createImage(),
            sleep: wx.createImage()
        };
        
        // 添加图片加载完成的计数器
        this.loadedImages = 0;
        const totalImages = 5;

        // 设置图片源
        this.images.normal.src = './images/whitecat_normal.png';
        this.images.smile.src = './images/whitecat_smile.png';
        this.images.leftsmile.src = './images/whitecat_leftsmile.png';
        this.images.rightsmile.src = './images/whitecat_rightsmile.png';
        this.images.sleep.src = './images/whitecat_sleep.png';

        // 添加调试日志
        console.log('开始加载猫咪图片');
        Object.entries(this.images).forEach(([key, img]) => {
            img.onload = () => {
                this.loadedImages++;
                console.log(`猫咪图片 ${key} 加载完成，当前已加载 ${this.loadedImages} 张`);
            };
            img.onerror = (e) => {
                console.error(`猫咪图片 ${key} 加载失败:`, e);
            };
        });
        
        // 设置图片大小
        this.width = 100;
        this.height = 100;
    }
    
    update() {
        // 更新状态计时器
        this.statusTimer++;
        if (this.statusTimer >= this.nextStatusChange && !this.isDragging) {
            this.statusTimer = 0;
            this.nextStatusChange = Math.random() * 300 + 100;
            
            // 随机选择新状态
            const states = ['normal', 'smile', 'leftsmile', 'rightsmile', 'sleep'];
            const currentIndex = states.indexOf(this.status);
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * states.length);
            } while (newIndex === currentIndex);
            
            this.status = states[newIndex];
        }
        
        // 更新状态显示计时
        if (this.showStatus) {
            if (this.statusShowTime > 0) {
                this.statusShowTime--;
            } else {
                this.showStatus = false;
            }
        }
    }
    
    render(ctx) {
        try {
            // 保存当前上下文状态
            ctx.save();
            
            // 获取当前状态的图片
            const image = this.images[this.status];
            if (!image || !image.complete || !image.naturalWidth) {
                console.warn('猫咪图片未完成加载:', this.status);
                // 绘制加载提示
                ctx.font = '14px Arial';
                ctx.fillStyle = '#666666';
                ctx.textAlign = 'center';
                ctx.fillText('加载中...', this.x, this.y);
                ctx.restore();
                return;
            }
            
            // 绘制猫咪图片
            ctx.drawImage(
                image,
                this.x - this.width/2,
                this.y - this.height/2,
                this.width,
                this.height
            );
            
            // 如果需要显示状态，绘制状态条
            if (this.showStatus) {
                this.renderStatus(ctx);
            }
            
            // 恢复上下文状态
            ctx.restore();
            
        } catch (error) {
            console.error('猫咪渲染失败:', error);
            ctx.restore();
        }
    }

    renderStatus(ctx) {
        try {
            const barWidth = 100;  // 状态条宽度
            const barHeight = 6;   // 状态条高度
            const margin = 12;     // 间距
            const cornerRadius = 8; // 圆角半径
            const totalHeight = (barHeight + margin) * 3;  // 包含三个状态条的总高度
            
            // 绘制半透明背景面板
            const panelPadding = 15;
            const panelWidth = barWidth + panelPadding * 2;
            const panelHeight = totalHeight + panelPadding * 2 + 30; // 额外高度用于显示等级
            const panelX = this.x - panelWidth/2;
            const panelY = this.y + this.height/2 + 10; // 将面板放在猫咪图片下方
            
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
            
            // 绘制状态条背景阴影
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
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
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
            
            // 切换到微笑状态
            this.status = 'smile';
            this.statusTimer = 0;
            this.nextStatusChange = 60;  // 1秒后恢复正常状态
            
            console.log('猫咪被抚摸，幸福度:', this.happiness);
        } catch (error) {
            console.error('猫咪抚摸处理失败:', error);
        }
    }

    startDragging(touchX, touchY) {
        this.isDragging = true;
        this.dragStartX = touchX;
        this.dragStartY = touchY;
        this.dragOffsetX = touchX - this.x;
        this.dragOffsetY = touchY - this.y;
        this.lastDragTime = Date.now();
        
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
        
        // 计算拖拽速度
        const deltaX = newX - this.x;
        const deltaY = newY - this.y;
        this.dragSpeed = Math.sqrt(deltaX * deltaX + deltaY * deltaY) / Math.max(1, deltaTime);
        
        // 更新位置
        this.x = newX;
        this.y = newY;
        
        this.lastDragTime = currentTime;
        
        // 如果拖拽速度过快，降低幸福度
        if (this.dragSpeed > 0.5) {
            this.happiness = Math.max(0, this.happiness - 0.2);
            this.status = 'leftsmile';  // 切换到不开心的表情
        }
    }

    stopDragging() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // 根据拖拽结束时的速度决定猫咪的反应
        if (this.dragSpeed > 0.5) {
            // 如果拖拽结束时速度较快，降低更多幸福度
            this.happiness = Math.max(0, this.happiness - 5);
            this.status = 'leftsmile';  // 保持不开心的表情
        } else {
            // 如果温柔放下，增加幸福度
            this.happiness = Math.min(100, this.happiness + 2);
            this.status = 'smile';  // 切换到开心的表情
        }
        
        // 重置拖拽相关数据
        this.dragSpeed = 0;
        this.lastDragTime = 0;
    }
} 