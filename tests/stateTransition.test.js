/**
 * 状態遷移システムのテスト
 * フィールド→戦闘遷移のテスト駆動実装
 */

describe('StateTransition System', () => {
    let StateManager, EncounterSystem, Player, Monster;

    beforeEach(() => {
        // まだ存在しないクラスをrequire（Red段階）
        StateManager = require('../src/stateManager.js');
        EncounterSystem = require('../src/encounterSystem.js');
        Player = require('../src/player.js');
        Monster = require('../src/monster.js');
    });

    describe('フィールド→戦闘状態遷移', () => {
        test('エンカウント発生時にフィールド状態から戦闘状態に遷移する', () => {
            const player = new Player();
            const stateManager = new StateManager();
            const encounterSystem = new EncounterSystem();
            
            // 初期状態はフィールド
            expect(stateManager.getCurrentState()).toBe('field');
            
            // エンカウント発生をシミュレート
            const encounterResult = {
                encountered: true,
                monster: new Monster('slime')
            };
            
            // 状態遷移を実行
            stateManager.handleEncounter(encounterResult);
            
            // 戦闘状態に遷移したことを確認
            expect(stateManager.getCurrentState()).toBe('battle');
            expect(stateManager.getBattleState()).toBeDefined();
            expect(stateManager.getBattleState().monster.name).toBe('スライム');
        });

        test('エンカウント未発生時は状態が変わらない', () => {
            const stateManager = new StateManager();
            
            // 初期状態はフィールド
            expect(stateManager.getCurrentState()).toBe('field');
            
            // エンカウント未発生をシミュレート
            const encounterResult = {
                encountered: false,
                monster: null
            };
            
            // 状態遷移を試行
            stateManager.handleEncounter(encounterResult);
            
            // フィールド状態のまま
            expect(stateManager.getCurrentState()).toBe('field');
            expect(stateManager.getBattleState()).toBeNull();
        });

        test('戦闘状態から戦闘終了後にフィールド状態に戻る', () => {
            const player = new Player();
            const monster = new Monster('slime');
            const stateManager = new StateManager();
            
            // 戦闘状態に遷移
            const encounterResult = {
                encountered: true,
                monster: monster
            };
            stateManager.handleEncounter(encounterResult);
            expect(stateManager.getCurrentState()).toBe('battle');
            
            // 戦闘終了をシミュレート（プレイヤー勝利）
            const battleResult = {
                isOver: true,
                winner: 'player',
                experienceGained: 1,
                goldGained: 2
            };
            
            // 戦闘終了処理
            stateManager.handleBattleEnd(battleResult);
            
            // フィールド状態に戻る
            expect(stateManager.getCurrentState()).toBe('field');
            expect(stateManager.getBattleState()).toBeNull();
        });

        test('逃走成功時に戦闘状態からフィールド状態に戻る', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const stateManager = new StateManager();
            
            // 戦闘状態に遷移
            const encounterResult = {
                encountered: true,
                monster: monster
            };
            stateManager.handleEncounter(encounterResult);
            expect(stateManager.getCurrentState()).toBe('battle');
            
            // 逃走成功をシミュレート
            const fleeResult = {
                success: true,
                fleeChance: 0.5,
                attempts: 1
            };
            
            // 逃走処理
            stateManager.handleFleeResult(fleeResult);
            
            // フィールド状態に戻る
            expect(stateManager.getCurrentState()).toBe('field');
            expect(stateManager.getBattleState()).toBeNull();
        });

        test('逃走失敗時は戦闘状態が継続する', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const stateManager = new StateManager();
            
            // 戦闘状態に遷移
            const encounterResult = {
                encountered: true,
                monster: monster
            };
            stateManager.handleEncounter(encounterResult);
            expect(stateManager.getCurrentState()).toBe('battle');
            
            // 逃走失敗をシミュレート
            const fleeResult = {
                success: false,
                fleeChance: 0.3,
                attempts: 1
            };
            
            // 逃走処理
            stateManager.handleFleeResult(fleeResult);
            
            // 戦闘状態が継続
            expect(stateManager.getCurrentState()).toBe('battle');
            expect(stateManager.getBattleState()).toBeDefined();
        });
    });

    describe('状態管理の基本機能', () => {
        test('StateManagerが正しく初期化される', () => {
            const stateManager = new StateManager();
            
            expect(stateManager.getCurrentState()).toBe('field');
            expect(stateManager.getBattleState()).toBeNull();
            expect(stateManager.getFieldState()).toBeDefined();
        });

        test('無効な状態遷移は拒否される', () => {
            const stateManager = new StateManager();
            
            // 戦闘状態でないのに戦闘終了を試行
            expect(() => {
                stateManager.handleBattleEnd({
                    isOver: true,
                    winner: 'player'
                });
            }).toThrow('Invalid state transition: not in battle');
        });

        test('状態遷移時にイベントが発火される', () => {
            const stateManager = new StateManager();
            const mockCallback = jest.fn();
            
            // 状態変更イベントリスナーを登録
            stateManager.onStateChange(mockCallback);
            
            // エンカウント発生
            const encounterResult = {
                encountered: true,
                monster: new Monster('slime')
            };
            stateManager.handleEncounter(encounterResult);
            
            // イベントが発火されたことを確認
            expect(mockCallback).toHaveBeenCalledWith({
                from: 'field',
                to: 'battle',
                data: encounterResult,
                type: 'encounter'
            });
        });
    });

    describe('統合テスト - プレイヤー移動とエンカウント', () => {
        test('プレイヤー移動時のエンカウント処理と状態遷移', () => {
            const player = new Player();
            const stateManager = new StateManager();
            const encounterSystem = new EncounterSystem();
            
            // プレイヤーを初期位置に配置
            player.setPosition(10, 10);
            
            // フィールド状態であることを確認
            expect(stateManager.getCurrentState()).toBe('field');
            
            // プレイヤー移動をシミュレート（エンカウント発生）
            const monsters = ['slime', 'goblin'];
            
            // Math.randomをモックしてエンカウント発生を保証
            const originalRandom = Math.random;
            Math.random = jest.fn()
                .mockReturnValueOnce(0.05) // エンカウント判定で成功
                .mockReturnValueOnce(0.3); // モンスター選択
            
            // 移動処理とエンカウント判定
            const encounterResult = encounterSystem.processEncounter(0.1, monsters);
            
            // エンカウント結果を状態管理に渡す
            stateManager.handleEncounter(encounterResult);
            
            // 戦闘状態に遷移したことを確認
            expect(stateManager.getCurrentState()).toBe('battle');
            expect(stateManager.getBattleState().monster).toBe('slime');
            
            // Math.randomを元に戻す
            Math.random = originalRandom;
        });

        test('複数回の状態遷移が正しく動作する', () => {
            const player = new Player();
            const stateManager = new StateManager();
            
            // 1回目: フィールド→戦闘→フィールド（勝利）
            stateManager.handleEncounter({
                encountered: true,
                monster: new Monster('slime')
            });
            expect(stateManager.getCurrentState()).toBe('battle');
            
            stateManager.handleBattleEnd({
                isOver: true,
                winner: 'player',
                experienceGained: 1,
                goldGained: 2
            });
            expect(stateManager.getCurrentState()).toBe('field');
            
            // 2回目: フィールド→戦闘→フィールド（逃走）
            stateManager.handleEncounter({
                encountered: true,
                monster: new Monster('orc')
            });
            expect(stateManager.getCurrentState()).toBe('battle');
            
            stateManager.handleFleeResult({
                success: true,
                fleeChance: 0.6,
                attempts: 1
            });
            expect(stateManager.getCurrentState()).toBe('field');
        });
    });
});