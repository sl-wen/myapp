// 道具类型枚举
export const ItemType = {
    FOOD: 'food',
    TOY: 'toy',
    DECORATION: 'decoration',
    EXP: 'exp'
};

// 道具基类
export class Item {
    constructor(id, name, type, cost, description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.cost = cost;
        this.description = description;
        this.quantity = 0;
    }
}

// 食物类道具
export class Food extends Item {
    constructor(id, name, cost, energyValue, happinessValue, description) {
        super(id, name, ItemType.FOOD, cost, description);
        this.energyValue = energyValue;
        this.happinessValue = happinessValue;
    }
}

// 经验道具类
export class ExpItem extends Item {
    constructor(id, name, cost, expValue, description) {
        super(id, name, ItemType.EXP, cost, description);
        this.expValue = expValue;
    }
}

// 预定义道具列表
export const ITEMS = {
    basicFood: new Food(
        'basicFood',
        '普通猫粮',
        100,
        20,  // 能量值
        5,   // 幸福度
        '补充一些能量'
    ),
    premiumFood: new Food(
        'premiumFood',
        '高级猫粮',
        200,
        40,  // 能量值
        10,  // 幸福度
        '补充大量能量'
    ),
    snack: new Food(
        'snack',
        '猫零食',
        50,
        5,   // 能量值
        15,  // 幸福度
        '提供少量能量但增加较多幸福度'
    ),
    basicExp: new ExpItem(
        'basicExp',
        '初级经验书',
        150,
        50,  // 经验值
        '增加50点经验值'
    ),
    advancedExp: new ExpItem(
        'advancedExp',
        '高级经验书',
        300,
        120, // 经验值
        '增加120点经验值'
    ),
    masterExp: new ExpItem(
        'masterExp',
        '大师经验书',
        500,
        200, // 经验值
        '增加200点经验值'
    )
}; 