class Item {
  static TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    CONSUMABLE: 'consumable'
  };

  constructor(itemData) {
    this._validateItemData(itemData);
    
    this.id = itemData.id;
    this.name = itemData.name;
    this.type = itemData.type;
    this.attack = itemData.attack || 0;
    this.defense = itemData.defense || 0;
    this.price = itemData.price || 0;
    this.description = itemData.description || '';
  }

  _validateItemData(itemData) {
    if (!itemData || typeof itemData !== 'object') {
      throw new Error('Item requires valid item data object');
    }
    
    const requiredFields = ['id', 'name', 'type'];
    const missingFields = requiredFields.filter(field => !itemData[field]);
    
    if (missingFields.length > 0) {
      throw new Error('Item requires id, name, and type');
    }
  }

  isWeapon() {
    return this.type === Item.TYPES.WEAPON;
  }

  isArmor() {
    return this.type === Item.TYPES.ARMOR;
  }

  isConsumable() {
    return this.type === Item.TYPES.CONSUMABLE;
  }

  getStatBonus(stat) {
    const validStats = ['attack', 'defense'];
    
    if (!validStats.includes(stat)) {
      return 0;
    }
    
    return this[stat] || 0;
  }

  canAfford(gold) {
    return gold >= this.price;
  }

  toString() {
    return `${this.name} (${this.type}) - ${this.price}G`;
  }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Item, ItemType };
}