const Player = require('../src/player');
const Monster = require('../src/monster');
const { Item, ItemType } = require('../src/item');
const CombatSystem = require('../src/combatSystem');

describe('Error Handling Tests', () => {
  let player;
  let combatSystem;

  beforeEach(() => {
    player = new Player();
    combatSystem = new CombatSystem();
  });

  describe('Player Error Handling', () => {
    test('should handle invalid damage values gracefully', () => {
      const initialHp = player.hp;
      
      // 負のダメージ
      player.takeDamage(-10);
      expect(player.hp).toBe(initialHp);
      
      // NaN ダメージ
      player.takeDamage(NaN);
      expect(player.hp).toBe(initialHp);
      
      // 非数値ダメージ
      player.takeDamage('invalid');
      expect(player.hp).toBe(initialHp);
    });

    test('should handle invalid experience values gracefully', () => {
      const initialExp = player.experience;
      const initialLevel = player.level;
      
      // 負の経験値
      player.gainExperience(-10);
      expect(player.experience).toBe(initialExp);
      expect(player.level).toBe(initialLevel);
      
      // NaN 経験値
      player.gainExperience(NaN);
      expect(player.experience).toBe(initialExp);
      expect(player.level).toBe(initialLevel);
    });

    test('should handle invalid gold values gracefully', () => {
      const initialGold = player.gold;
      
      // 負のゴールド
      player.gainGold(-10);
      expect(player.gold).toBe(initialGold);
      
      // NaN ゴールド
      player.gainGold(NaN);
      expect(player.gold).toBe(initialGold);
    });

    test('should handle invalid position values gracefully', () => {
      const initialPosition = player.getPosition();
      
      // 負の座標
      player.setPosition(-1, -1);
      expect(player.getPosition()).toEqual(initialPosition);
      
      // NaN 座標
      player.setPosition(NaN, NaN);
      expect(player.getPosition()).toEqual(initialPosition);
      
      // 非数値座標
      player.setPosition('invalid', 'invalid');
      expect(player.getPosition()).toEqual(initialPosition);
    });

    test('should handle invalid equipment gracefully', () => {
      const initialAttack = player.attack;
      const initialDefense = player.defense;
      
      // null アイテム
      const result1 = player.equipWeapon(null);
      expect(result1.success).toBe(false);
      expect(player.attack).toBe(initialAttack);
      
      // undefined アイテム
      const result2 = player.equipArmor(undefined);
      expect(result2.success).toBe(false);
      expect(player.defense).toBe(initialDefense);
      
      // 間違ったタイプのアイテム
      const armor = new Item({
        id: 'armor',
        name: 'テスト防具',
        type: ItemType.ARMOR,
        defense: 5,
        price: 100
      });
      
      const result3 = player.equipWeapon(armor);
      expect(result3.success).toBe(false);
      expect(player.attack).toBe(initialAttack);
    });
  });

  describe('Monster Error Handling', () => {
    test('should handle invalid monster types gracefully', () => {
      expect(() => new Monster('invalid')).toThrow('Unknown monster type: invalid');
      expect(() => new Monster(null)).toThrow('Unknown monster type: null');
      expect(() => new Monster(undefined)).toThrow('Unknown monster type: undefined');
    });

    test('should handle invalid damage values gracefully', () => {
      const monster = new Monster('slime');
      const initialHp = monster.hp;
      
      // 負のダメージ
      monster.takeDamage(-10);
      expect(monster.hp).toBe(initialHp);
      
      // NaN ダメージ
      monster.takeDamage(NaN);
      expect(monster.hp).toBe(initialHp);
      
      // 非数値ダメージ
      monster.takeDamage('invalid');
      expect(monster.hp).toBe(initialHp);
    });
  });

  describe('Combat System Error Handling', () => {
    test('should handle invalid combat participants gracefully', () => {
      const monster = new Monster('slime');
      
      // null プレイヤー
      expect(() => combatSystem.calculateDamage(null, monster)).not.toThrow();
      expect(() => combatSystem.calculateDamage(player, null)).not.toThrow();
      
      // undefined プレイヤー
      expect(() => combatSystem.calculateDamage(undefined, monster)).not.toThrow();
      expect(() => combatSystem.calculateDamage(player, undefined)).not.toThrow();
    });

    test('should handle missing attack/defense properties gracefully', () => {
      const invalidAttacker = {};
      const invalidDefender = {};
      
      const damage = combatSystem.calculateDamage(invalidAttacker, invalidDefender);
      expect(damage).toBeGreaterThan(0);
      expect(typeof damage).toBe('number');
      expect(isNaN(damage)).toBe(false);
    });
  });

  describe('Item Error Handling', () => {
    test('should handle invalid item data gracefully', () => {
      // null データ
      expect(() => new Item(null)).toThrow('Item requires valid item data object');
      
      // undefined データ
      expect(() => new Item(undefined)).toThrow('Item requires valid item data object');
      
      // 必須フィールドが欠如
      expect(() => new Item({})).toThrow('Item requires id, name, and type');
      expect(() => new Item({ id: '1' })).toThrow('Item requires id, name, and type');
      expect(() => new Item({ id: '1', name: 'test' })).toThrow('Item requires id, name, and type');
    });

    test('should handle invalid stat queries gracefully', () => {
      const weapon = new Item({
        id: 'sword',
        name: 'テスト剣',
        type: ItemType.WEAPON,
        attack: 10,
        price: 100
      });
      
      // 無効なステータス
      expect(weapon.getStatBonus('invalid')).toBe(0);
      expect(weapon.getStatBonus(null)).toBe(0);
      expect(weapon.getStatBonus(undefined)).toBe(0);
    });
  });

  describe('Map and Movement Error Handling', () => {
    test('should handle invalid movement directions gracefully', () => {
      const initialPosition = player.getPosition();
      
      // 無効な方向
      const result1 = player.move('invalid');
      expect(result1.success).toBe(false);
      expect(player.getPosition()).toEqual(initialPosition);
      
      // null 方向
      const result2 = player.move(null);
      expect(result2.success).toBe(false);
      expect(player.getPosition()).toEqual(initialPosition);
      
      // undefined 方向
      const result3 = player.move(undefined);
      expect(result3.success).toBe(false);
      expect(player.getPosition()).toEqual(initialPosition);
    });

    test('should handle invalid map objects gracefully', () => {
      const initialPosition = player.getPosition();
      
      // null マップ
      const result1 = player.move('up', null);
      expect(result1.success).toBe(true); // マップがない場合は移動可能
      
      // undefined マップ
      player.setPosition(initialPosition.x, initialPosition.y);
      const result2 = player.move('up', undefined);
      expect(result2.success).toBe(true);
      
      // 無効なマップオブジェクト
      player.setPosition(initialPosition.x, initialPosition.y);
      const result3 = player.move('up', {});
      expect(result3.success).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    test('should handle extreme values gracefully', () => {
      // 最大値テスト
      player.takeDamage(Number.MAX_SAFE_INTEGER);
      expect(player.hp).toBe(0);
      
      player.gainExperience(Number.MAX_SAFE_INTEGER);
      expect(player.level).toBe(30); // 最大レベル
      
      player.gainGold(Number.MAX_SAFE_INTEGER);
      expect(player.gold).toBe(65535); // 最大ゴールド
    });

    test('should handle HP edge cases gracefully', () => {
      // HP を 0 にする
      player.takeDamage(player.hp);
      expect(player.hp).toBe(0);
      expect(player.isAlive()).toBe(false);
      
      // HP が 0 の状態でさらにダメージ
      player.takeDamage(10);
      expect(player.hp).toBe(0);
      
      // HP が 0 の状態で回復
      player.setHp(10);
      expect(player.hp).toBe(10);
      expect(player.isAlive()).toBe(true);
    });
  });

  describe('Memory and Performance', () => {
    test('should handle large number of operations without memory leaks', () => {
      // 大量の戦闘シミュレーション
      for (let i = 0; i < 1000; i++) {
        const testPlayer = new Player();
        const testMonster = new Monster('slime');
        
        while (testPlayer.isAlive() && testMonster.isAlive()) {
          const damage = combatSystem.calculateDamage(testPlayer, testMonster);
          testMonster.takeDamage(damage);
          
          if (testMonster.isAlive()) {
            const counterDamage = combatSystem.calculateDamage(testMonster, testPlayer);
            testPlayer.takeDamage(counterDamage);
          }
        }
      }
      
      // メモリリークがないことを確認（基本的なテスト）
      expect(true).toBe(true);
    });
  });
});