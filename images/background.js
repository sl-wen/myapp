// 创建临时画布
const tempCanvas = wx.createCanvas();
const ctx = tempCanvas.getContext('2d');

// 设置画布尺寸
tempCanvas.width = 375;  // iPhone 8 尺寸
tempCanvas.height = 667;

// 绘制渐变背景
const gradient = ctx.createLinearGradient(0, 0, 0, tempCanvas.height);
gradient.addColorStop(0, '#FFE4E1');  // 淡粉色
gradient.addColorStop(1, '#FFF0F5');  // 淡紫色
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

// 绘制地板
ctx.fillStyle = '#F5F5F5';
ctx.fillRect(0, tempCanvas.height - 150, tempCanvas.width, 150);

// 绘制装饰物
// 窗户
ctx.fillStyle = '#87CEEB';
ctx.fillRect(50, 50, 100, 150);
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 5;
ctx.strokeRect(50, 50, 100, 150);

// 猫爬架
ctx.fillStyle = '#DEB887';
ctx.fillRect(250, 200, 80, 300);

// 猫窝
ctx.beginPath();
ctx.arc(290, 180, 40, 0, Math.PI * 2);
ctx.fillStyle = '#FFB6C1';
ctx.fill();

// 将画布内容保存为文件
try {
    const tempFilePath = wx.canvasToTempFilePathSync({
        canvas: tempCanvas,
        x: 0,
        y: 0,
        width: tempCanvas.width,
        height: tempCanvas.height,
        destWidth: tempCanvas.width,
        destHeight: tempCanvas.height
    });
    
    const fs = wx.getFileSystemManager();
    fs.copyFileSync(tempFilePath, `${wx.env.USER_DATA_PATH}/background.png`);
    
    console.log('背景图片生成成功');
} catch (error) {
    console.error('背景图片生成失败:', error);
}

// 清理临时画布
tempCanvas.width = 0;
tempCanvas.height = 0; 