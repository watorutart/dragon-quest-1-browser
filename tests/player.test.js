/**
 * Player クラスのテスト
 * TDD アプローチ: Red -> Green -> Refactor
 */

// Playerクラスを読み込み
const Player = require('../src/player');

describe('Player クラスの基本ステータス管理', () => {
    let player;
    
    beforeEach(() => {
        // 各テスト前に新しいPlayerインスタンスを作成
        player = new Player();
    });
    
    describe('初期化テスト (RED)', () => {
        test('Playerが正しく初期化される', () => {
            expect(player.level).toBe(1);
            expect(player.hp).toBe(15);
            expect(player.maxHp).toBe(15);
            expect(player.attack).toBe(4);
            expect(player.defense).toBe(2);
            expect(player.experience).toBe(0);
            expect(player.gold).toBe(120);
        });
        
        test('初期装備がnullである', () => {
            expect(player.weapon).toBeNull();
            expect(player.armor).toBeNull();
        });
        
        test('初期位置が設定される', () => {
            expect(player.x).toBe(10);
            expect(player.y).toBe(10);
        });
    });
    
    describe('ステータス管理テスト (RED)', () => {
        test('HPが正しく設定・取得できる', () => {
            player.setHp(10);
            expect(player.getHp()).toBe(10);
        });
        
        test('HPが最大値を超えない', () => {
            player.setHp(20); // maxHp(15)を超える値
            expect(player.getHp()).toBe(15);
        });
        
        test('HPが0未満にならない', () => {
            player.setHp(-5);
            expect(player.getHp()).toBe(0);
        });
        
        test('ダメージを受けてHPが減少する', () => {
            const initialHp = player.getHp();
            player.takeDamage(5);
            expect(player.getHp()).toBe(initialHp - 5);
        });
        
        test('致命的ダメージでHPが0になる', () => {
            player.takeDamage(20); // maxHp以上のダメージ
            expect(player.getHp()).toBe(0);
        });
        
        test('HPが0の時に死亡状態になる', () => {
            player.takeDamage(20);
            expect(player.isDead()).toBe(true);
        });
        
        test('HPが1以上の時は生存状態', () => {
            expect(player.isDead()).toBe(false);
        });
    });
    
    describe('ゴールド管理テスト (RED)', () => {
        test('ゴールドを追加できる', () => {
            const initialGold = player.gold;
            player.addGold(50);
            expect(player.gold).toBe(initialGold + 50);
        });
        
        test('ゴールドを消費できる', () => {
            const initialGold = player.gold;
            const result = player.spendGold(30);
            expect(result).toBe(true);
            expect(player.gold).toBe(initialGold - 30);
        });
        
        test('所持金不足の場合はゴールドを消費できない', () => {
            const initialGold = player.gold;
            const result = player.spendGold(200); // 所持金以上
            expect(result).toBe(false);
            expect(player.gold).toBe(initialGold); // 変化なし
        });
        
        test('ゴールドが負の値にならない', () => {
            player.gold = 10;
            player.spendGold(20);
            expect(player.gold).toBeGreaterThanOrEqual(0);
        });
    });
});

describe('Player の位置管理機能', () => {
    let player;
    
    beforeEach(() => {
        player = new Player();
    });
    
    describe('位置設定・取得テスト (RED)', () => {
        test('初期位置が正しく設定される', () => {
            expect(player.getX()).toBe(10);
            expect(player.getY()).toBe(10);
        });
        
        test('X座標を設定・取得できる', () => {
            player.setX(5);
            expect(player.getX()).toBe(5);
        });
        
        test('Y座標を設定・取得できる', () => {
            player.setY(7);
            expect(player.getY()).toBe(7);
        });
        
        test('位置を一度に設定できる', () => {
            player.setPosition(15, 20);
            expect(player.getX()).toBe(15);
            expect(player.getY()).toBe(20);
        });
        
        test('現在位置を取得できる', () => {
            player.setPosition(8, 12);
            const position = player.getPosition();
            expect(position.x).toBe(8);
            expect(position.y).toBe(12);
        });
    });
    
    describe('座標検証ロジックテスト (RED)', () => {
        test('負の座標は0に修正される', () => {
            player.setX(-5);
            player.setY(-3);
            expect(player.getX()).toBe(0);
            expect(player.getY()).toBe(0);
        });
        
        test('座標の最大値制限が適用される', () => {
            const maxCoord = 119; // マップサイズ120x120の場合
            player.setX(150);
            player.setY(200);
            expect(player.getX()).toBe(maxCoord);
            expect(player.getY()).toBe(maxCoord);
        });
        
        test('有効な座標範囲内かチェックできる', () => {
            expect(player.isValidPosition(10, 10)).toBe(true);
            expect(player.isValidPosition(-1, 10)).toBe(false);
            expect(player.isValidPosition(10, -1)).toBe(false);
            expect(player.isValidPosition(120, 10)).toBe(false);
            expect(player.isValidPosition(10, 120)).toBe(false);
        });
        
        test('移動前に座標の有効性をチェックできる', () => {
            player.setPosition(0, 0);
            expect(player.canMoveTo(-1, 0)).toBe(false); // 境界外
            expect(player.canMoveTo(1, 0)).toBe(true);   // 有効
        });
    });
});

