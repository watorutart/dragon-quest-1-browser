const Item = require('../src/item');

describe('Item', () => {
  describe('constructor', () => {
    test('should create item with basic properties', () => {
      const itemData = {
        id: 'copper_sword',
        name: 'どうのつるぎ',
        type: 'weapon',
        attack: 2,
        defense: 0,
        price: 180,
        description: '銅でできた剣'
      };

      const item = new Item(itemData);

      expect(item.id).toBe('copper_sword');
      expect(item.name).toBe('どうのつるぎ');
      expect(item.type).toBe('weapon');
      expect(item.attack).toBe(2);
      expect(item.defense).toBe(0);
      expect(item.price).toBe(180);
      expect(item.description).toBe('銅でできた剣');
    });

    test('should create armor item with defense stats', () => {
      const armorData = {
        id: 'leather_armor',
        name: 'かわのよろい',
        type: 'armor',
        attack: 0,
        defense: 2,
        price: 300,
        description: '革でできた鎧'
      };

      const armor = new Item(armorData);

      expect(armor.type).toBe('armor');
      expect(armor.defense).toBe(2);
      expect(armor.attack).toBe(0);
    });

    test('should throw error for invalid item data', () => {
      expect(() => {
        new Item({});
      }).toThrow('Item requires id, name, and type');

      expect(() => {
        new Item({ id: 'test' });
      }).toThrow('Item requires id, name, and type');
    });
  });

  describe('isWeapon', () => {
    test('should return true for weapon type items', () => {
      const weapon = new Item({
        id: 'sword',
        name: 'つるぎ',
        type: 'weapon',
        attack: 5,
        defense: 0,
        price: 100
      });

      expect(weapon.isWeapon()).toBe(true);
    });

    test('should return false for non-weapon items', () => {
      const armor = new Item({
        id: 'armor',
        name: 'よろい',
        type: 'armor',
        attack: 0,
        defense: 3,
        price: 200
      });

      expect(armor.isWeapon()).toBe(false);
    });
  });

  describe('isArmor', () => {
    test('should return true for armor type items', () => {
      const armor = new Item({
        id: 'armor',
        name: 'よろい',
        type: 'armor',
        attack: 0,
        defense: 3,
        price: 200
      });

      expect(armor.isArmor()).toBe(true);
    });

    test('should return false for non-armor items', () => {
      const weapon = new Item({
        id: 'sword',
        name: 'つるぎ',
        type: 'weapon',
        attack: 5,
        defense: 0,
        price: 100
      });

      expect(weapon.isArmor()).toBe(false);
    });
  });

  describe('isConsumable', () => {
    test('should return true for consumable type items', () => {
      const consumable = new Item({
        id: 'herb',
        name: 'やくそう',
        type: 'consumable',
        attack: 0,
        defense: 0,
        price: 8
      });

      expect(consumable.isConsumable()).toBe(true);
    });

    test('should return false for non-consumable items', () => {
      const weapon = new Item({
        id: 'sword',
        name: 'つるぎ',
        type: 'weapon',
        attack: 5,
        defense: 0,
        price: 100
      });

      expect(weapon.isConsumable()).toBe(false);
    });
  });

  describe('getStatBonus', () => {
    test('should return attack bonus for weapons', () => {
      const weapon = new Item({
        id: 'strong_sword',
        name: 'つよいつるぎ',
        type: 'weapon',
        attack: 10,
        defense: 0,
        price: 500
      });

      expect(weapon.getStatBonus('attack')).toBe(10);
      expect(weapon.getStatBonus('defense')).toBe(0);
    });

    test('should return defense bonus for armor', () => {
      const armor = new Item({
        id: 'strong_armor',
        name: 'つよいよろい',
        type: 'armor',
        attack: 0,
        defense: 8,
        price: 600
      });

      expect(armor.getStatBonus('defense')).toBe(8);
      expect(armor.getStatBonus('attack')).toBe(0);
    });

    test('should return 0 for invalid stat', () => {
      const item = new Item({
        id: 'test',
        name: 'テスト',
        type: 'weapon',
        attack: 5,
        defense: 0,
        price: 100
      });

      expect(item.getStatBonus('invalid')).toBe(0);
    });
  });

  describe('canAfford', () => {
    test('should return true when player has enough gold', () => {
      const item = new Item({
        id: 'cheap_item',
        name: 'やすいもの',
        type: 'weapon',
        attack: 1,
        defense: 0,
        price: 50
      });

      expect(item.canAfford(100)).toBe(true);
      expect(item.canAfford(50)).toBe(true);
    });

    test('should return false when player does not have enough gold', () => {
      const item = new Item({
        id: 'expensive_item',
        name: 'たかいもの',
        type: 'weapon',
        attack: 10,
        defense: 0,
        price: 1000
      });

      expect(item.canAfford(500)).toBe(false);
      expect(item.canAfford(999)).toBe(false);
    });
  });

  describe('toString', () => {
    test('should return formatted string representation', () => {
      const item = new Item({
        id: 'test_item',
        name: 'テストアイテム',
        type: 'weapon',
        attack: 5,
        defense: 0,
        price: 200
      });

      expect(item.toString()).toBe('テストアイテム (weapon) - 200G');
    });
  });

  describe('static TYPES', () => {
    test('should have correct type constants', () => {
      expect(Item.TYPES.WEAPON).toBe('weapon');
      expect(Item.TYPES.ARMOR).toBe('armor');
      expect(Item.TYPES.CONSUMABLE).toBe('consumable');
    });
  });
});