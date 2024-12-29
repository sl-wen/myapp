export class Cat {
    constructor(scene, x, y, type = 'white') {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.type = type;  // 猫咪类型
        
        // 基本信息
        this.name = '未命名';     // 猫咪名字
        this.color = type === 'black' ? '黑色' : this.randomColor();  // 猫咪颜色
        this.personality = this.randomPersonality();  // 性格特征
        this.pattern = type === 'black' ? '纯色' : this.randomPattern(); // 花纹特征
        this.eyeColor = type === 'black' ? '金色' : this.randomEyeColor(); // 眼睛颜色
        this.specialTrait = this.randomSpecialTrait(); // 特殊特征
        
        // 性格影响的属性
        this.personalityEffects = this.initPersonalityEffects();
        
        // 状态相关
        this.status = 'normal';  // normal, smile, leftsmile, rightsmile, sleep
        this.statusTimer = 0;
        this.nextStatusChange = Math.random() * 300 + 100;
        this.mood = 'normal';    // normal, happy, sad, excited, tired
        this.energy = 100;       // 能量值
        
        // 技能相关
        this.skills = this.initSkills();
        this.favoriteFood = this.randomFavoriteFood();
        this.favoriteToy = this.randomFavoriteToy();
        
        // 动画相关
        this.scale = 1;
        this.rotation = 0;
        this.targetRotation = 0;
        this.bobOffset = 0;
        this.bobSpeed = 0.002;
        this.bobAmount = 1.5;
        this.scaleOffset = 0;
        this.scaleSpeed = 0.001;
        this.scaleAmount = 0.02;
        
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
        this.satiety = 50;
        this.happiness = 50;
        
        // 状态显示相关
        this.showStatus = false;
        this.statusShowStartTime = 0;  // 记录状态栏开始显示的时间
        
        // 加载基础图片
        this.images = {};
        this.loadedImages = 0;
        this.totalImages = 3;
        
        // 创建加载函数
        const loadImage = (state, src) => {
            console.log(`开始加载${state}状态图片: ${src}`);  // 添加调试日志
            this.images[state] = wx.createImage();
            
            this.images[state].onload = () => {
                this.loadedImages++;
                console.log(`加载${state}状态图片成功: ${src}`);  // 添加调试日志
            };
            
            this.images[state].onerror = (error) => {
                console.error(`加载${state}状态图片失败: ${src}`, error);  // 添加详细错误信息
                // 如果加载失败，使用默认图片
                this.images[state].src = `images/whitecat_${state}.png`;
                console.log(`尝试加载默认图片: images/whitecat_${state}.png`);  // 添加调试日志
            };
            
            try {
                this.images[state].src = src;
                console.log(`设置图片源: ${src}`);  // 添加调试日志
            } catch (error) {
                console.error(`设置图片源时出错: ${src}`, error);  // 添加错误处理
            }
        };
        
        // 根据猫咪类型加载不同的图片
        const prefix = type === 'black' ? 'blackcat' : 'whitecat';
        console.log(`使用图片前缀: ${prefix}`);  // 添加调试日志
        
        loadImage('normal', `images/${prefix}_normal.png`);
        loadImage('smile', `images/${prefix}_smile.png`);
        loadImage('sleep', `images/${prefix}_sleep.png`);
        
        // 调整图片大小
        this.width = 120;
        this.height = 120;
    }
    
    // 随机生成猫咪颜色
    randomColor() {
        const colors = ['白色', '橘色', '黑色', '灰色', '奶牛', '三花', '玳瑁'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // 随机生成性格特征
    randomPersonality() {
        const personalities = ['活泼', '懒散', '优雅', '顽皮', '高冷', '胆小', '好奇', '傲娇'];
        return personalities[Math.floor(Math.random() * personalities.length)];
    }
    
    // 随机生成花纹特征
    randomPattern() {
        const patterns = ['纯色', '条纹', '斑点', '虎斑', '玳瑁纹', '奶牛纹', '无纹'];
        return patterns[Math.floor(Math.random() * patterns.length)];
    }
    
    // 随机生成眼睛颜色
    randomEyeColor() {
        const eyeColors = ['蓝色', '绿色', '琥珀色', '金色', '橙色', '异色瞳'];
        return eyeColors[Math.floor(Math.random() * eyeColors.length)];
    }
    
    // 随机生成特殊特征
    randomSpecialTrait() {
        const traits = [
            '短尾巴', '长尾巴', '卷耳朵', '大眼睛', '小眼睛', 
            '粉鼻子', '黑鼻子', '白手套', '白袜子', '无特征'
        ];
        return traits[Math.floor(Math.random() * traits.length)];
    }
    
    // 初始化性格影响
    initPersonalityEffects() {
        const effects = {
            '活泼': {
                expGain: 1.2,      // 经验获得增加20%
                energyDrain: 1.2,  // 能量消耗增加20%
                happiness: 1.1     // 幸福度增加10%
            },
            '懒散': {
                expGain: 0.8,      // 经验获得减少20%
                energyDrain: 0.8,  // 能量消耗减少20%
                satietyDrain: 0.9  // 饱食度消耗减少10%
            },
            '优雅': {
                expGain: 1.1,      // 经验获得增加10%
                happiness: 1.2     // 幸福度增加20%
            },
            '顽皮': {
                expGain: 1.3,      // 经验获得增加30%
                energyDrain: 1.3,  // 能量消耗增加30%
                satietyDrain: 1.2  // 饱食度消耗增加20%
            },
            '高冷': {
                expGain: 0.9,      // 经验获得减少10%
                happiness: 0.9,    // 幸福度减少10%
                satietyDrain: 0.8  // 饱食度消耗减少20%
            },
            '胆小': {
                expGain: 0.8,      // 经验获得减少20%
                happiness: 1.1,    // 幸福度增加10%
                energyDrain: 0.9   // 能量消耗减少10%
            },
            '好奇': {
                expGain: 1.3,      // 经验获得增加30%
                energyDrain: 1.1,  // 能量消耗增加10%
                happiness: 1.2     // 幸福度增加20%
            },
            '傲娇': {
                expGain: 1.1,      // 经验获得增加10%
                happiness: 0.9,    // 幸福度减少10%
                satietyDrain: 1.1  // 饱食度消耗增加10%
            }
        };
        return effects[this.personality] || {
            expGain: 1,
            energyDrain: 1,
            happiness: 1,
            satietyDrain: 1
        };
    }
    
    // 初始化技能
    initSkills() {
        // 随机生成50-100之间的总属性点数
        let remainingPoints = Math.floor(Math.random() * 51) + 50;  // 50到100之间的随机数
        let remainingAttributes = ['stamina', 'charm', 'strength', 'fortune'];
        let attributeValues = {};

        while (remainingAttributes.length > 0) {
            // 最后一个属性直接分配剩余点数
            if (remainingAttributes.length === 1) {
                attributeValues[remainingAttributes[0]] = remainingPoints;
                break;
            }

            // 为当前属性随机分配点数，保证剩余属性每个至少有5点
            const minPointsForRest = remainingAttributes.length * 5;  // 每个属性至少5点
            const maxPoints = remainingPoints - minPointsForRest;
            const points = Math.floor(Math.random() * (maxPoints - 5 + 1)) + 5;  // 至少5点

            const attribute = remainingAttributes.splice(
                Math.floor(Math.random() * remainingAttributes.length), 1
            )[0];

            attributeValues[attribute] = points;
            remainingPoints -= points;
        }

        // 创建技能对象
        return {
            stamina: {
                level: attributeValues.stamina,     // 体力等级
                exp: 0,                            // 技能经验
                maxExp: 100,                       // 升级所需经验
                talent: Math.floor(Math.random() * 100),  // 天赋值（影响成长速度）
                description: '体力影响猫咪的饱食度上限'
            },
            charm: {
                level: attributeValues.charm,      // 魅力等级
                exp: 0,
                maxExp: 100,
                talent: Math.floor(Math.random() * 100),
                description: '魅力影响猫咪的幸福度上限'
            },
            strength: {
                level: attributeValues.strength,   // 力量等级
                exp: 0,
                maxExp: 100,
                talent: Math.floor(Math.random() * 100),
                description: '力量影响猫咪的攻击能力'
            },
            fortune: {
                level: attributeValues.fortune,    // 招财等级
                exp: 0,
                maxExp: 100,
                talent: Math.floor(Math.random() * 100),
                description: '招财影响金币的产出效率'
            }
        };
    }
    
    // 随机生成喜爱的食物
    randomFavoriteFood() {
        const foods = ['鱼干', '猫粮', '小鱼干', '牛肉干', '鸡胸肉', '金枪鱼', '虾仁'];
        return foods[Math.floor(Math.random() * foods.length)];
    }
    
    // 随机生成喜爱的玩具
    randomFavoriteToy() {
        const toys = ['逗猫棒', '毛线球', '激光笔', '猫抓板', '小铃铛', '毛绒玩具', '纸箱'];
        return toys[Math.floor(Math.random() * toys.length)];
    }
    
    // 设置猫咪名字
    setName(name) {
        this.name = name;
    }
    
    // 获取猫咪详细信息
    getDetailedInfo() {
        return {
            // 基本信息
            name: this.name,
            color: this.color,
            personality: this.personality,
            pattern: this.pattern,
            eyeColor: this.eyeColor,
            specialTrait: this.specialTrait,
            
            // 状态信息
            level: this.level,
            exp: this.exp,
            maxExp: this.maxExp,
            satiety: this.satiety,
            happiness: this.happiness,
            energy: this.energy,
            mood: this.mood,
            
            // 技能信息
            skills: this.skills,
            
            // 喜好信息
            favoriteFood: this.favoriteFood,
            favoriteToy: this.favoriteToy
        };
    }
    
    // 更新状态时考虑性格影响
    update() {
        // 更新能量
        this.energy = Math.max(0, this.energy - 0.01 * this.personalityEffects.energyDrain);
        
        // 更新饱食度
        this.satiety = Math.max(0, this.satiety - 0.01 * (this.personalityEffects.satietyDrain || 1));
        
        // 根据状态更新心情
        this.updateMood();
        
        // 更新上下浮动动画
        this.bobOffset = Math.sin(Date.now() * this.bobSpeed) * this.bobAmount;
        
        // 更新缩放动画
        this.scaleOffset = Math.sin(Date.now() * this.scaleSpeed) * this.scaleAmount;
        this.scale = 1 + this.scaleOffset;
        
        // 平滑旋转
        if (this.rotation !== this.targetRotation) {
            const diff = this.targetRotation - this.rotation;
            this.rotation += diff * 0.1;
        }
        
        // 更新状态计时器
        this.statusTimer++;
        if (this.statusTimer >= this.nextStatusChange && !this.isDragging) {
            this.statusTimer = 0;
            this.nextStatusChange = Math.random() * 300 + 100;
            
            // 随机选择新状态
            const states = ['normal', 'smile', 'sleep'];
            const currentIndex = states.indexOf(this.status);
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * states.length);
            } while (newIndex === currentIndex);
            
            this.status = states[newIndex];
            
            // 随机添加一些旋转
            if (Math.random() < 0.3) {
                this.targetRotation = (Math.random() - 0.5) * 0.2;
            }
        }
        
        // 更新状态显示
        if (this.showStatus) {
            const currentTime = Date.now();
            if (currentTime - this.statusShowStartTime >= 10000) {  // 10秒后自动隐藏
                this.showStatus = false;
            }
        }
    }
    
    // 更新心情
    updateMood() {
        if (this.energy < 20) {
            this.mood = 'tired';
        } else if (this.satiety < 30) {
            this.mood = 'sad';
        } else if (this.happiness > 80) {
            this.mood = 'happy';
        } else if (this.happiness < 30) {
            this.mood = 'sad';
        } else {
            this.mood = 'normal';
        }
    }
    
    // 使用道具时考虑性格影响
    useItem(item) {
        let expMultiplier = this.personalityEffects.expGain || 1;
        let happinessMultiplier = this.personalityEffects.happiness || 1;
        
        // 如果是喜爱的食物，增加效果
        if (item.name === this.favoriteFood) {
            expMultiplier *= 1.5;
            happinessMultiplier *= 1.5;
        }
        
        return {
            expMultiplier,
            happinessMultiplier
        };
    }
    
    render(ctx) {
        try {
            ctx.save();
            
            // 检查图片是否都已加载完成
            if (this.loadedImages < this.totalImages) {
                // 绘制加载中提示
                ctx.translate(this.x, this.y);
                ctx.font = '14px Arial';
                ctx.fillStyle = '#666666';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`加载中...${this.loadedImages}/${this.totalImages}`, 0, 0);
                ctx.restore();
                return;
            }
            
            // 只在显示状态时绘制名字
            if (this.showStatus) {
                ctx.save();
                ctx.font = 'bold 16px Arial';
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                // 添加文字阴影效果
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                ctx.fillText(this.name, this.x, this.y - this.height/2 - 10);
                ctx.restore();
            }
            
            // 获取当前状态的图片
            let currentImage = this.images[this.status];
            
            // 如果当前状态图片未加载完成，使用普通状态图片
            if (!currentImage || !currentImage.complete) {
                currentImage = this.images.normal;
            }
            
            // 应用变换
            ctx.translate(this.x, this.y + this.bobOffset);
            ctx.rotate(this.rotation);
            ctx.scale(this.scale, this.scale);
            
            // 绘制猫咪
            ctx.drawImage(
                currentImage,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height
            );
            
            // 如果需要显示状态，绘制状态条
            if (this.showStatus) {
                // 保存当前变换状态
                ctx.save();
                
                // 重置旋转和缩放，但保持平移
                ctx.rotate(-this.rotation);
                ctx.scale(1/this.scale, 1/this.scale);
                
                // 渲染状态条
                this.renderStatus(ctx);
                
                // 恢复变换状态
                ctx.restore();
            }
            
            ctx.restore();
            
        } catch (error) {
            console.error('猫咪渲染失败:', error);
            ctx.restore();
        }
    }

    pet() {
        try {
            // 增加幸福度
            this.happiness = Math.min(100, this.happiness + 5);
            
            // 显示状态条并记录开始时间
            this.showStatus = true;
            this.statusShowStartTime = Date.now();
            
            // 切换到微笑状态并添加动画效果
            this.status = 'smile';
            this.statusTimer = 0;
            this.nextStatusChange = 60;
            
            // 添加开心的动画效果，但幅度更小
            this.scale = 1.1;
            this.bobSpeed = 0.003;
            this.bobAmount = 2;
            setTimeout(() => {
                this.bobSpeed = 0.002;
                this.bobAmount = 1.5;
            }, 1000);
            
            console.log('猫咪被抚摸，幸福度:', this.happiness);
        } catch (error) {
            console.error('猫咪抚摸处理失败:', error);
        }
    }

    checkTouched(x, y) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        return x >= this.x - halfWidth && x <= this.x + halfWidth &&
               y >= this.y - halfHeight && y <= this.y + halfHeight;
    }

    startDragging(x, y) {
        this.isDragging = true;
        this.dragStartX = x;
        this.dragStartY = y;
        this.dragOffsetX = x - this.x;
        this.dragOffsetY = y - this.y;
        this.lastDragTime = Date.now();
        this.dragSpeed = 0;
        
        // 增加幸福度
        this.happiness = Math.min(100, this.happiness + 2);
        
        // 更新抚摸任务进度
        this.scene.taskManager.updateTask('daily_petting');
        
        // 保存数据
        this.scene.saveUserData();
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
            const panelX = -panelWidth/2;  // 相对于猫咪中心点的位置
            const panelY = this.height/2 + 10; // 将面板放在猫咪图片下方
            
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
            ctx.arc(0, levelY - 4, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#FFB6C1';
            ctx.fill();
            
            // 绘制等级文本
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Lv ${this.level}`, 0, levelY - 4);
            
            const startY = panelY + 50;  // 状态条起始Y坐标
            
            // 绘制状态条
            this.renderBar(
                ctx,
                -barWidth/2,
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
                -barWidth/2,
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
                -barWidth/2,
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

    // 渲染详细状态
    renderDetailedStatus(ctx) {
        // ... existing status rendering code ...
        
        // 添加性格和特征显示
        ctx.font = '12px Arial';
        ctx.fillStyle = '#666666';
        ctx.textAlign = 'center';
        
        const texts = [
            `${this.personality} · ${this.color}`,
            `${this.pattern} · ${this.eyeColor}眼睛`,
            this.specialTrait !== '无特征' ? this.specialTrait : '',
            `最爱${this.favoriteFood}`
        ];
        
        texts.forEach((text, index) => {
            if (text) {
                ctx.fillText(text, this.x, this.y + 80 + index * 16);
            }
        });
    }

    // 获取技能等级
    getSkillLevel(skillName) {
        return this.skills[skillName]?.level || 0;
    }

    // 获取技能经验
    getSkillExp(skillName) {
        return this.skills[skillName]?.exp || 0;
    }

    // 获取技能天赋
    getSkillTalent(skillName) {
        return this.skills[skillName]?.talent || 0;
    }

    // 增加技能经验
    addSkillExp(skillName, amount) {
        if (!this.skills[skillName]) return false;

        const skill = this.skills[skillName];
        const talent = skill.talent;
        // 天赋影响经验获得
        const expGain = amount * (1 + talent / 100);
        
        skill.exp += expGain;
        
        // 检查是否升级
        while (skill.exp >= skill.maxExp) {
            skill.exp -= skill.maxExp;
            skill.level++;
            // 每级增加所需经验
            skill.maxExp = Math.floor(skill.maxExp * 1.2);
            
            // 触发升级效果
            this.onSkillLevelUp(skillName, skill.level);
        }
        
        return true;
    }

    // 技能升级效果
    onSkillLevelUp(skillName, newLevel) {
        // 根据不同属性给予不同奖励
        switch (skillName) {
            case 'stamina':
                // 立即恢复一定饱食度
                this.satiety = Math.min(this.getMaxSatiety(), this.satiety + 20);
                break;
            case 'charm':
                // 立即恢复一定幸福度
                this.happiness = Math.min(this.getMaxHappiness(), this.happiness + 20);
                break;
            case 'strength':
                // 立即恢复一定能量
                this.energy = Math.min(100, this.energy + 20);
                break;
            case 'fortune':
                // 立即获得一些金币
                this.scene.coins += newLevel * 10;
                break;
        }
    }

    // 获取技能描述
    getSkillDescription(skillName) {
        const descriptions = {
            stamina: `体力 - 提升饱食度上限\n当前饱食度上限：${this.getMaxSatiety()}`,
            charm: `魅力 - 提升幸福度上限\n当前幸福度上限：${this.getMaxHappiness()}`,
            strength: `力量 - 提升攻击能力\n当前攻击力：${this.getAttackPower()}`,
            fortune: `招财 - 提升金币产出\n当前金币加成：${Math.floor((this.getCoinBonus() - 1) * 100)}%`
        };
        return descriptions[skillName] || '';
    }

    // 获取技能培养建议
    getSkillTrainingTips(skillName) {
        const tips = {
            stamina: [
                '进行体能训练',
                '外出散步',
                '玩耍运动'
            ],
            charm: [
                '梳理毛发',
                '学习卖萌',
                '保持整洁'
            ],
            strength: [
                '力量训练',
                '搏击训练',
                '障碍训练'
            ],
            fortune: [
                '学习捕猎',
                '寻找宝物',
                '招财修炼'
            ]
        };
        return tips[skillName] || [];
    }

    // 获取技能成长评价
    getSkillGrowthRate(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return '未知';
        
        const talent = skill.talent;
        if (talent >= 90) return 'S';
        if (talent >= 80) return 'A';
        if (talent >= 60) return 'B';
        if (talent >= 40) return 'C';
        return 'D';
    }

    // 获取详细的技能信息
    getDetailedSkillInfo(skillName) {
        const skill = this.skills[skillName];
        if (!skill) return null;

        return {
            name: skillName,
            level: skill.level,
            exp: skill.exp,
            maxExp: skill.maxExp,
            talent: skill.talent,
            growthRate: this.getSkillGrowthRate(skillName),
            description: this.getSkillDescription(skillName),
            trainingTips: this.getSkillTrainingTips(skillName)
        };
    }

    // 获取属性加成后的上限值
    getMaxSatiety() {
        return 100 + this.skills.stamina.level * 5;  // 每级体力增加5点饱食度上限
    }

    getMaxHappiness() {
        return 100 + this.skills.charm.level * 5;    // 每级魅力增加5点幸福度上限
    }

    getAttackPower() {
        return 10 + this.skills.strength.level * 2;  // 每级力量增加2点攻击力
    }

    getCoinBonus() {
        return 1 + this.skills.fortune.level * 0.1;  // 每级招财增加10%金币产出
    }
} 