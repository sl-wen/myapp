class CatLinkGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 游戏配置
        this.config = {
            rows: 8,          // 网格行数
            cols: 6,          // 网格列数
            types: 6,         // 猫咪种类数
            maxLayers: 3,     // 最大层数
            minMatch: 3,      // 最小消除数量
        };
        
        // 游戏状态
        this.state = {
            score: 0,         // 得分
            moves: 30,        // 剩余步数
            selected: null,   // 当前选中的卡片
            cards: [],        // 所有卡片
            gameOver: false   // 游戏是否结束
        };
        
        // 初始化触摸事件
        this.initTouchEvents();
    }
    
    init() {
        // 计算卡片大小
        const cardWidth = this.canvas.width / (this.config.cols + 2);
        const cardHeight = cardWidth * 1.2;
        
        // 生成卡片
        this.state.cards = [];
        for (let layer = 0; layer < this.config.maxLayers; layer++) {
            for (let row = 0; row < this.config.rows; row++) {
                for (let col = 0; col < this.config.cols; col++) {
                    // 随机决定是否在此位置放置卡片
                    if (Math.random() < 0.7) {
                        const card = {
                            type: Math.floor(Math.random() * this.config.types),
                            row: row,
                            col: col,
                            layer: layer,
                            x: (col + 1) * cardWidth,
                            y: (row + 1) * cardHeight,
                            width: cardWidth * 0.9,
                            height: cardHeight * 0.9,
                            visible: true,
                            blocked: false
                        };
                        this.state.cards.push(card);
                    }
                }
            }
        }
        
        // 更新卡片的blocked状态
        this.updateBlockedStatus();
    }
    
    updateBlockedStatus() {
        // 重置所有卡片的blocked状态
        this.state.cards.forEach(card => {
            card.blocked = false;
        });
        
        // 检查每张卡片是否被其他卡片覆盖
        this.state.cards.forEach(card1 => {
            if (!card1.visible) return;
            
            this.state.cards.forEach(card2 => {
                if (!card2.visible || card1 === card2 || card2.layer <= card1.layer) return;
                
                // 检查是否有重叠
                if (this.checkOverlap(card1, card2)) {
                    card1.blocked = true;
                }
            });
        });
    }
    
    checkOverlap(card1, card2) {
        return !(card1.x + card1.width < card2.x ||
                card2.x + card2.width < card1.x ||
                card1.y + card1.height < card2.y ||
                card2.y + card2.height < card1.y);
    }
    
    initTouchEvents() {
        this.canvas.addEventListener('touchstart', (e) => {
            if (this.state.gameOver) return;
            
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // 检查是否点击了卡片
            const card = this.findTouchedCard(touchX, touchY);
            if (card && !card.blocked) {
                this.selectCard(card);
            }
        });
    }
    
    findTouchedCard(x, y) {
        // 从上层向下查找第一个被点击的可见卡片
        for (let layer = this.config.maxLayers - 1; layer >= 0; layer--) {
            for (const card of this.state.cards) {
                if (card.layer === layer && card.visible &&
                    x >= card.x && x <= card.x + card.width &&
                    y >= card.y && y <= card.y + card.height) {
                    return card;
                }
            }
        }
        return null;
    }
    
    selectCard(card) {
        if (this.state.selected === null) {
            // 第一次选择
            this.state.selected = card;
            card.selected = true;
        } else if (this.state.selected === card) {
            // 取消选择
            card.selected = false;
            this.state.selected = null;
        } else if (this.state.selected.type === card.type) {
            // 匹配成功
            this.state.selected.visible = false;
            card.visible = false;
            this.state.selected.selected = false;
            this.state.selected = null;
            this.state.score += 10;
            this.state.moves--;
            
            // 更新blocked状态
            this.updateBlockedStatus();
            
            // 检查游戏是否结束
            this.checkGameOver();
        } else {
            // 不匹配
            this.state.selected.selected = false;
            this.state.selected = null;
            this.state.moves--;
            
            // 检查游戏是否结束
            this.checkGameOver();
        }
    }
    
    checkGameOver() {
        if (this.state.moves <= 0) {
            this.state.gameOver = true;
            this.showGameOver();
            return;
        }
        
        // 检查是否还有可消除的卡片
        const visibleCards = this.state.cards.filter(card => card.visible && !card.blocked);
        const types = new Set(visibleCards.map(card => card.type));
        let hasMatch = false;
        
        types.forEach(type => {
            const sameTypeCards = visibleCards.filter(card => card.type === type);
            if (sameTypeCards.length >= 2) {
                hasMatch = true;
            }
        });
        
        if (!hasMatch) {
            this.state.gameOver = true;
            this.showGameOver();
        }
    }
    
    showGameOver() {
        wx.showModal({
            title: '游戏结束',
            content: `得分: ${this.state.score}`,
            confirmText: '再来一局',
            success: (res) => {
                if (res.confirm) {
                    this.init();
                    this.state.gameOver = false;
                    this.state.score = 0;
                    this.state.moves = 30;
                }
            }
        });
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制卡片
        this.state.cards.forEach(card => {
            if (!card.visible) return;
            
            // 绘制卡片背景
            this.ctx.fillStyle = card.blocked ? 'rgba(200, 200, 200, 0.5)' : 
                                card.selected ? 'rgba(255, 215, 0, 0.3)' : 
                                'rgba(255, 255, 255, 0.9)';
            this.ctx.strokeStyle = card.selected ? '#FFD700' : '#A0A0A0';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.roundRect(card.x, card.y, card.width, card.height, 10);
            this.ctx.fill();
            this.ctx.stroke();
            
            // 绘制猫咪图标
            const icons = ['😺', '😸', '😹', '😻', '😼', '😽'];
            this.ctx.font = `${card.width * 0.5}px Arial`;
            this.ctx.fillStyle = '#5C4033';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(icons[card.type], 
                            card.x + card.width/2, 
                            card.y + card.height/2);
        });
        
        // 绘制得分和剩余步数
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#5C4033';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`得分: ${this.state.score}`, 10, 30);
        this.ctx.fillText(`步数: ${this.state.moves}`, 10, 60);
    }
}

module.exports = {
    CatLinkGame
}; 