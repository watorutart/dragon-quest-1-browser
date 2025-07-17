const Player = require('../src/player');

describe('Level Up Curve Tests', () => {
  let player;

  beforeEach(() => {
    player = new Player();
  });

  describe('Experience Requirements', () => {
    test('should have reasonable experience requirements for early levels', () => {
      expect(player.getExpForLevel(1)).toBe(0);
      expect(player.getExpForLevel(2)).toBe(4);
      expect(player.getExpForLevel(3)).toBe(12);
      expect(player.getExpForLevel(4)).toBe(30);
      expect(player.getExpForLevel(5)).toBe(60);
    });

    test('should have exponential growth for higher levels', () => {
      const level10Exp = player.getExpForLevel(10);
      const level15Exp = player.getExpForLevel(15);
      const level20Exp = player.getExpForLevel(20);
      
      expect(level10Exp).toBeGreaterThan(1000);
      expect(level15Exp).toBeGreaterThan(level10Exp * 3);
      expect(level20Exp).toBeGreaterThan(level15Exp * 2);
    });
  });

  describe('Level Up Progression', () => {
    test('should level up appropriately from level 1 to 5', () => {
      // Level 1 to 2
      player.gainExperience(4);
      expect(player.level).toBe(2);
      
      // Level 2 to 3
      player.gainExperience(8);
      expect(player.level).toBe(3);
      
      // Level 3 to 4
      player.gainExperience(18);
      expect(player.level).toBe(4);
      
      // Level 4 to 5
      player.gainExperience(30);
      expect(player.level).toBe(5);
    });

    test('should update stats appropriately on level up', () => {
      const initialStats = {
        hp: player.hp,
        attack: player.attack,
        defense: player.defense
      };
      
      player.levelUp();
      
      expect(player.hp).toBeGreaterThan(initialStats.hp);
      expect(player.attack).toBeGreaterThan(initialStats.attack);
      expect(player.defense).toBeGreaterThan(initialStats.defense);
    });

    test('should provide reasonable stat growth at level 10', () => {
      while (player.level < 10) {
        player.levelUp();
      }
      
      expect(player.maxHp).toBeGreaterThan(50);
      expect(player.attack).toBeGreaterThan(20);
      expect(player.defense).toBeGreaterThan(15);
    });
  });

  describe('Experience Balance', () => {
    test('should require reasonable monster kills for level progression', () => {
      const Monster = require('../src/monster');
      const slime = new Monster('slime');
      const orc = new Monster('orc');
      
      // Level 1 to 2 should take 4 slimes
      const slimesForLevel2 = Math.ceil(player.getExpForLevel(2) / slime.experience);
      expect(slimesForLevel2).toBe(4);
      
      // Level 4 to 5 should take reasonable number of orcs
      const orcsForLevel5 = Math.ceil((player.getExpForLevel(5) - player.getExpForLevel(4)) / orc.experience);
      expect(orcsForLevel5).toBe(5);
    });
  });

  describe('Level Cap', () => {
    test('should handle max level correctly', () => {
      // Level to max
      while (player.level < 30) {
        player.levelUp();
      }
      
      expect(player.level).toBe(30);
      
      // Try to level up beyond max
      player.levelUp();
      expect(player.level).toBe(30);
    });
  });
});