// 道具类型枚举
export const ItemType = {
    FOOD: 'food',
    TOY: 'toy',
    SPECIAL: 'special'
};

// 预定义道具列表
export const ITEMS = {
    fish: {
        id: 'fish',
        type: ItemType.FOOD,
        name: '小鱼干',
        description: '猫咪最爱的零食，适量食用有助于保持好心情',
        cost: 30,
        satietyValue: 15,
        happinessValue: 15,
        expValue: 3,
        stackable: true
    },
    cat_food: {
        id: 'cat_food',
        type: ItemType.FOOD,
        name: '普通猫粮',
        description: '普通的猫粮，可以恢复少量饱食度和心情',
        cost: 50,
        satietyValue: 20,
        happinessValue: 10,
        expValue: 5,
        stackable: true
    },
    premium_cat_food: {
        id: 'premium_cat_food',
        type: ItemType.FOOD,
        name: '高级猫粮',
        description: '营养丰富的高级猫粮，可以恢复较多饱食度和心情',
        cost: 100,
        satietyValue: 40,
        happinessValue: 20,
        expValue: 10,
        stackable: true
    },
    canned_food: {
        id: 'canned_food',
        type: ItemType.FOOD,
        name: '猫罐头',
        description: '美味的猫罐头，能显著提升猫咪心情',
        cost: 80,
        satietyValue: 30,
        happinessValue: 40,
        expValue: 30,
        stackable: true
    },
    tuna: {
        id: 'tuna',
        type: ItemType.FOOD,
        name: '金枪鱼',
        description: '新鲜的金枪鱼，营养丰富，是猫咪的美味',
        cost: 150,
        satietyValue: 50,
        happinessValue: 30,
        expValue: 15,
        stackable: true
    }
}; 