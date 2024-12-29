import { MainScene } from '../scenes/main.js';
import './wx_mock.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resources = {};
        this.currentScene = null;
        this.lastFrameTime = 0;
        this.isRunning = false;
        
        // 绑定gameLoop，确保this指向正确
        this.gameLoop = this.gameLoop.bind(this);
    }
    
    async init() {
        console.log('初始化游戏...');
        try {
            // 加载资源
            await this.loadResources();
            
            // 创建并初始化主场景
            this.currentScene = new MainScene(this);
            await this.currentScene.init();
            
            console.log('游戏初始化完成');
        } catch (error) {
            console.error('游戏初始化失败:', error);
            throw error;
        }
    }
    
    async loadResources() {
        console.log('加载资源...');
        try {
            // 加载猫咪图片
            const catImage = new Image();
            catImage.src = 'assets/cat.png';  // 确保路径正确
            await new Promise((resolve, reject) => {
                catImage.onload = resolve;
                catImage.onerror = reject;
            });
            this.resources.cat = catImage;
            console.log('猫咪图片加载成功');
            
            // 加载背景图片
            const bgImage = new Image();
            bgImage.src = 'assets/background.png';  // 确保路径正确
            await new Promise((resolve, reject) => {
                bgImage.onload = resolve;
                bgImage.onerror = () => {
                    console.warn('背景图片加载失败，使用默认背景');
                    resolve();
                };
            });
            if (bgImage.complete) {
                this.resources.background = bgImage;
                console.log('背景图片加载成功');
            }
            
        } catch (error) {
            console.error('资源加载失败:', error);
            throw error;
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = performance.now();
            requestAnimationFrame(this.gameLoop);
            console.log('游戏启动');
        }
    }
    
    stop() {
        this.isRunning = false;
        console.log('游戏停止');
    }
    
    gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        // 计算帧间隔时间
        const deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        
        try {
            // 更新当前场景
            if (this.currentScene) {
                this.currentScene.update(deltaTime);
                this.currentScene.render();
            }
        } catch (error) {
            console.error('游戏循环错误:', error);
        }
        
        // 继续下一帧
        requestAnimationFrame(this.gameLoop);
    }
} 