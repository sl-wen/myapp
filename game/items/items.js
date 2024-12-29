// 道具类型枚举
export const ItemType = {
    FOOD: 'food',
    SPECIAL: 'special'
};

// 预定义道具列表
export const ITEMS = {
    'food_1': {
        id: 'food_1',
        type: ItemType.FOOD,
        name: '小鱼干',
        description: '猫咪最爱的零食',
        cost: 10,
        satietyValue: 10,  // 增加10点饱食度
        happinessValue: 5, // 增加5点幸福度
        expValue: 5,       // 增加5点经验
        stackable: true
    },
    'food_2': {
        id: 'food_2',
        type: ItemType.FOOD,
        name: '猫粮',
        description: '普通的猫粮',
        cost: 20,
        satietyValue: 25,  // 增加25点饱食度
        happinessValue: 10, // 增加10点幸福度
        expValue: 10,       // 增加10点经验
        stackable: true
    },
    'food_3': {
        id: 'food_3',
        type: ItemType.FOOD,
        name: '高级猫粮',
        description: '营养丰富的猫粮',
        cost: 50,
        satietyValue: 50,  // 增加50点饱食度
        happinessValue: 20, // 增加20点幸福度
        expValue: 20,       // 增加20点经验
        stackable: true
    },
    'food_4': {
        id: 'food_4',
        type: ItemType.FOOD,
        name: '罐头',
        description: '美味的猫罐头',
        cost: 80,
        satietyValue: 30,  // 增加30点饱食度
        happinessValue: 40, // 增加40点幸福度
        expValue: 30,       // 增加30点经验
        stackable: true
    },
    'food_5': {
        id: 'food_5',
        type: ItemType.FOOD,
        name: '三文鱼',
        description: '高级食材，营养丰富',
        cost: 100,
        satietyValue: 40,  // 增加40点饱食度
        happinessValue: 50, // 增加50点幸福度
        expValue: 40,       // 增加40点经验
        stackable: true
    }
}; 