const SaveSystem = require('../src/saveSystem');
const Player = require('../src/player');

describe('Save System Tests', () => {
  let saveSystem;
  let player;
  let gameData;

  beforeEach(() => {
    // グローバルメモリストレージをクリア
    const SaveSystem = require('../src/saveSystem');
    if (SaveSystem._globalMemoryStorage) {
      SaveSystem._globalMemoryStorage = {};
    }
    
    saveSystem = new SaveSystem();
    player = new Player('テスト勇者', 5);
    player.gainExperience(100);
    player.gainGold(500);
    player.setPosition(15, 20);
    
    gameData = {
      player: player,
      gameState: {
        currentState: 'field',
        mapData: { currentMap: 'overworld' },
        flags: { hasMetKing: true, dragonDefeated: false },
        statistics: { battlesWon: 10, totalSteps: 1000 }
      }
    };
  });

  afterEach(() => {
    // テスト後のクリーンアップ
    saveSystem.deleteSave();
    // グローバルメモリストレージをクリア
    const SaveSystem = require('../src/saveSystem');
    if (SaveSystem._globalMemoryStorage) {
      SaveSystem._globalMemoryStorage = {};
    }
  });

  describe('Save Functionality', () => {
    test('should save game data successfully', () => {
      const result = saveSystem.save(gameData);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(saveSystem.hasSaveData()).toBe(true);
    });

    test('should handle invalid game data gracefully', () => {
      const invalidData = null;
      const result = saveSystem.save(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid game data: must be an object');
    });

    test('should handle missing required fields', () => {
      const incompleteData = {
        player: player
        // gameState is missing
      };
      
      const result = saveSystem.save(incompleteData);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing required field: gameState');
    });

    test('should handle missing player fields', () => {
      const invalidPlayerData = {
        player: { name: 'test' }, // missing other required fields
        gameState: { currentState: 'field' }
      };
      
      const result = saveSystem.save(invalidPlayerData);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required player field');
    });
  });

  describe('Load Functionality', () => {
    test('should load saved game data successfully', () => {
      // まず保存
      saveSystem.save(gameData);
      
      // 読み込み
      const result = saveSystem.load();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.player.name).toBe('テスト勇者');
      expect(result.data.player.level).toBe(5);
      expect(result.data.player.experience).toBe(100);
      expect(result.data.player.gold).toBe(620); // 初期120 + 追加500
      expect(result.data.player.x).toBe(15);
      expect(result.data.player.y).toBe(20);
      expect(result.data.gameState.currentState).toBe('field');
      expect(result.data.gameState.flags.hasMetKing).toBe(true);
      expect(result.timestamp).toBeDefined();
    });

    test('should handle no save data gracefully', () => {
      const result = saveSystem.load();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('No save data found');
    });

    test('should handle corrupted save data gracefully', () => {
      // 不正なJSONを保存
      const SaveSystem = require('../src/saveSystem');
      SaveSystem._globalMemoryStorage = {};
      SaveSystem._globalMemoryStorage[saveSystem.storageKey] = 'invalid json';
      
      const result = saveSystem.load();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unexpected token');
    });
  });

  describe('Data Validation', () => {
    test('should validate game data structure correctly', () => {
      const validData = {
        player: {
          name: 'テスト',
          level: 1,
          hp: 15,
          experience: 0,
          gold: 120
        },
        gameState: {
          currentState: 'field'
        }
      };
      
      const result = saveSystem._validateGameData(validData);
      expect(result.valid).toBe(true);
    });

    test('should reject invalid data structure', () => {
      const invalidData = {
        player: {
          name: 'テスト'
          // missing required fields
        },
        gameState: {
          currentState: 'field'
        }
      };
      
      const result = saveSystem._validateGameData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Missing required player field');
    });
  });

  describe('Serialization', () => {
    test('should serialize game data correctly', () => {
      const serialized = saveSystem._serializeGameData(gameData);
      
      expect(serialized.player).toBeDefined();
      expect(serialized.player.name).toBe('テスト勇者');
      expect(serialized.player.level).toBe(5);
      expect(serialized.player.x).toBe(15);
      expect(serialized.player.y).toBe(20);
      expect(serialized.gameState).toBeDefined();
      expect(serialized.gameState.currentState).toBe('field');
      expect(serialized.gameState.flags.hasMetKing).toBe(true);
    });

    test('should deserialize game data correctly', () => {
      const serialized = saveSystem._serializeGameData(gameData);
      const deserialized = saveSystem._deserializeGameData(serialized);
      
      expect(deserialized.player.name).toBe('テスト勇者');
      expect(deserialized.player.level).toBe(5);
      expect(deserialized.gameState.currentState).toBe('field');
      expect(deserialized.gameState.flags.hasMetKing).toBe(true);
    });
  });

  describe('Save Management', () => {
    test('should check for save data existence correctly', () => {
      expect(saveSystem.hasSaveData()).toBe(false);
      
      saveSystem.save(gameData);
      expect(saveSystem.hasSaveData()).toBe(true);
    });

    test('should delete save data successfully', () => {
      saveSystem.save(gameData);
      expect(saveSystem.hasSaveData()).toBe(true);
      
      const result = saveSystem.deleteSave();
      expect(result.success).toBe(true);
      expect(saveSystem.hasSaveData()).toBe(false);
    });
  });

  describe('Auto Save', () => {
    test('should handle auto save functionality', (done) => {
      const testData = { ...gameData };
      
      // 短い間隔で自動保存を開始
      saveSystem.startAutoSave(testData, 100);
      
      // 少し待ってから自動保存が実行されたかチェック
      setTimeout(() => {
        expect(saveSystem.hasSaveData()).toBe(true);
        saveSystem.stopAutoSave();
        done();
      }, 150);
    });

    test('should stop auto save correctly', () => {
      saveSystem.startAutoSave(gameData, 100);
      expect(saveSystem.autoSaveInterval).toBeDefined();
      
      saveSystem.stopAutoSave();
      expect(saveSystem.autoSaveInterval).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('should handle save errors gracefully', () => {
      // JSON.stringifyでエラーを発生させる
      const circularData = {};
      circularData.self = circularData;
      
      const result = saveSystem.save({
        player: circularData,
        gameState: { currentState: 'field' }
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle version mismatch gracefully', () => {
      // 異なるバージョンのデータを保存
      const saveData = {
        version: '0.9.0',
        timestamp: new Date().toISOString(),
        gameData: { player: {}, gameState: {} }
      };
      
      const SaveSystem = require('../src/saveSystem');
      SaveSystem._globalMemoryStorage = {};
      SaveSystem._globalMemoryStorage[saveSystem.storageKey] = JSON.stringify(saveData);
      
      const result = saveSystem.load();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Save data version mismatch');
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete save/load cycle', () => {
      // 複数回の保存・読み込みサイクル
      let expectedExp = 100;
      let expectedGold = 620;
      
      for (let i = 0; i < 5; i++) {
        player.gainExperience(i * 10);
        player.gainGold(i * 50);
        
        expectedExp += i * 10;
        expectedGold += i * 50;
        
        const saveResult = saveSystem.save(gameData);
        expect(saveResult.success).toBe(true);
        
        const loadResult = saveSystem.load();
        expect(loadResult.success).toBe(true);
        expect(loadResult.data.player.experience).toBe(expectedExp);
        expect(loadResult.data.player.gold).toBe(expectedGold);
      }
    });
  });
});