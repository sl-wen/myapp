// 创建临时画布
const tempCanvas = wx.createCanvas();
const ctx = tempCanvas.getContext('2d');

// 获取系统信息
const systemInfo = wx.getSystemInfoSync();
tempCanvas.width = systemInfo.windowWidth;
tempCanvas.height = systemInfo.windowHeight;

// 绘制木质背景
const gradient = ctx.createLinearGradient(0, 0, tempCanvas.width, 0);
gradient.addColorStop(0, '#B8733A');    // 深木色
gradient.addColorStop(0.3, '#CD853F');  // 中间色
gradient.addColorStop(0.7, '#CD853F');  // 中间色
gradient.addColorStop(1, '#B8733A');    // 深木色
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

// 绘制木纹理
const lineSpacing = 15; // 木纹间距
ctx.strokeStyle = 'rgba(139, 69, 19, 0.15)';
ctx.lineWidth = 1;

// 水平木纹
for (let y = 0; y < tempCanvas.height; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(tempCanvas.width, y);
    ctx.stroke();
}

// 添加一些随机的木纹纹理
ctx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
for (let i = 0; i < 50; i++) {
    const x = Math.random() * tempCanvas.width;
    const y = Math.random() * tempCanvas.height;
    const length = 20 + Math.random() * 50;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y + Math.random() * 2);
    ctx.stroke();
}

// 计算窗户尺寸和位置
const windowWidth = tempCanvas.width * 0.15;
const windowHeight = tempCanvas.height * 0.2;
const windowX = tempCanvas.width * 0.1;
const windowY = tempCanvas.height * 0.1;

// 绘制窗户阴影
ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
ctx.shadowBlur = 10;
ctx.shadowOffsetX = 2;
ctx.shadowOffsetY = 2;

// 窗户框
ctx.fillStyle = '#4A4A4A';
ctx.fillRect(windowX - 5, windowY - 5, windowWidth + 10, windowHeight + 10);

// 重置阴影
ctx.shadowColor = 'transparent';
ctx.shadowBlur = 0;
ctx.shadowOffsetX = 0;
ctx.shadowOffsetY = 0;

// 窗户玻璃
ctx.fillStyle = '#ADD8E6';  // 更柔和的蓝色
ctx.fillRect(windowX, windowY, windowWidth, windowHeight);

// 窗户装饰
ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(windowX + windowWidth/2, windowY);
ctx.lineTo(windowX + windowWidth/2, windowY + windowHeight);
ctx.moveTo(windowX, windowY + windowHeight/2);
ctx.lineTo(windowX + windowWidth, windowY + windowHeight/2);
ctx.stroke();

// 绘制底部UI区域
const uiHeight = tempCanvas.height * 0.25;
ctx.fillStyle = '#FFF8DC';  // 更温暖的米色
ctx.fillRect(0, tempCanvas.height - uiHeight, tempCanvas.width, uiHeight);

// 绘制分隔线
const gradientLine = ctx.createLinearGradient(0, tempCanvas.height - uiHeight - 2, 0, tempCanvas.height - uiHeight + 2);
gradientLine.addColorStop(0, 'rgba(139, 69, 19, 0)');
gradientLine.addColorStop(0.5, 'rgba(139, 69, 19, 0.3)');
gradientLine.addColorStop(1, 'rgba(139, 69, 19, 0)');
ctx.strokeStyle = gradientLine;
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(0, tempCanvas.height - uiHeight);
ctx.lineTo(tempCanvas.width, tempCanvas.height - uiHeight);
ctx.stroke();

// 导出为模块
export const backgroundCanvas = tempCanvas; 