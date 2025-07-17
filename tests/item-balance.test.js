const { Item, ItemType } = require('../src/item');
const Player = require('../src/player');

describe('Item Balance Tests', () => {
  let player;

  beforeEach(() => {
    player = new Player();
  });

  describe('Weapon Balance', () => {
    test('should have reasonable weapon progression and pricing', () => {
      // ひのきのぼう (Level 1)
      const club = new Item({
        id: 'club',
        name: 'ひのきのぼう',
        type: ItemType.WEAPON,
        attack: 2,
        price: 10
      });
      
      // どうのつるぎ (Level 3)
      const copperSword = new Item({
        id: 'copper-sword',
        name: 'どうのつるぎ',
        type: ItemType.WEAPON,
        attack: 10,
        price: 180
      });
      
      // はがねのつるぎ (Level 7)
      const steelSword = new Item({
        id: 'steel-sword',
        name: 'はがねのつるぎ',
        type: ItemType.WEAPON,
        attack: 20,
        price: 1500
      });
      
      // ろとのつるぎ (Level 15)
      const lotSword = new Item({
        id: 'lot-sword',
        name: 'ろとのつるぎ',
        type: ItemType.WEAPON,
        attack: 40,
        price: 9800
      });
      
      // 価格対効果の検証
      expect(club.attack / club.price).toBeCloseTo(0.2, 1);
      expect(copperSword.attack / copperSword.price).toBeCloseTo(0.056, 2);
      expect(steelSword.attack / steelSword.price).toBeCloseTo(0.013, 2);
      expect(lotSword.attack / lotSword.price).toBeCloseTo(0.004, 2);
    });

    test('should provide meaningful upgrades for player power', () => {
      const baseAttack = player.attack;
      
      const club = new Item({
        id: 'club',
        name: 'ひのきのぼう',
        type: ItemType.WEAPON,
        attack: 2,
        price: 10
      });
      
      player.equipWeapon(club);
      
      expect(player.getTotalAttack()).toBe(baseAttack + 2);
      expect(player.getTotalAttack() / baseAttack).toBeCloseTo(1.5, 1);
    });
  });

  describe('Armor Balance', () => {
    test('should have reasonable armor progression and pricing', () => {
      // かわのよろい (Level 1)
      const leather = new Item({
        id: 'leather',
        name: 'かわのよろい',
        type: ItemType.ARMOR,
        defense: 2,
        price: 60
      });
      
      // くさりかたびら (Level 4)
      const chain = new Item({
        id: 'chain',
        name: 'くさりかたびら',
        type: ItemType.ARMOR,
        defense: 6,
        price: 300
      });
      
      // てつのよろい (Level 8)
      const ironArmor = new Item({
        id: 'iron-armor',
        name: 'てつのよろい',
        type: ItemType.ARMOR,
        defense: 16,
        price: 1200
      });
      
      // はがねのよろい (Level 12)
      const steelArmor = new Item({
        id: 'steel-armor',
        name: 'はがねのよろい',
        type: ItemType.ARMOR,
        defense: 24,
        price: 3000
      });
      
      // 価格対効果の検証
      expect(leather.defense / leather.price).toBeCloseTo(0.033, 2);
      expect(chain.defense / chain.price).toBeCloseTo(0.02, 2);
      expect(ironArmor.defense / ironArmor.price).toBeCloseTo(0.013, 2);
      expect(steelArmor.defense / steelArmor.price).toBeCloseTo(0.008, 2);
    });
  });

  describe('Consumable Balance', () => {
    test('should have reasonable consumable pricing', () => {
      // やくそう (HP回復)
      const herb = new Item({
        id: 'herb',
        name: 'やくそう',
        type: ItemType.CONSUMABLE,
        healAmount: 30,
        price: 24
      });
      
      // どくけしそう (毒回復)
      const antidote = new Item({
        id: 'antidote',
        name: 'どくけしそう',
        type: ItemType.CONSUMABLE,
        curePoison: true,
        price: 10
      });
      
      // 価格対効果の検証
      expect(herb.healAmount / herb.price).toBeCloseTo(1.25, 2);
      expect(antidote.price).toBeLessThan(herb.price);
    });
  });

  describe('Economic Balance', () => {
    test('should require reasonable monster kills for item purchases', () => {
      const Monster = require('../src/monster');
      const slime = new Monster('slime');
      const orc = new Monster('orc');
      
      const copperSword = new Item({
        id: 'copper-sword',
        name: 'どうのつるぎ',
        type: ItemType.WEAPON,
        attack: 10,
        price: 180
      });
      
      // 序盤の武器は適度なモンスター討伐で購入可能
      const slimesNeeded = Math.ceil(copperSword.price / slime.gold);
      const orcsNeeded = Math.ceil(copperSword.price / orc.gold);
      
      expect(slimesNeeded).toBeLessThan(100);
      expect(orcsNeeded).toBeLessThan(20);
    });

    test('should have reasonable gold rewards vs item costs', () => {
      const Monster = require('../src/monster');
      const skeleton = new Monster('skeleton');
      
      const ironArmor = new Item({
        id: 'iron-armor',
        name: 'てつのよろい',
        type: ItemType.ARMOR,
        defense: 16,
        price: 1200
      });
      
      // 中級装備は中級モンスターの適度な討伐で購入可能
      const skeletonsNeeded = Math.ceil(ironArmor.price / skeleton.gold);
      expect(skeletonsNeeded).toBeLessThan(80);
    });
  });

  describe('Power Scaling', () => {
    test('should scale with player level appropriately', () => {
      // Level 5 player
      while (player.level < 5) {
        player.levelUp();
      }
      
      const level5Attack = player.attack;
      const level5Defense = player.defense;
      
      const midGameWeapon = new Item({
        id: 'steel-sword',
        name: 'はがねのつるぎ',
        type: ItemType.WEAPON,
        attack: 20,
        price: 1500
      });
      
      const midGameArmor = new Item({
        id: 'chain',
        name: 'くさりかたびら',
        type: ItemType.ARMOR,
        defense: 6,
        price: 300
      });
      
      // 武器の攻撃力がプレイヤーの基本攻撃力の2-3倍程度
      expect(midGameWeapon.attack / level5Attack).toBeGreaterThan(1.5);
      expect(midGameWeapon.attack / level5Attack).toBeLessThan(3);
      
      // 防具の防御力がプレイヤーの基本防御力の50%程度
      expect(midGameArmor.defense / level5Defense).toBeGreaterThan(0.4);
      expect(midGameArmor.defense / level5Defense).toBeLessThan(1);
    });
  });
});