class Shop {
  static SHOP_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ITEM: 'item',
    GENERAL: 'general'
  };

  constructor(shopData) {
    this._validateShopData(shopData);
    
    this.id = shopData.id;
    this.name = shopData.name;
    this.type = shopData.type;
    this.inventory = this._initializeInventory(shopData.inventory);
  }

  _validateShopData(shopData) {
    if (!shopData || typeof shopData !== 'object') {
      throw new Error('Shop requires valid shop data object');
    }
    
    const requiredFields = ['id', 'name', 'type'];
    const missingFields = requiredFields.filter(field => !shopData[field]);
    
    if (missingFields.length > 0) {
      throw new Error('Shop requires id, name, and type');
    }
  }

  _initializeInventory(inventory) {
    return Array.isArray(inventory) ? inventory : [];
  }

  getInventory() {
    return [...this.inventory]; // Return copy to prevent external modification
  }

  getAffordableItems(player) {
    if (!this._isValidPlayer(player)) {
      return [];
    }

    return this.inventory.filter(item => this._canPlayerAfford(player, item));
  }

  hasItem(itemId) {
    return this._findItemIndex(itemId) !== -1;
  }

  getItem(itemId) {
    const item = this.inventory.find(item => item.id === itemId);
    return item || null;
  }

  purchaseItem(player, itemId) {
    const validation = this._validatePurchase(player, itemId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const item = validation.item;
    
    // Process purchase
    const purchaseSuccess = player.spendGold(item.price);
    if (!purchaseSuccess) {
      return { success: false, error: 'Failed to process payment' };
    }

    return {
      success: true,
      item: item,
      totalCost: item.price
    };
  }

  purchaseAndEquip(player, itemId) {
    const validation = this._validatePurchase(player, itemId);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const item = validation.item;
    
    // Process purchase
    const purchaseSuccess = player.spendGold(item.price);
    if (!purchaseSuccess) {
      return { success: false, error: 'Failed to process payment' };
    }

    // Attempt to equip the item
    const equipmentResult = this._equipItem(player, item);

    return {
      success: true,
      item: item,
      equipped: equipmentResult.equipped,
      previousEquipment: equipmentResult.previousEquipment,
      totalCost: item.price,
      message: equipmentResult.message
    };
  }

  getShopInfo() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      itemCount: this.inventory.length
    };
  }

  // Private helper methods

  _isValidPlayer(player) {
    return player && typeof player === 'object' && typeof player.gold === 'number';
  }

  _canPlayerAfford(player, item) {
    return item && typeof item.canAfford === 'function' && item.canAfford(player.gold);
  }

  _findItemIndex(itemId) {
    return this.inventory.findIndex(item => item.id === itemId);
  }

  _validatePurchase(player, itemId) {
    if (!this._isValidPlayer(player)) {
      return { valid: false, error: 'Invalid player' };
    }

    const item = this.getItem(itemId);
    if (!item) {
      return { valid: false, error: 'Item not found' };
    }

    if (!this._canPlayerAfford(player, item)) {
      return { valid: false, error: 'Insufficient gold' };
    }

    return { valid: true, item: item };
  }

  _equipItem(player, item) {
    let equipResult;
    let previousEquipment = null;

    if (item.isWeapon()) {
      previousEquipment = player.weapon;
      equipResult = player.equipWeapon(item);
    } else if (item.isArmor()) {
      previousEquipment = player.armor;
      equipResult = player.equipArmor(item);
    } else {
      return {
        equipped: false,
        previousEquipment: null,
        message: 'Item purchased but cannot be equipped'
      };
    }

    return {
      equipped: equipResult.success,
      previousEquipment: previousEquipment,
      message: equipResult.success ? 'Item equipped successfully' : 'Failed to equip item'
    };
  }
}

module.exports = Shop;