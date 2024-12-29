// 平台兼容层
export const platform = {
    // 存储相关
    setStorage(key, data) {
        try {
            if (typeof wx !== 'undefined') {
                wx.setStorageSync(key, data);
            } else {
                localStorage.setItem(key, JSON.stringify(data));
            }
            return true;
        } catch (error) {
            console.error('存储数据失败:', error);
            return false;
        }
    },

    getStorage(key) {
        try {
            if (typeof wx !== 'undefined') {
                return wx.getStorageSync(key);
            } else {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    },

    // 界面交互相关
    showToast(options) {
        if (typeof wx !== 'undefined') {
            wx.showToast(options);
        } else {
            const toast = document.createElement('div');
            toast.style.position = 'fixed';
            toast.style.top = '50%';
            toast.style.left = '50%';
            toast.style.transform = 'translate(-50%, -50%)';
            toast.style.padding = '10px 20px';
            toast.style.background = 'rgba(0,0,0,0.7)';
            toast.style.color = 'white';
            toast.style.borderRadius = '5px';
            toast.style.zIndex = '10000';
            toast.textContent = options.title;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), options.duration || 1500);
        }
    },

    showModal(options) {
        if (typeof wx !== 'undefined') {
            wx.showModal(options);
        } else {
            if (confirm(options.content)) {
                options.success?.({confirm: true});
            } else {
                options.success?.({confirm: false});
            }
        }
    },

    showActionSheet(options) {
        if (typeof wx !== 'undefined') {
            wx.showActionSheet(options);
        } else {
            const items = options.itemList.map((item, index) => `${index + 1}. ${item}`).join('\n');
            const selected = prompt(`请选择一个选项（输入数字）：\n${items}`);
            if (selected && !isNaN(selected)) {
                const index = parseInt(selected) - 1;
                if (index >= 0 && index < options.itemList.length) {
                    options.success?.({tapIndex: index});
                }
            }
        }
    },

    // 系统信息相关
    getSystemInfo() {
        if (typeof wx !== 'undefined') {
            return wx.getSystemInfoSync();
        } else {
            return {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                pixelRatio: window.devicePixelRatio || 1,
                platform: navigator.platform,
                language: navigator.language
            };
        }
    },

    // 图片加载相关
    createImage() {
        if (typeof wx !== 'undefined') {
            return wx.createImage();
        } else {
            return new Image();
        }
    }
}; 