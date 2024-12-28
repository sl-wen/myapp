import { MainScene } from './scenes/main'

class Game {
    constructor() {
        console.log('开始初始化游戏...');
        
        // 初始化游戏画布
        try {
            this.canvas = wx.createCanvas();
            console.log('画布创建成功');
            
            this.ctx = this.canvas.getContext('2d');
            console.log('画布上下文获取成功');
            
            // 获取系统信息
            this.systemInfo = wx.getSystemInfoSync();
            console.log('系统信息:', this.systemInfo);
            
            this.canvas.width = this.systemInfo.windowWidth;
            this.canvas.height = this.systemInfo.windowHeight;
            console.log(`画布尺寸设置完成: ${this.canvas.width}x${this.canvas.height}`);
            
            // 初始化场景管理
            this.currentScene = null;
            
            // 初始化资源管理
            this.resources = {};
            
            // 立即绘制白色背景，避免黑屏
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 启动游戏
            this.init();
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showErrorScreen('游戏初始化失败: ' + error.message);
        }
    }
    
    async init() {
        try {
            console.log('开始初始化游戏...');
            
            // 显示加载画面
            this.showLoadingScreen('正在加载游戏资源...');
            
            // 加载图片资源
            await this.loadResources();
            console.log('资源加载完成');
            
            // 加载主场景
            this.loadScene(new MainScene(this));
            console.log('主场景加载完成');
            
            // 开始游戏循环
            this.gameLoop();
            console.log('游戏循环启动成功');
            
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showErrorScreen(error.message || '游戏加载失败，请重试');
        }
    }
    
    async loadResources() {
        try {
            // 显示加载状态
            this.showLoadingScreen('正在加载游戏资源...');
            
            // 创建图片对象
            const backgroundImage = wx.createImage();
            const catImage = wx.createImage();
            
            // 加载图片
            await Promise.all([
                new Promise((resolve, reject) => {
                    backgroundImage.onload = () => {
                        console.log('背景图片加载成功');
                        resolve();
                    };
                    backgroundImage.onerror = () => {
                        console.error('背景图片加载失败');
                        reject(new Error('背景图片加载失败'));
                    };
                    backgroundImage.src = 'images/background.png';
                }),
                new Promise((resolve, reject) => {
                    catImage.onload = () => {
                        console.log('猫咪图片加载成功');
                        resolve();
                    };
                    catImage.onerror = () => {
                        console.error('猫咪图片加载失败');
                        reject(new Error('猫咪图片加载失败'));
                    };
                    catImage.src = 'images/cat.png';
                })
            ]);
            
            // 保存资源引用
            this.resources = {
                background: backgroundImage,
                cat: catImage
            };
            
            console.log('所有资源加载完成');
            
        } catch (error) {
            console.error('资源加载失败:', error);
            throw error;
        }
    }
    
    loadScene(scene) {
        this.currentScene = scene;
        this.currentScene.init();
    }
    
    gameLoop() {
        console.log('游戏循环开始');
        let frameCount = 0;
        let lastTime = Date.now();
        let fps = 0;
        
        const loop = () => {
            try {
                frameCount++;
                
                // 计算FPS
                const currentTime = Date.now();
                if (currentTime - lastTime >= 1000) {
                    fps = frameCount;
                    frameCount = 0;
                    lastTime = currentTime;
                    console.log(`游戏运行中 - FPS: ${fps}`);
                }
                
                // 清空画布
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // 更新当前场景
                if (this.currentScene) {
                    // 先更新场景状态
                    this.currentScene.update();
                    
                    // 然后渲染场景
                    this.currentScene.render(this.ctx);
                } else {
                    // 如果没有场景，显示加载画面
                    this.showLoadingScreen('正在加载游戏...');
                    console.warn('当前场景为空');
                }
                
                // 继续下一帧
                requestAnimationFrame(loop);
            } catch (error) {
                console.error('游戏循环出错:', error);
                this.showErrorScreen('游戏运行出错: ' + error.message);
            }
        }
        
        loop();
    }
    
    showLoadingScreen(message) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    showErrorScreen(message) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
    }
}

// 启动游戏
new Game(); 