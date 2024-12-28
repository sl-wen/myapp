// 创建临时画布
const tempCanvas = wx.createCanvas();
const ctx = tempCanvas.getContext('2d');

// 设置画布尺寸
tempCanvas.width = 120;
tempCanvas.height = 120;

// 绘制猫咪身体（灰白色）
ctx.fillStyle = '#E0E0E0';  // 浅灰色
ctx.beginPath();
ctx.arc(60, 60, 45, 0, Math.PI * 2);  // 身体主体
ctx.fill();

// 绘制白色胸口
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.ellipse(60, 65, 25, 30, 0, 0, Math.PI * 2);
ctx.fill();

// 绘制耳朵
// 左耳
ctx.fillStyle = '#E0E0E0';
ctx.beginPath();
ctx.moveTo(35, 30);
ctx.lineTo(45, 10);
ctx.lineTo(55, 30);
ctx.fill();

// 右耳
ctx.beginPath();
ctx.moveTo(65, 30);
ctx.lineTo(75, 10);
ctx.lineTo(85, 30);
ctx.fill();

// 耳朵深色部分
ctx.fillStyle = '#A0A0A0';
ctx.beginPath();
ctx.moveTo(40, 25);
ctx.lineTo(45, 15);
ctx.lineTo(50, 25);
ctx.fill();

ctx.beginPath();
ctx.moveTo(70, 25);
ctx.lineTo(75, 15);
ctx.lineTo(80, 25);
ctx.fill();

// 绘制眼睛
// 眼白
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.ellipse(45, 50, 10, 8, 0, 0, Math.PI * 2);
ctx.ellipse(75, 50, 10, 8, 0, 0, Math.PI * 2);
ctx.fill();

// 眼球
ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.ellipse(45, 50, 5, 6, 0, 0, Math.PI * 2);
ctx.ellipse(75, 50, 5, 6, 0, 0, Math.PI * 2);
ctx.fill();

// 眼睛高光
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.arc(43, 48, 2, 0, Math.PI * 2);
ctx.arc(73, 48, 2, 0, Math.PI * 2);
ctx.fill();

// 绘制鼻子
ctx.fillStyle = '#FFB6C1';  // 粉色
ctx.beginPath();
ctx.arc(60, 60, 3, 0, Math.PI * 2);
ctx.fill();

// 绘制微笑
ctx.strokeStyle = '#000000';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(60, 65, 10, 0.1 * Math.PI, 0.9 * Math.PI);
ctx.stroke();

// 绘制胡须
ctx.strokeStyle = '#A0A0A0';
ctx.lineWidth = 1;
// 左边胡须
ctx.beginPath();
ctx.moveTo(45, 65);
ctx.lineTo(25, 60);
ctx.moveTo(45, 65);
ctx.lineTo(25, 65);
ctx.moveTo(45, 65);
ctx.lineTo(25, 70);
// 右边胡须
ctx.moveTo(75, 65);
ctx.lineTo(95, 60);
ctx.moveTo(75, 65);
ctx.lineTo(95, 65);
ctx.moveTo(75, 65);
ctx.lineTo(95, 70);
ctx.stroke();

// 绘制条纹
ctx.strokeStyle = '#A0A0A0';
ctx.lineWidth = 2;
// 额头条纹
ctx.beginPath();
ctx.moveTo(45, 35);
ctx.quadraticCurveTo(60, 30, 75, 35);
ctx.stroke();

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
    fs.copyFileSync(tempFilePath, `${wx.env.USER_DATA_PATH}/cat.png`);
    
    console.log('猫咪图片生成成功');
} catch (error) {
    console.error('猫咪图片生成失败:', error);
}

// 清理临时画布
tempCanvas.width = 0;
tempCanvas.height = 0; 