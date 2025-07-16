const Player = require('../src/player');
const { Item } = require('../src/item');

describe('Equipment System', () => {
  let player;
  let weapon;
  let armor;
  let betterWeapon;
  let betterArmor;

  beforeEach(() => {
    player = new Player();
    
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

    betterWeapon = new Item({
      id: 'iron_sword',
      name: 'てつのつるぎ',
      type: 'weapon',
      attack: 5,
      defense: 0,
      price: 450
    });

    betterArmor = new Item({
      id: 'chain_mail',
      name: 'くさりかたびら',
      type: 'armor',
      attack: 0,
      defense: 4,
      price: 500
    });
  });

  describe('equipWeapon', () => {
    test('should equip weapon and increase attack stat', () => {
      const baseAttack = player.attack;
      
      const result = player.equipWeapon(weapon);
      
      expect(result.success).toBe(true);
      expect(result.previousWeapon).toBe(null);
      expect(player.weapon).toBe(weapon);
      expect(player.attack).toBe(baseAttack + weapon.attack);
    });

    test('should replace existing weapon and adjust stats correctly', () => {
      // Equip first weapon
      player.equipWeapon(weapon);
      const attackWithFirstWeapon = player.attack;
      
      // Equip better weapon
      const result = player.equipWeapon(betterWeapon);
      
      expect(result.success).toBe(true);
      expect(result.previousWeapon).toBe(weapon);
      expect(player.weapon).toBe(betterWeapon);
      expect(player.attack).toBe(attackWithFirstWeapon - weapon.attack + betterWeapon.attack);
    });

    test('should reject non-weapon items', () => {
      const result = player.equipWeapon(armor);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Item is not a weapon');
      expect(player.weapon).toBe(null);
    });

    test('should handle null weapon input', () => {
      const result = player.equipWeapon(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid item');
      expect(player.weapon).toBe(null);
    });
  });

  describe('equipArmor', () => {
    test('should equip armor and increase defense stat', () => {
      const baseDefense = player.defense;
      
      const result = player.equipArmor(armor);
      
      expect(result.success).toBe(true);
      expect(result.previousArmor).toBe(null);
      expect(player.armor).toBe(armor);
      expect(player.defense).toBe(baseDefense + armor.defense);
    });

    test('should replace existing armor and adjust stats correctly', () => {
      // Equip first armor
      player.equipArmor(armor);
      const defenseWithFirstArmor = player.defense;
      
      // Equip better armor
      const result = player.equipArmor(betterArmor);
      
      expect(result.success).toBe(true);
      expect(result.previousArmor).toBe(armor);
      expect(player.armor).toBe(betterArmor);
      expect(player.defense).toBe(defenseWithFirstArmor - armor.defense + betterArmor.defense);
    });

    test('should reject non-armor items', () => {
      const result = player.equipArmor(weapon);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Item is not armor');
      expect(player.armor).toBe(null);
    });

    test('should handle null armor input', () => {
      const result = player.equipArmor(null);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid item');
      expect(player.armor).toBe(null);
    });
  });

  describe('unequipWeapon', () => {
    test('should unequip weapon and reduce attack stat', () => {
      // First equip a weapon
      player.equipWeapon(weapon);
      const attackWithWeapon = player.attack;
      
      const result = player.unequipWeapon();
      
      expect(result.success).toBe(true);
      expect(result.unequippedWeapon).toBe(weapon);
      expect(player.weapon).toBe(null);
      expect(player.attack).toBe(attackWithWeapon - weapon.attack);
    });

    test('should handle unequipping when no weapon is equipped', () => {
      const result = player.unequipWeapon();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No weapon equipped');
      expect(player.weapon).toBe(null);
    });
  });

  describe('unequipArmor', () => {
    test('should unequip armor and reduce defense stat', () => {
      // First equip armor
      player.equipArmor(armor);
      const defenseWithArmor = player.defense;
      
      const result = player.unequipArmor();
      
      expect(result.success).toBe(true);
      expect(result.unequippedArmor).toBe(armor);
      expect(player.armor).toBe(null);
      expect(player.defense).toBe(defenseWithArmor - armor.defense);
    });

    test('should handle unequipping when no armor is equipped', () => {
      const result = player.unequipArmor();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No armor equipped');
      expect(player.armor).toBe(null);
    });
  });

  describe('getTotalAttack', () => {
    test('should return base attack when no weapon equipped', () => {
      const baseAttack = 4; // Player's base attack
      expect(player.getTotalAttack()).toBe(baseAttack);
    });

    test('should return base attack plus weapon attack when weapon equipped', () => {
      const baseAttack = 4;
      player.equipWeapon(weapon);
      
      expect(player.getTotalAttack()).toBe(baseAttack + weapon.attack);
    });
  });

  describe('getTotalDefense', () => {
    test('should return base defense when no armor equipped', () => {
      const baseDefense = 2; // Player's base defense
      expect(player.getTotalDefense()).toBe(baseDefense);
    });

    test('should return base defense plus armor defense when armor equipped', () => {
      const baseDefense = 2;
      player.equipArmor(armor);
      
      expect(player.getTotalDefense()).toBe(baseDefense + armor.defense);
    });
  });

  describe('getEquipmentInfo', () => {
    test('should return equipment information', () => {
      player.equipWeapon(weapon);
      player.equipArmor(armor);
      
      const info = player.getEquipmentInfo();
      
      expect(info.weapon).toBe(weapon);
      expect(info.armor).toBe(armor);
      expect(info.totalAttackBonus).toBe(weapon.attack);
      expect(info.totalDefenseBonus).toBe(armor.defense);
    });

    test('should handle no equipment', () => {
      const info = player.getEquipmentInfo();
      
      expect(info.weapon).toBe(null);
      expect(info.armor).toBe(null);
      expect(info.totalAttackBonus).toBe(0);
      expect(info.totalDefenseBonus).toBe(0);
    });
  });
});