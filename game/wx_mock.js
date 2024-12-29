// 模拟微信小游戏API
window.wx = {
    showToast: function(options) {
        console.log('[Toast]', options.title);
        // 创建一个临时的toast元素
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '50%';
        toast.style.left = '50%';
        toast.style.transform = 'translate(-50%, -50%)';
        toast.style.padding = '10px 20px';
        toast.style.background = 'rgba(0, 0, 0, 0.7)';
        toast.style.color = 'white';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '10000';
        toast.textContent = options.title;
        
        document.body.appendChild(toast);
        
        // 设置定时器移除toast
        setTimeout(() => {
            document.body.removeChild(toast);
            if (options.success) options.success();
        }, options.duration || 1500);
    },
    
    showModal: function(options) {
        console.log('[Modal]', options.title, options.content);
        const result = confirm(options.content);
        if (options.success) {
            options.success({ confirm: result });
        }
    },
    
    showActionSheet: function(options) {
        console.log('[ActionSheet]', options.itemList);
        
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '9999';
        
        // 创建列表容器
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.bottom = '0';
        container.style.left = '0';
        container.style.width = '100%';
        container.style.background = 'white';
        container.style.borderTopLeftRadius = '12px';
        container.style.borderTopRightRadius = '12px';
        container.style.padding = '10px';
        container.style.zIndex = '10000';
        container.style.maxHeight = '70vh';
        container.style.overflowY = 'auto';
        
        // 添加标题
        const title = document.createElement('div');
        title.style.textAlign = 'center';
        title.style.padding = '10px';
        title.style.fontWeight = 'bold';
        title.style.borderBottom = '1px solid #eee';
        title.textContent = '请选择商品';
        container.appendChild(title);
        
        // 添加选项
        options.itemList.forEach((item, index) => {
            const button = document.createElement('div');
            button.style.padding = '15px';
            button.style.borderBottom = '1px solid #eee';
            button.style.cursor = 'pointer';
            button.textContent = item;
            button.style.transition = 'background-color 0.2s';
            
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#f5f5f5';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = 'white';
            });
            
            button.addEventListener('click', () => {
                document.body.removeChild(overlay);
                if (options.success) {
                    options.success({ tapIndex: index });
                }
            });
            
            container.appendChild(button);
        });
        
        // 添加取消按钮
        const cancelButton = document.createElement('div');
        cancelButton.style.padding = '15px';
        cancelButton.style.textAlign = 'center';
        cancelButton.style.color = '#999';
        cancelButton.style.borderTop = '8px solid #f5f5f5';
        cancelButton.style.cursor = 'pointer';
        cancelButton.textContent = '取消';
        
        cancelButton.addEventListener('mouseover', () => {
            cancelButton.style.backgroundColor = '#f5f5f5';
        });
        
        cancelButton.addEventListener('mouseout', () => {
            cancelButton.style.backgroundColor = 'white';
        });
        
        cancelButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        container.appendChild(cancelButton);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // 点击遮罩层关闭
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    },
    
    setStorageSync: function(key, data) {
        console.log('[Storage] 保存数据:', key, data);
        localStorage.setItem(key, JSON.stringify(data));
    },
    
    getStorageSync: function(key) {
        const data = localStorage.getItem(key);
        console.log('[Storage] 读取数据:', key, data);
        return data ? JSON.parse(data) : null;
    }
}; 