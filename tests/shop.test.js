const Shop = require('../src/shop');
const Player = require('../src/player');
const { Item } = require('../src/item');

describe('Shop', () => {
  let shop;
  let player;
  let weapon;
  let armor;
  let expensiveItem;

  beforeEach(() => {
    // Create test items
    weapon = new Item({
      id: 'copper_sword',
      name: 'どうのつるぎ',
      type: 'weapon',
      attack: 2,
      defense: 0,
      price: 180
    });

    armor = new Item({
      id: 'leather_armor',
      name: 'かわのよろい',
      type: 'armor',
      attack: 0,
      defense: 2,
      price: 300
    });

    expensiveItem = new Item({
      id: 'legendary_sword',
      name: 'でんせつのつるぎ',
      type: 'weapon',
      attack: 50,
      defense: 0,
      price: 10000
    });

    // Create shop with inventory
    shop = new Shop({
      id: 'weapon_shop',
      name: '武器屋',
      type: 'weapon',
      inventory: [weapon, armor, expensiveItem]
    });

    // Create player with some gold
    player = new Player();
    player.gold = 500;
  });

  describe('constructor', () => {
    test('should create shop with basic properties', () => {
      expect(shop.id).toBe('weapon_shop');
      expect(shop.name).toBe('武器屋');
      expect(shop.type).toBe('weapon');
      expect(shop.inventory).toHaveLength(3);
    });

    test('should throw error for invalid shop data', () => {
      expect(() => {
        new Shop({});
      }).toThrow('Shop requires id, name, and type');

      expect(() => {
        new Shop({ id: 'test' });
      }).toThrow('Shop requires id, name, and type');
    });

    test('should create shop with empty inventory if not provided', () => {
      const emptyShop = new Shop({
        id: 'empty_shop',
        name: '空の店',
        type: 'general'
      });

      expect(emptyShop.inventory).toEqual([]);
    });
  });

  describe('getInventory', () => {
    test('should return all items in inventory', () => {
      const inventory = shop.getInventory();
      
      expect(inventory).toHaveLength(3);
      expect(inventory).toContain(weapon);
      expect(inventory).toContain(armor);
      expect(inventory).toContain(expensiveItem);
    });

    test('should return empty array for empty shop', () => {
      const emptyShop = new Shop({
        id: 'empty',
        name: '空',
        type: 'general'
      });

      expect(emptyShop.getInventory()).toEqual([]);
    });
  });

  describe('getAffordableItems', () => {
    test('should return items player can afford', () => {
      const affordable = shop.getAffordableItems(player);
      
      expect(affordable).toHaveLength(2);
      expect(affordable).toContain(weapon);
      expect(affordable).toContain(armor);
      expect(affordable).not.toContain(expensiveItem);
    });

    test('should return empty array if player cannot afford anything', () => {
      player.gold = 50;
      const affordable = shop.getAffordableItems(player);
      
      expect(affordable).toEqual([]);
    });

    test('should return all items if player is very rich', () => {
      player.gold = 50000;
      const affordable = shop.getAffordableItems(player);
      
      expect(affordable).toHaveLength(3);
    });
  });

  describe('hasItem', () => {
    test('should return true for items in inventory', () => {
      expect(shop.hasItem(weapon.id)).toBe(true);
      expect(shop.hasItem(armor.id)).toBe(true);
    });

    test('should return false for items not in inventory', () => {
      expect(shop.hasItem('nonexistent_item')).toBe(false);
    });
  });

  describe('getItem', () => {
    test('should return item by id', () => {
      const foundItem = shop.getItem(weapon.id);
      
      expect(foundItem).toBe(weapon);
    });

    test('should return null for non-existent item', () => {
      const foundItem = shop.getItem('nonexistent_item');
      
      expect(foundItem).toBe(null);
    });
  });

  describe('purchaseItem', () => {
    test('should successfully purchase affordable item', () => {
      const initialGold = player.gold;
      
      const result = shop.purchaseItem(player, weapon.id);
      
      expect(result.success).toBe(true);
      expect(result.item).toBe(weapon);
      expect(result.totalCost).toBe(weapon.price);
      expect(player.gold).toBe(initialGold - weapon.price);
    });

    test('should fail to purchase expensive item', () => {
      const initialGold = player.gold;
      
      const result = shop.purchaseItem(player, expensiveItem.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient gold');
      expect(player.gold).toBe(initialGold); // Gold should not change
    });

    test('should fail to purchase non-existent item', () => {
      const initialGold = player.gold;
      
      const result = shop.purchaseItem(player, 'nonexistent_item');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
      expect(player.gold).toBe(initialGold);
    });

    test('should handle null player', () => {
      const result = shop.purchaseItem(null, weapon.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid player');
    });
  });

  describe('purchaseAndEquip', () => {
    test('should purchase and equip weapon successfully', () => {
      const initialGold = player.gold;
      const initialAttack = player.attack;
      
      const result = shop.purchaseAndEquip(player, weapon.id);
      
      expect(result.success).toBe(true);
      expect(result.item).toBe(weapon);
      expect(result.equipped).toBe(true);
      expect(player.gold).toBe(initialGold - weapon.price);
      expect(player.weapon).toBe(weapon);
      expect(player.attack).toBe(initialAttack + weapon.attack);
    });

    test('should purchase and equip armor successfully', () => {
      const initialGold = player.gold;
      const initialDefense = player.defense;
      
      const result = shop.purchaseAndEquip(player, armor.id);
      
      expect(result.success).toBe(true);
      expect(result.item).toBe(armor);
      expect(result.equipped).toBe(true);
      expect(player.gold).toBe(initialGold - armor.price);
      expect(player.armor).toBe(armor);
      expect(player.defense).toBe(initialDefense + armor.defense);
    });

    test('should fail to purchase and equip expensive item', () => {
      const initialGold = player.gold;
      const initialAttack = player.attack;
      
      const result = shop.purchaseAndEquip(player, expensiveItem.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient gold');
      expect(player.gold).toBe(initialGold);
      expect(player.weapon).toBe(null);
      expect(player.attack).toBe(initialAttack);
    });

    test('should replace existing equipment when purchasing new item', () => {
      // First equip a basic weapon
      const basicWeapon = new Item({
        id: 'basic_sword',
        name: 'きほんのつるぎ',
        type: 'weapon',
        attack: 1,
        defense: 0,
        price: 50
      });
      
      player.equipWeapon(basicWeapon);
      const attackWithBasicWeapon = player.attack;
      
      // Purchase and equip better weapon
      const result = shop.purchaseAndEquip(player, weapon.id);
      
      expect(result.success).toBe(true);
      expect(result.previousEquipment).toBe(basicWeapon);
      expect(player.weapon).toBe(weapon);
      expect(player.attack).toBe(attackWithBasicWeapon - basicWeapon.attack + weapon.attack);
    });
  });

  describe('getShopInfo', () => {
    test('should return shop information', () => {
      const info = shop.getShopInfo();
      
      expect(info.id).toBe(shop.id);
      expect(info.name).toBe(shop.name);
      expect(info.type).toBe(shop.type);
      expect(info.itemCount).toBe(3);
    });
  });
});