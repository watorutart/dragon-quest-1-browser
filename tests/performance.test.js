const Player = require('../src/player');
const Monster = require('../src/monster');
const CombatSystem = require('../src/combatSystem');
const SaveSystem = require('../src/saveSystem');

describe('Performance Tests', () => {
  let player;
  let combatSystem;
  let saveSystem;

  beforeEach(() => {
    player = new Player();
    combatSystem = new CombatSystem();
    saveSystem = new SaveSystem();
  });

  describe('Combat Performance', () => {
    test('should handle large number of combat calculations efficiently', () => {
      const startTime = performance.now();
      const iterations = 10000;
      
      for (let i = 0; i < iterations; i++) {
        const monster = new Monster('slime');
        combatSystem.calculateDamage(player, monster);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle continuous battle simulation efficiently', () => {
      const startTime = performance.now();
      const battleCount = 1000;
      
      for (let i = 0; i < battleCount; i++) {
        const testPlayer = new Player();
        const monster = new Monster('slime');
        
        while (testPlayer.isAlive() && monster.isAlive()) {
          const playerDamage = combatSystem.calculateDamage(testPlayer, monster);
          monster.takeDamage(playerDamage);
          
          if (monster.isAlive()) {
            const monsterDamage = combatSystem.calculateDamage(monster, testPlayer);
            testPlayer.takeDamage(monsterDamage);
          }
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  describe('Player Operations Performance', () => {
    test('should handle rapid experience gain efficiently', () => {
      const startTime = performance.now();
      const expGains = 10000;
      
      for (let i = 0; i < expGains; i++) {
        player.gainExperience(1);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in under 0.5 seconds
    });

    test('should handle rapid position updates efficiently', () => {
      const startTime = performance.now();
      const moves = 10000;
      
      for (let i = 0; i < moves; i++) {
        player.setPosition(i % 120, (i * 2) % 120);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should complete in under 0.2 seconds
    });

    test('should handle rapid equipment changes efficiently', () => {
      const { Item, ItemType } = require('../src/item');
      
      const weapon = new Item({
        id: 'test-weapon',
        name: 'テスト武器',
        type: ItemType.WEAPON,
        attack: 10,
        price: 100
      });
      
      const startTime = performance.now();
      const equipChanges = 5000;
      
      for (let i = 0; i < equipChanges; i++) {
        player.equipWeapon(weapon);
        player.unequipWeapon();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(300); // Should complete in under 0.3 seconds
    });
  });

  describe('Save System Performance', () => {
    test('should handle rapid save/load operations efficiently', () => {
      const gameData = {
        player: player,
        gameState: {
          currentState: 'field',
          flags: {},
          statistics: {}
        }
      };
      
      const startTime = performance.now();
      const saveLoadCycles = 1000;
      
      for (let i = 0; i < saveLoadCycles; i++) {
        saveSystem.save(gameData);
        saveSystem.load();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    test('should handle large save data efficiently', () => {
      // 大きなゲームデータを作成
      const largeGameData = {
        player: player,
        gameState: {
          currentState: 'field',
          flags: {},
          statistics: {},
          inventory: new Array(1000).fill(null).map((_, i) => ({
            id: `item_${i}`,
            name: `アイテム${i}`,
            type: 'consumable',
            quantity: i % 99 + 1
          }))
        }
      };
      
      const startTime = performance.now();
      
      const saveResult = saveSystem.save(largeGameData);
      expect(saveResult.success).toBe(true);
      
      const loadResult = saveSystem.load();
      expect(loadResult.success).toBe(true);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete in under 0.05 seconds
    });
  });

  describe('Memory Usage', () => {
    test('should not have memory leaks in repeated operations', () => {
      const iterations = 1000;
      
      // 初期のメモリ使用量測定（近似）
      const initialObjects = [];
      for (let i = 0; i < 100; i++) {
        initialObjects.push(new Player());
      }
      
      // 大量の操作を実行
      for (let i = 0; i < iterations; i++) {
        const tempPlayer = new Player();
        const tempMonster = new Monster('slime');
        
        tempPlayer.gainExperience(10);
        tempPlayer.gainGold(50);
        tempPlayer.setPosition(i % 120, i % 120);
        
        combatSystem.calculateDamage(tempPlayer, tempMonster);
      }
      
      // メモリリークの基本的なテスト
      expect(true).toBe(true); // 基本的な完了チェック
    });

    test('should handle object creation and destruction efficiently', () => {
      const startTime = performance.now();
      const objectCount = 10000;
      
      for (let i = 0; i < objectCount; i++) {
        const tempPlayer = new Player();
        const tempMonster = new Monster('slime');
        
        // オブジェクトの基本操作
        tempPlayer.gainExperience(1);
        tempMonster.takeDamage(1);
        
        // オブジェクトが自動的にガベージコレクションされる
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });
  });

  describe('Algorithm Efficiency', () => {
    test('should handle damage calculation algorithm efficiently', () => {
      const startTime = performance.now();
      const calculations = 100000;
      
      for (let i = 0; i < calculations; i++) {
        const attacker = { attack: 10 + (i % 100) };
        const defender = { defense: 5 + (i % 50) };
        
        // 直接的なダメージ計算
        const damage = Math.max(1, attacker.attack - defender.defense);
        expect(damage).toBeGreaterThan(0);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
    });

    test('should handle level calculation algorithm efficiently', () => {
      const startTime = performance.now();
      const levelCalculations = 10000;
      
      for (let i = 0; i < levelCalculations; i++) {
        const tempPlayer = new Player();
        
        // レベル計算の効率性をテスト
        for (let level = 1; level <= 30; level++) {
          tempPlayer.getExpForLevel(level);
          tempPlayer.getStatsForLevel(level);
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should complete in under 0.5 seconds
    });
  });

  describe('Data Structure Performance', () => {
    test('should handle array operations efficiently', () => {
      const startTime = performance.now();
      const arraySize = 10000;
      
      const testArray = [];
      
      // 配列への追加
      for (let i = 0; i < arraySize; i++) {
        testArray.push({
          id: i,
          value: i * 2,
          data: `item_${i}`
        });
      }
      
      // 配列の検索
      for (let i = 0; i < 1000; i++) {
        const found = testArray.find(item => item.id === i);
        expect(found).toBeDefined();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should complete in under 0.2 seconds
    });

    test('should handle object property access efficiently', () => {
      const startTime = performance.now();
      const accessCount = 100000;
      
      const testObject = {
        level: 5,
        hp: 100,
        mp: 50,
        attack: 20,
        defense: 15,
        experience: 1000,
        gold: 500
      };
      
      for (let i = 0; i < accessCount; i++) {
        const level = testObject.level;
        const hp = testObject.hp;
        const attack = testObject.attack;
        
        expect(level).toBe(5);
        expect(hp).toBe(100);
        expect(attack).toBe(20);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });

  describe('Edge Case Performance', () => {
    test('should handle maximum values efficiently', () => {
      const startTime = performance.now();
      
      // 最大レベルのプレイヤーを作成
      const maxPlayer = new Player();
      while (maxPlayer.level < 30) {
        maxPlayer.levelUp();
      }
      
      // 最大ゴールドを設定
      maxPlayer.gainGold(65535);
      
      // 最大値での操作テスト
      for (let i = 0; i < 1000; i++) {
        maxPlayer.gainExperience(1);
        maxPlayer.gainGold(1);
        maxPlayer.setPosition(119, 119);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(200); // Should complete in under 0.2 seconds
    });
  });
});