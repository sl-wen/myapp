// 猫咪消除小游戏主页面
const GAME_CONFIG = {
    ROWS: 8,           // 游戏行数
    COLS: 8,           // 游戏列数
    TYPES: 6,          // 猫咪种类数
    MIN_MATCH: 3,      // 最小消除数量
    TILE_SIZE: 64,     // 方块大小
    ANIMATIONS: {
        POP: 300,      // 消除动画时长
        DROP: 500,     // 下落动画时长
        SWAP: 200      // 交换动画时长
    }
};

// 猫咪表情
const CAT_EMOJIS = ['😺', '😸', '😹', '😻', '😼', '😽'];

Page({
    data: {
        score: 0,          // 得分
        moves: 30,         // 剩余步数
        board: [],         // 游戏面板
        selected: null,    // 选中的方块
        isAnimating: false,// 是否正在播放动画
        gameOver: false    // 游戏是否结束
    },

    onLoad() {
        // 初始化游戏
        this.initGame();
    },

    onReady() {
        // 获取 canvas 上下文
        this.ctx = wx.createCanvasContext('gameCanvas');
        
        // 计算游戏区域大小和位置
        const systemInfo = wx.getSystemInfoSync();
        this.canvasWidth = systemInfo.windowWidth;
        this.canvasHeight = systemInfo.windowHeight;
        
        // 计算方块大小和游戏区域偏移
        this.tileSize = Math.min(
            this.canvasWidth / GAME_CONFIG.COLS,
            this.canvasHeight / GAME_CONFIG.ROWS
        );
        
        this.offsetX = (this.canvasWidth - this.tileSize * GAME_CONFIG.COLS) / 2;
        this.offsetY = (this.canvasHeight - this.tileSize * GAME_CONFIG.ROWS) / 2;
        
        // 开始游戏循环
        this.gameLoop();
    },

    initGame() {
        // 初始化游戏面板
        this.data.board = [];
        for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
            this.data.board[row] = [];
            for (let col = 0; col < GAME_CONFIG.COLS; col++) {
                this.data.board[row][col] = {
                    type: Math.floor(Math.random() * GAME_CONFIG.TYPES),
                    x: col * this.tileSize + this.offsetX,
                    y: row * this.tileSize + this.offsetY,
                    row: row,
                    col: col,
                    isMatched: false,
                    animation: null
                };
            }
        }
        
        // 检查并消除初始匹配
        while (this.findMatches().length > 0) {
            this.refillBoard();
        }
        
        this.setData({
            board: this.data.board,
            score: 0,
            moves: 30,
            gameOver: false
        });
    },

    gameLoop() {
        // 渲染游戏画面
        this.render();
        
        // 继续下一帧
        requestAnimationFrame(() => this.gameLoop());
    },

    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 绘制背景
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 绘制游戏面板
        for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
            for (let col = 0; col < GAME_CONFIG.COLS; col++) {
                const tile = this.data.board[row][col];
                if (!tile) continue;
                
                // 绘制方块背景
                this.ctx.fillStyle = tile.isMatched ? '#ffcccc' : '#ffffff';
                this.ctx.fillRect(
                    tile.x, tile.y,
                    this.tileSize, this.tileSize
                );
                
                // 绘制猫咪表情
                this.ctx.font = `${this.tileSize * 0.8}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#000000';
                this.ctx.fillText(
                    CAT_EMOJIS[tile.type],
                    tile.x + this.tileSize/2,
                    tile.y + this.tileSize/2
                );
                
                // 绘制选中效果
                if (this.data.selected && 
                    this.data.selected.row === row && 
                    this.data.selected.col === col) {
                    this.ctx.strokeStyle = '#ff0000';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(
                        tile.x, tile.y,
                        this.tileSize, this.tileSize
                    );
                }
            }
        }
        
        // 绘制分数和步数
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#000000';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`分数: ${this.data.score}`, 10, 30);
        this.ctx.fillText(`步数: ${this.data.moves}`, 10, 60);
        
        // 绘制游戏结束提示
        if (this.data.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            this.ctx.font = '48px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                '游戏结束',
                this.canvasWidth/2,
                this.canvasHeight/2
            );
            this.ctx.font = '24px Arial';
            this.ctx.fillText(
                `最终得分: ${this.data.score}`,
                this.canvasWidth/2,
                this.canvasHeight/2 + 40
            );
        }
        
        this.ctx.draw();
    },

    onTouchStart(e) {
        if (this.data.isAnimating || this.data.gameOver) return;
        
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const col = Math.floor((touch.clientX - rect.left - this.offsetX) / this.tileSize);
        const row = Math.floor((touch.clientY - rect.top - this.offsetY) / this.tileSize);
        
        // 检查是否点击在游戏区域内
        if (row < 0 || row >= GAME_CONFIG.ROWS || 
            col < 0 || col >= GAME_CONFIG.COLS) return;
        
        if (!this.data.selected) {
            // 选中第一个方块
            this.setData({
                selected: {row, col}
            });
        } else {
            // 检查是否相邻
            const rowDiff = Math.abs(row - this.data.selected.row);
            const colDiff = Math.abs(col - this.data.selected.col);
            if ((rowDiff === 1 && colDiff === 0) || 
                (rowDiff === 0 && colDiff === 1)) {
                // 尝试交换
                this.swapTiles(
                    this.data.selected.row, this.data.selected.col,
                    row, col
                );
            }
            // 取消选中
            this.setData({
                selected: null
            });
        }
    },

    async swapTiles(row1, col1, row2, col2) {
        // 交换方块
        const temp = this.data.board[row1][col1];
        this.data.board[row1][col1] = this.data.board[row2][col2];
        this.data.board[row2][col2] = temp;
        
        // 更新位置
        this.data.board[row1][col1].row = row1;
        this.data.board[row1][col1].col = col1;
        this.data.board[row2][col2].row = row2;
        this.data.board[row2][col2].col = col2;
        
        // 检查是否形成匹配
        const matches = this.findMatches();
        if (matches.length > 0) {
            // 消耗一步
            this.data.moves--;
            
            // 消除匹配的方块
            await this.removeMatches(matches);
            
            // 填充空缺
            await this.refillBoard();
            
            // 检查游戏是否结束
            if (this.data.moves <= 0) {
                this.data.gameOver = true;
                this.setData({gameOver: true});
            }
        } else {
            // 没有匹配，交换回来
            const temp = this.data.board[row1][col1];
            this.data.board[row1][col1] = this.data.board[row2][col2];
            this.data.board[row2][col2] = temp;
            
            // 更新位置
            this.data.board[row1][col1].row = row1;
            this.data.board[row1][col1].col = col1;
            this.data.board[row2][col2].row = row2;
            this.data.board[row2][col2].col = col2;
        }
        
        this.setData({
            board: this.data.board,
            moves: this.data.moves
        });
    },

    findMatches() {
        const matches = [];
        
        // 检查水平匹配
        for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
            let count = 1;
            let type = null;
            for (let col = 0; col < GAME_CONFIG.COLS; col++) {
                const current = this.data.board[row][col];
                if (current.type === type) {
                    count++;
                } else {
                    if (count >= GAME_CONFIG.MIN_MATCH) {
                        for (let i = 0; i < count; i++) {
                            matches.push({
                                row: row,
                                col: col - i - 1
                            });
                        }
                    }
                    count = 1;
                    type = current.type;
                }
            }
            if (count >= GAME_CONFIG.MIN_MATCH) {
                for (let i = 0; i < count; i++) {
                    matches.push({
                        row: row,
                        col: GAME_CONFIG.COLS - i - 1
                    });
                }
            }
        }
        
        // 检查垂直匹配
        for (let col = 0; col < GAME_CONFIG.COLS; col++) {
            let count = 1;
            let type = null;
            for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
                const current = this.data.board[row][col];
                if (current.type === type) {
                    count++;
                } else {
                    if (count >= GAME_CONFIG.MIN_MATCH) {
                        for (let i = 0; i < count; i++) {
                            matches.push({
                                row: row - i - 1,
                                col: col
                            });
                        }
                    }
                    count = 1;
                    type = current.type;
                }
            }
            if (count >= GAME_CONFIG.MIN_MATCH) {
                for (let i = 0; i < count; i++) {
                    matches.push({
                        row: GAME_CONFIG.ROWS - i - 1,
                        col: col
                    });
                }
            }
        }
        
        return matches;
    },

    async removeMatches(matches) {
        this.data.isAnimating = true;
        
        // 标记匹配的方块
        matches.forEach(match => {
            const tile = this.data.board[match.row][match.col];
            tile.isMatched = true;
        });
        
        // 更新分数
        this.data.score += matches.length * 10;
        this.setData({
            board: this.data.board,
            score: this.data.score
        });
        
        // 等待消除动画
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.ANIMATIONS.POP));
        
        // 移除匹配的方块
        matches.forEach(match => {
            this.data.board[match.row][match.col] = null;
        });
        
        this.data.isAnimating = false;
        this.setData({board: this.data.board});
    },

    async refillBoard() {
        this.data.isAnimating = true;
        
        // 下落现有方块
        for (let col = 0; col < GAME_CONFIG.COLS; col++) {
            let emptyRow = GAME_CONFIG.ROWS - 1;
            for (let row = GAME_CONFIG.ROWS - 1; row >= 0; row--) {
                if (!this.data.board[row][col]) {
                    continue;
                }
                if (row !== emptyRow) {
                    this.data.board[emptyRow][col] = this.data.board[row][col];
                    this.data.board[emptyRow][col].row = emptyRow;
                    this.data.board[row][col] = null;
                }
                emptyRow--;
            }
        }
        
        // 填充新方块
        for (let col = 0; col < GAME_CONFIG.COLS; col++) {
            for (let row = 0; row < GAME_CONFIG.ROWS; row++) {
                if (!this.data.board[row][col]) {
                    this.data.board[row][col] = {
                        type: Math.floor(Math.random() * GAME_CONFIG.TYPES),
                        x: col * this.tileSize + this.offsetX,
                        y: row * this.tileSize + this.offsetY,
                        row: row,
                        col: col,
                        isMatched: false,
                        animation: null
                    };
                }
            }
        }
        
        this.setData({board: this.data.board});
        
        // 等待下落动画
        await new Promise(resolve => setTimeout(resolve, GAME_CONFIG.ANIMATIONS.DROP));
        
        // 检查新的匹配
        const matches = this.findMatches();
        if (matches.length > 0) {
            await this.removeMatches(matches);
            await this.refillBoard();
        }
        
        this.data.isAnimating = false;
    },

    restartGame() {
        if (this.data.isAnimating) return;
        this.initGame();
    }
}); 