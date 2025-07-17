const Player = require('../src/player');
const Monster = require('../src/monster');
const CombatSystem = require('../src/combatSystem');

describe('Game Balance Tests', () => {
  let player;
  let combatSystem;

  beforeEach(() => {
    player = new Player();
    combatSystem = new CombatSystem();
  });

  describe('Early Game Balance (Level 1-3)', () => {
    test('should allow level 1 player to defeat slime consistently', () => {
      const slime = new Monster('slime');
      let victories = 0;
      
      for (let i = 0; i < 100; i++) {
        const tempPlayer = new Player();
        const tempSlime = new Monster('slime');
        
        while (tempPlayer.isAlive() && tempSlime.isAlive()) {
          const playerDamage = combatSystem.calculateDamage(tempPlayer, tempSlime);
          tempSlime.takeDamage(playerDamage);
          
          if (tempSlime.isAlive()) {
            const slimeDamage = combatSystem.calculateDamage(tempSlime, tempPlayer);
            tempPlayer.takeDamage(slimeDamage);
          }
        }
        
        if (tempPlayer.isAlive()) {
          victories++;
        }
      }
      
      expect(victories).toBeGreaterThan(70);
    });

    test('should require multiple slimes to level up from 1 to 2', () => {
      const initialExp = player.experience;
      const slime = new Monster('slime');
      
      player.gainExperience(slime.experience);
      
      expect(player.level).toBe(1);
      expect(player.experience).toBeGreaterThan(initialExp);
      
      for (let i = 0; i < 3; i++) {
        player.gainExperience(slime.experience);
      }
      
      expect(player.level).toBe(2);
    });
  });

  describe('Mid Game Balance (Level 4-8)', () => {
    test('should provide reasonable challenge for level 5 player vs orc', () => {
      player.levelUp();
      player.levelUp();
      player.levelUp();
      player.levelUp();
      
      const orc = new Monster('orc');
      let victories = 0;
      
      for (let i = 0; i < 100; i++) {
        const tempPlayer = new Player();
        for (let j = 0; j < 4; j++) {
          tempPlayer.levelUp();
        }
        
        const tempOrc = new Monster('orc');
        
        while (tempPlayer.isAlive() && tempOrc.isAlive()) {
          const playerDamage = combatSystem.calculateDamage(tempPlayer, tempOrc);
          tempOrc.takeDamage(playerDamage);
          
          if (tempOrc.isAlive()) {
            const orcDamage = combatSystem.calculateDamage(tempOrc, tempPlayer);
            tempPlayer.takeDamage(orcDamage);
          }
        }
        
        if (tempPlayer.isAlive()) {
          victories++;
        }
      }
      
      expect(victories).toBeGreaterThan(30);
      expect(victories).toBeLessThan(95);
    });
  });

  describe('Late Game Balance (Level 9+)', () => {
    test('should provide epic challenge for max level player vs dragon king', () => {
      while (player.level < 10) {
        player.levelUp();
      }
      
      const dragonKing = new Monster('dragonKing');
      let victories = 0;
      
      for (let i = 0; i < 100; i++) {
        const tempPlayer = new Player();
        while (tempPlayer.level < 10) {
          tempPlayer.levelUp();
        }
        
        const tempDragonKing = new Monster('dragonKing');
        
        while (tempPlayer.isAlive() && tempDragonKing.isAlive()) {
          const playerDamage = combatSystem.calculateDamage(tempPlayer, tempDragonKing);
          tempDragonKing.takeDamage(playerDamage);
          
          if (tempDragonKing.isAlive()) {
            const dragonDamage = combatSystem.calculateDamage(tempDragonKing, tempPlayer);
            tempPlayer.takeDamage(dragonDamage);
          }
        }
        
        if (tempPlayer.isAlive()) {
          victories++;
        }
      }
      
      expect(victories).toBeGreaterThan(20);
      expect(victories).toBeLessThan(80);
    });
  });

  describe('Damage Calculation Balance', () => {
    test('should have reasonable damage variance', () => {
      const slime = new Monster('slime');
      const damages = [];
      
      for (let i = 0; i < 100; i++) {
        const damage = combatSystem.calculateDamage(player, slime);
        damages.push(damage);
      }
      
      const minDamage = Math.min(...damages);
      const maxDamage = Math.max(...damages);
      const avgDamage = damages.reduce((a, b) => a + b, 0) / damages.length;
      
      expect(minDamage).toBeGreaterThan(0);
      expect(maxDamage).toBeLessThan(player.attack * 2);
      expect(avgDamage).toBeCloseTo(player.attack * 0.56, 1);
    });
  });
});