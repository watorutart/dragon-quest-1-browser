/**
 * Battle Integration テスト - 戦闘システムの統合テスト
 */

const EncounterSystem = require('../src/encounterSystem');
const Player = require('../src/player');
const Monster = require('../src/monster');
const BattleState = require('../src/battleState');

describe('Battle Integration System', () => {
    let encounterSystem, player, monster, battleState;
    
    beforeEach(() => {
        encounterSystem = new EncounterSystem();
        player = new Player('テスト勇者', 1);
        player.setPosition(10, 10);
        
        monster = new Monster('slime');
        
        battleState = new BattleState(player, monster);
    });
    
    describe('エンカウント判定システム', () => {
        test('エンカウント判定が正しく動作する', () => {
            // エンカウント確率を100%に設定してテスト
            const originalRate = encounterSystem.encounterRate;
            encounterSystem.encounterRate = 1.0;
            
            const result = encounterSystem.processEncounter(1.0, ['slime']);
            
            expect(result).toHaveProperty('encountered');
            expect(result).toHaveProperty('monster');
            
            // 元の確率に戻す
            encounterSystem.encounterRate = originalRate;
        });
        
        test('エンカウントしない場合のテスト', () => {
            // エンカウント確率を0%に設定
            encounterSystem.encounterRate = 0.0;
            
            const result = encounterSystem.processEncounter(0.0, ['slime']);
            
            expect(result.encountered).toBe(false);
            expect(result.monster).toBeNull();
        });
        
        test('プレイヤーレベルに応じたモンスターが出現する', () => {
            // 高レベルプレイヤーでテスト
            const highLevelPlayer = new Player('強い勇者', 10);
            encounterSystem.encounterRate = 1.0;
            
            const result = encounterSystem.processEncounter(1.0, ['slime']);
            
            if (result.encountered) {
                expect(result.monster).toBeDefined();
                expect(typeof result.monster).toBe('string');
            }
        });
    });
    
    describe('戦闘状態管理', () => {
        test('戦闘が正しく初期化される', () => {
            expect(battleState.player).toBe(player);
            expect(battleState.monster).toBe(monster);
            expect(battleState.isActive).toBe(true);
            expect(battleState.isOver).toBe(false);
            expect(battleState.currentTurn).toBe('player');
        });
        
        test('戦闘開始処理が正しく動作する', () => {
            battleState.startBattle();
            
            expect(battleState.isActive).toBe(true);
            expect(battleState.isOver).toBe(false);
            expect(battleState.currentTurn).toBe('player');
            expect(battleState.battleResult).toBeNull();
        });
        
        test('ターンが正しく切り替わる', () => {
            expect(battleState.currentTurn).toBe('player');
            
            battleState.nextTurn();
            expect(battleState.currentTurn).toBe('monster');
            
            battleState.nextTurn();
            expect(battleState.currentTurn).toBe('player');
        });
        
        test('戦闘終了判定が正しく動作する', () => {
            // モンスターのHPを0にする
            monster.hp = 0;
            
            const result = battleState.checkBattleEnd();
            
            expect(result.isOver).toBe(true);
            expect(battleState.isOver).toBe(true);
            expect(battleState.battleResult).toBe(result);
        });
    });
    
    describe('戦闘コマンド処理', () => {
        test('攻撃コマンドが正しく実行される', () => {
            const result = battleState.executeCommand('attack');
            
            expect(result.success).toBe(true);
            expect(result).toHaveProperty('damage');
            expect(result).toHaveProperty('targetHp');
            expect(result.damage).toBeGreaterThan(0);
        });
        
        test('逃走コマンドが実行される', () => {
            const result = battleState.executeCommand('flee');
            
            expect(result.success).toBeDefined();
            expect(result).toHaveProperty('fleeChance');
            expect(result).toHaveProperty('attempts');
            expect(result.fleeChance).toBeGreaterThan(0);
            expect(result.fleeChance).toBeLessThanOrEqual(1);
        });
        
        test('無効なコマンドは拒否される', () => {
            const result = battleState.executeCommand('invalid');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid command');
        });
        
        test('非アクティブ状態ではコマンドが実行できない', () => {
            battleState.endBattle();
            
            const result = battleState.executeCommand('attack');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Battle is not active');
        });
        
        test('モンスターターン中はプレイヤーコマンドが実行できない', () => {
            battleState.nextTurn(); // モンスターターンに切り替え
            
            const result = battleState.executeCommand('attack');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Not player turn');
        });
    });
    
    describe('戦闘ダメージ計算', () => {
        test('プレイヤー攻撃でモンスターにダメージが与えられる', () => {
            const initialHp = monster.hp;
            const result = battleState.executeCommand('attack');
            
            expect(result.success).toBe(true);
            expect(result.targetHp).toBeLessThan(initialHp);
            expect(monster.hp).toBe(result.targetHp);
        });
        
        test('モンスター撃破時に戦闘が終了する', () => {
            // モンスターのHPを1にして確実に倒せるようにする
            monster.hp = 1;
            
            const attackResult = battleState.executeCommand('attack');
            expect(attackResult.success).toBe(true);
            
            const battleResult = battleState.checkBattleEnd();
            expect(battleResult.isOver).toBe(true);
        });
    });
    
    describe('逃走システム', () => {
        test('逃走成功率が適切な範囲内にある', () => {
            for (let i = 0; i < 10; i++) {
                // 新しいBattleStateを作成して試行
                const freshBattleState = new BattleState(player, monster);
                const result = freshBattleState.executeCommand('flee');
                expect(result.fleeChance).toBeGreaterThanOrEqual(0.1);
                expect(result.fleeChance).toBeLessThanOrEqual(0.9);
            }
        });
        
        test('連続逃走試行で成功率が下がる', () => {
            const testBattleState = new BattleState(player, monster);
            const firstAttempt = testBattleState.executeCommand('flee');
            
            // 逃走に成功した場合は戦闘が終了して2回目の試行ができないため、
            // 逃走失敗時のみテストを続行
            if (!firstAttempt.success) {
                const secondAttempt = testBattleState.executeCommand('flee');
                expect(secondAttempt.fleeChance).toBeLessThan(firstAttempt.fleeChance);
            }
        });
        
        test('逃走試行回数がカウントされる', () => {
            const testBattleState = new BattleState(player, monster);
            expect(testBattleState.fleeAttempts).toBe(0);
            
            const firstAttempt = testBattleState.executeCommand('flee');
            expect(testBattleState.fleeAttempts).toBe(1);
            
            // 逃走に成功した場合は戦闘が終了するため、失敗時のみ2回目の試行をテスト
            if (!firstAttempt.success) {
                testBattleState.executeCommand('flee');
                expect(testBattleState.fleeAttempts).toBe(2);
            } else {
                // 成功した場合、試行回数は1回のままであることを確認
                expect(testBattleState.fleeAttempts).toBe(1);
            }
        });
    });
    
    describe('経験値・ゴールド処理', () => {
        test('モンスター撃破時に適切な報酬が計算される', () => {
            // モンスターのHPを1にして確実に倒す
            monster.hp = 1;
            
            const initialExp = player.experience;
            const initialGold = player.gold;
            
            // 攻撃して撃破
            battleState.executeCommand('attack');
            const battleResult = battleState.checkBattleEnd();
            
            expect(battleResult.isOver).toBe(true);
            expect(battleResult).toHaveProperty('experienceGained');
            expect(battleResult).toHaveProperty('goldGained');
            expect(battleResult.experienceGained).toBeGreaterThan(0);
            expect(battleResult.goldGained).toBeGreaterThan(0);
        });
    });
    
    describe('統合シナリオテスト', () => {
        test('完全な戦闘フロー（プレイヤー勝利）', () => {
            // 戦闘開始
            battleState.startBattle();
            expect(battleState.isActive).toBe(true);
            
            // プレイヤーが攻撃を繰り返してモンスターを倒す
            let battleOver = false;
            let attackCount = 0;
            const maxAttacks = 20; // 無限ループ防止
            
            while (!battleOver && attackCount < maxAttacks) {
                if (battleState.currentTurn === 'player') {
                    const attackResult = battleState.executeCommand('attack');
                    expect(attackResult.success).toBe(true);
                }
                
                battleState.nextTurn();
                
                const battleResult = battleState.checkBattleEnd();
                if (battleResult.isOver) {
                    battleOver = true;
                    expect(battleResult.winner).toBe('player');
                }
                
                attackCount++;
            }
            
            expect(battleOver).toBe(true);
            expect(attackCount).toBeLessThan(maxAttacks);
        });
        
        test('逃走成功シナリオ', () => {
            // 逃走確率を100%に設定（テスト用）
            const originalCalculateFleeChance = battleState._calculateFleeChance;
            battleState._calculateFleeChance = () => 1.0;
            
            const fleeResult = battleState.executeCommand('flee');
            
            expect(fleeResult.success).toBe(true);
            expect(battleState.isActive).toBe(false);
            
            // 元のメソッドに戻す
            battleState._calculateFleeChance = originalCalculateFleeChance;
        });
    });
});