// 创建临时画布
const tempCanvas = wx.createCanvas();
const ctx = tempCanvas.getContext('2d');

// 获取系统信息
const systemInfo = wx.getSystemInfoSync();
const catSize = Math.min(systemInfo.windowWidth, systemInfo.windowHeight) * 0.2; // 屏幕较小边的20%

// 设置画布尺寸
tempCanvas.width = catSize;
tempCanvas.height = catSize;

// 缩放所有坐标
const scale = catSize / 120; // 原始设计是120px
const s = (size) => size * scale;

// 绘制猫咪身体（灰白色）
ctx.fillStyle = '#E0E0E0';  // 浅灰色
ctx.beginPath();
ctx.arc(s(60), s(60), s(45), 0, Math.PI * 2);  // 身体主体
ctx.fill();

// 绘制白色胸口
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.ellipse(s(60), s(65), s(25), s(30), 0, 0, Math.PI * 2);
ctx.fill();

// 绘制耳朵
// 左耳
ctx.fillStyle = '#E0E0E0';
ctx.beginPath();
ctx.moveTo(s(35), s(30));
ctx.lineTo(s(45), s(10));
ctx.lineTo(s(55), s(30));
ctx.fill();

// 右耳
ctx.beginPath();
ctx.moveTo(s(65), s(30));
ctx.lineTo(s(75), s(10));
ctx.lineTo(s(85), s(30));
ctx.fill();

// 耳朵深色部分
ctx.fillStyle = '#A0A0A0';
ctx.beginPath();
ctx.moveTo(s(40), s(25));
ctx.lineTo(s(45), s(15));
ctx.lineTo(s(50), s(25));
ctx.fill();

ctx.beginPath();
ctx.moveTo(s(70), s(25));
ctx.lineTo(s(75), s(15));
ctx.lineTo(s(80), s(25));
ctx.fill();

// 绘制眼睛
// 眼白
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.ellipse(s(45), s(50), s(10), s(8), 0, 0, Math.PI * 2);
ctx.ellipse(s(75), s(50), s(10), s(8), 0, 0, Math.PI * 2);
ctx.fill();

// 眼球
ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.ellipse(s(45), s(50), s(5), s(6), 0, 0, Math.PI * 2);
ctx.ellipse(s(75), s(50), s(5), s(6), 0, 0, Math.PI * 2);
ctx.fill();

// 眼睛高光
ctx.fillStyle = '#FFFFFF';
ctx.beginPath();
ctx.arc(s(43), s(48), s(2), 0, Math.PI * 2);
ctx.arc(s(73), s(48), s(2), 0, Math.PI * 2);
ctx.fill();

// 绘制鼻子
ctx.fillStyle = '#FFB6C1';  // 粉色
ctx.beginPath();
ctx.arc(s(60), s(60), s(3), 0, Math.PI * 2);
ctx.fill();

// 绘制微笑
ctx.strokeStyle = '#000000';
ctx.lineWidth = s(2);
ctx.beginPath();
ctx.arc(s(60), s(65), s(10), 0.1 * Math.PI, 0.9 * Math.PI);
ctx.stroke();

// 绘制胡须
ctx.strokeStyle = '#A0A0A0';
ctx.lineWidth = s(1);
// 左边胡须
ctx.beginPath();
ctx.moveTo(s(45), s(65));
ctx.lineTo(s(25), s(60));
ctx.moveTo(s(45), s(65));
ctx.lineTo(s(25), s(65));
ctx.moveTo(s(45), s(65));
ctx.lineTo(s(25), s(70));
// 右边胡须
ctx.moveTo(s(75), s(65));
ctx.lineTo(s(95), s(60));
ctx.moveTo(s(75), s(65));
ctx.lineTo(s(95), s(65));
ctx.moveTo(s(75), s(65));
ctx.lineTo(s(95), s(70));
ctx.stroke();

// 绘制条纹
ctx.strokeStyle = '#A0A0A0';
ctx.lineWidth = s(2);
// 额头条纹
ctx.beginPath();
ctx.moveTo(s(45), s(35));
ctx.quadraticCurveTo(s(60), s(30), s(75), s(35));
ctx.stroke();

// 导出为模块
export const catCanvas = tempCanvas; 