describe('Player のレベルアップ機能', () => {
    let player;
    
    beforeEach(() => {
        player = new Player();
    });
    
    describe('経験値計算とレベルアップテスト (RED)', () => {
        test('経験値を獲得できる', () => {
            const initialExp = player.experience;
            player.gainExperience(10);
            expect(player.experience).toBe(initialExp + 10);
        });
        
        test('レベル2に必要な経験値でレベルアップする', () => {
            const expForLevel2 = 7; // ドラクエ1の経験値テーブル
            player.gainExperience(expForLevel2);
            expect(player.level).toBe(2);
        });
        
        test('レベルアップ時にHPが増加する', () => {
            const initialMaxHp = player.maxHp;
            player.gainExperience(7); // レベル2へ
            expect(player.maxHp).toBeGreaterThan(initialMaxHp);
        });
        
        test('レベルアップ時に攻撃力が増加する', () => {
            const initialAttack = player.attack;
            player.gainExperience(7); // レベル2へ
            expect(player.attack).toBeGreaterThan(initialAttack);
        });
        
        test('レベルアップ時に防御力が増加する', () => {
            const initialDefense = player.defense;
            player.gainExperience(7); // レベル2へ
            expect(player.defense).toBeGreaterThan(initialDefense);
        });
        
        test('レベルアップ時に現在HPが最大HPに回復する', () => {
            player.takeDamage(5); // HPを減らす
            const damagedHp = player.hp;
            player.gainExperience(7); // レベル2へ
            expect(player.hp).toBe(player.maxHp);
            expect(player.hp).toBeGreaterThan(damagedHp);
        });
        
        test('複数レベル一度にアップできる', () => {
            player.gainExperience(100); // 大量の経験値
            expect(player.level).toBeGreaterThan(2);
        });
        
        test('レベルアップが発生したかチェックできる', () => {
            const result = player.gainExperience(7);
            expect(result.leveledUp).toBe(true);
            expect(result.newLevel).toBe(2);
        });
        
        test('レベルアップしない場合はfalseを返す', () => {
            const result = player.gainExperience(3); // レベルアップに足りない
            expect(result.leveledUp).toBe(false);
            expect(result.newLevel).toBe(1);
        });
    });
    
    describe('ステータス計算式テスト (RED)', () => {
        test('レベル別の必要経験値が正しく計算される', () => {
            expect(player.getExpForLevel(1)).toBe(0);
            expect(player.getExpForLevel(2)).toBe(7);
            expect(player.getExpForLevel(3)).toBe(23);
            expect(player.getExpForLevel(4)).toBe(47);
        });
        
        test('次のレベルまでの必要経験値が計算される', () => {
            player.experience = 5;
            expect(player.getExpToNextLevel()).toBe(2); // 7 - 5 = 2
        });
        
        test('レベル別のステータス成長が正しく計算される', () => {
            const level1Stats = player.getStatsForLevel(1);
            const level2Stats = player.getStatsForLevel(2);
            
            expect(level2Stats.maxHp).toBeGreaterThan(level1Stats.maxHp);
            expect(level2Stats.attack).toBeGreaterThan(level1Stats.attack);
            expect(level2Stats.defense).toBeGreaterThan(level1Stats.defense);
        });
        
        test('最大レベル(30)を超えない', () => {
            player.gainExperience(999999); // 大量の経験値
            expect(player.level).toBeLessThanOrEqual(30);
        });
    });
});describe(
'Player の移動ロジック', () => {
    let player;
    let mockMap;
    
    beforeEach(() => {
        player = new Player();
        // Map クラスのモック
        mockMap = {
            isWalkable: jest.fn(),
            width: 120,
            height: 120
        };
    });
    
    describe('移動処理テスト (RED)', () => {
        test('上方向に移動できる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            const result = player.move('up', mockMap);
            
            expect(result.success).toBe(true);
            expect(player.getY()).toBe(9);
            expect(player.getX()).toBe(10); // X座標は変化しない
        });
        
        test('下方向に移動できる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            const result = player.move('down', mockMap);
            
            expect(result.success).toBe(true);
            expect(player.getY()).toBe(11);
            expect(player.getX()).toBe(10);
        });
        
        test('左方向に移動できる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            const result = player.move('left', mockMap);
            
            expect(result.success).toBe(true);
            expect(player.getX()).toBe(9);
            expect(player.getY()).toBe(10);
        });
        
        test('右方向に移動できる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            const result = player.move('right', mockMap);
            
            expect(result.success).toBe(true);
            expect(player.getX()).toBe(11);
            expect(player.getY()).toBe(10);
        });
        
        test('無効な方向では移動しない', () => {
            player.setPosition(10, 10);
            
            const result = player.move('invalid', mockMap);
            
            expect(result.success).toBe(false);
            expect(player.getX()).toBe(10);
            expect(player.getY()).toBe(10);
        });
        
        test('移動先がコリジョンの場合は移動しない', () => {
            mockMap.isWalkable.mockReturnValue(false);
            player.setPosition(10, 10);
            
            const result = player.move('up', mockMap);
            
            expect(result.success).toBe(false);
            expect(player.getX()).toBe(10);
            expect(player.getY()).toBe(10);
        });
        
        test('マップ境界外への移動は拒否される', () => {
            mockMap.isWalkable.mockReturnValue(false); // 境界外は移動不可
            player.setPosition(0, 0);
            
            const result = player.move('up', mockMap);
            
            expect(result.success).toBe(false);
            expect(player.getX()).toBe(0);
            expect(player.getY()).toBe(0);
        });
        
        test('移動時にマップのisWalkableが正しい座標で呼ばれる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(5, 5);
            
            player.move('up', mockMap);
            
            expect(mockMap.isWalkable).toHaveBeenCalledWith(5, 4);
        });
    });
    
    describe('移動検証ロジック統合テスト (RED)', () => {
        test('移動可能性を事前にチェックできる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            expect(player.canMoveInDirection('up', mockMap)).toBe(true);
            expect(player.canMoveInDirection('down', mockMap)).toBe(true);
            expect(player.canMoveInDirection('left', mockMap)).toBe(true);
            expect(player.canMoveInDirection('right', mockMap)).toBe(true);
        });
        
        test('コリジョンがある場合は移動不可と判定される', () => {
            mockMap.isWalkable.mockReturnValue(false);
            player.setPosition(10, 10);
            
            expect(player.canMoveInDirection('up', mockMap)).toBe(false);
        });
        
        test('移動結果に詳細情報が含まれる', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            const result = player.move('up', mockMap);
            
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('direction');
            expect(result).toHaveProperty('oldPosition');
            expect(result).toHaveProperty('newPosition');
            expect(result.direction).toBe('up');
            expect(result.oldPosition).toEqual({x: 10, y: 10});
            expect(result.newPosition).toEqual({x: 10, y: 9});
        });
        
        test('移動失敗時の結果情報が正しい', () => {
            mockMap.isWalkable.mockReturnValue(false);
            player.setPosition(10, 10);
            
            const result = player.move('up', mockMap);
            
            expect(result.success).toBe(false);
            expect(result.oldPosition).toEqual({x: 10, y: 10});
            expect(result.newPosition).toEqual({x: 10, y: 10}); // 移動していない
        });
        
        test('連続移動が正しく処理される', () => {
            mockMap.isWalkable.mockReturnValue(true);
            player.setPosition(10, 10);
            
            player.move('up', mockMap);
            player.move('right', mockMap);
            
            expect(player.getX()).toBe(11);
            expect(player.getY()).toBe(9);
        });
    });
});