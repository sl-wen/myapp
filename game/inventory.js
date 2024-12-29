import { ITEMS } from './items/items.js';

export class Inventory {
    constructor() {
        this.items = {};
        this.capacity = 100;
        
        // 初始化背包，添加一些默认道具
        this.addItem('fish', 5);         // 小鱼干
        this.addItem('cat_food', 2);     // 普通猫粮
        this.addItem('premium_cat_food', 1);  // 高级猫粮
    }
    
    addItem(itemId, quantity = 1) {
        if (!ITEMS[itemId]) {
            console.error('无效的道具ID:', itemId);
            return false;
        }
        
        if (!this.items[itemId]) {
            this.items[itemId] = {
                ...ITEMS[itemId],
                quantity: 0
            };
        }
        
        this.items[itemId].quantity += quantity;
        return true;
    }
    
    removeItem(itemId, quantity = 1) {
        if (!this.items[itemId] || this.items[itemId].quantity < quantity) {
            return false;
        }
        
        this.items[itemId].quantity -= quantity;
        if (this.items[itemId].quantity <= 0) {
            delete this.items[itemId];
        }
        return true;
    }
    
    getItemsByType(type) {
        return Object.values(this.items).filter(item => item.type === type);
    }
    
    useItem(itemId) {
        return this.removeItem(itemId, 1);
    }
    
    toJSON() {
        return {
            items: this.items,
            capacity: this.capacity
        };
    }
    
    fromJSON(data) {
        this.items = data.items || {};
        this.capacity = data.capacity || 100;
    }
} 