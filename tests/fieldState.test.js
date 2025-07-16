/**
 * FieldState のテスト
 * フィールド状態のテスト駆動実装
 */

describe('FieldState System', () => {
    let FieldState, Player, Map, InputHandler, EncounterSystem;

    beforeEach(() => {
        // 必要なクラスをrequire
        FieldState = require('../src/fieldState.js');
        Player = require('../src/player.js');
        Map = require('../src/map.js');
        InputHandler = require('../src/inputHandler.js');
        EncounterSystem = require('../src/encounterSystem.js');
    });

    describe('FieldState 初期化', () => {
        test('FieldState が正しく初期化される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            expect(fieldState.player).toBe(player);
            expect(fieldState.map).toBe(map);
            expect(fieldState.inputHandler).toBeDefined();
            expect(fieldState.encounterSystem).toBeDefined();
        });

        test('プレイヤーの初期位置が設定される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // プレイヤーの初期位置を確認
            expect(player.x).toBe(10);
            expect(player.y).toBe(10);
        });
    });

    describe('プレイヤー移動処理', () => {
        test('有効な移動が実行される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // 初期位置を設定
            player.setPosition(10, 10);
            
            // 右に移動
            const moveResult = fieldState.handlePlayerMove('right');
            
            expect(moveResult.success).toBe(true);
            expect(player.x).toBe(11);
            expect(player.y).toBe(10);
        });

        test('無効な移動は拒否される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // 壁のある位置に移動を試行
            player.setPosition(0, 0);
            
            // 左に移動（境界外）
            const moveResult = fieldState.handlePlayerMove('left');
            
            expect(moveResult.success).toBe(false);
            expect(player.x).toBe(0);
            expect(player.y).toBe(0);
        });

        test('移動時にエンカウント判定が実行される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            player.setPosition(10, 10);
            
            // Math.randomをモックしてエンカウント発生を制御
            const originalRandom = Math.random;
            Math.random = jest.fn().mockReturnValue(0.05); // エンカウント発生
            
            const moveResult = fieldState.handlePlayerMove('right');
            
            expect(moveResult.success).toBe(true);
            expect(moveResult.encounter).toBeDefined();
            expect(moveResult.encounter.encountered).toBe(true);
            
            Math.random = originalRandom;
        });

        test('移動時にエンカウントが発生しない場合', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            player.setPosition(10, 10);
            
            // Math.randomをモックしてエンカウント未発生を制御
            const originalRandom = Math.random;
            Math.random = jest.fn().mockReturnValue(0.9); // エンカウント未発生
            
            const moveResult = fieldState.handlePlayerMove('right');
            
            expect(moveResult.success).toBe(true);
            expect(moveResult.encounter).toBeDefined();
            expect(moveResult.encounter.encountered).toBe(false);
            
            Math.random = originalRandom;
        });
    });

    describe('入力処理', () => {
        test('キーボード入力が正しく処理される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            player.setPosition(10, 10);
            
            // 矢印キー右の入力をシミュレート
            const inputEvent = {
                type: 'keydown',
                key: 'ArrowRight'
            };
            
            const result = fieldState.handleInput(inputEvent);
            
            expect(result.handled).toBe(true);
            expect(player.x).toBe(11);
        });

        test('WASD キーが正しく処理される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            player.setPosition(10, 10);
            
            // W キーの入力をシミュレート（上移動）
            const inputEvent = {
                type: 'keydown',
                key: 'w'
            };
            
            const result = fieldState.handleInput(inputEvent);
            
            expect(result.handled).toBe(true);
            expect(player.y).toBe(9);
        });

        test('無効なキー入力は無視される', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            player.setPosition(10, 10);
            
            // 無効なキーの入力をシミュレート
            const inputEvent = {
                type: 'keydown',
                key: 'x'
            };
            
            const result = fieldState.handleInput(inputEvent);
            
            expect(result.handled).toBe(false);
            expect(player.x).toBe(10);
            expect(player.y).toBe(10);
        });
    });

    describe('状態更新', () => {
        test('update メソッドが正しく動作する', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // 更新処理を実行
            const deltaTime = 16; // 16ms (60fps)
            fieldState.update(deltaTime);
            
            // 現在は特別な処理はないが、エラーが発生しないことを確認
            expect(fieldState.player).toBe(player);
        });
    });

    describe('描画処理', () => {
        test('render メソッドが正しく動作する', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // モックレンダラーを作成
            const mockRenderer = {
                drawMap: jest.fn(),
                drawPlayer: jest.fn(),
                drawUI: jest.fn()
            };
            
            // 描画処理を実行
            fieldState.render(mockRenderer);
            
            // 各描画メソッドが呼ばれることを確認
            expect(mockRenderer.drawMap).toHaveBeenCalledWith(map);
            expect(mockRenderer.drawPlayer).toHaveBeenCalledWith(player);
            expect(mockRenderer.drawUI).toHaveBeenCalled();
        });
    });

    describe('状態管理', () => {
        test('フィールド状態のアクティブ/非アクティブ切り替え', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // 初期状態はアクティブ
            expect(fieldState.isFieldActive()).toBe(true);
            
            // 非アクティブに設定
            fieldState.setActive(false);
            expect(fieldState.isFieldActive()).toBe(false);
            
            // 再度アクティブに設定
            fieldState.setActive(true);
            expect(fieldState.isFieldActive()).toBe(true);
        });

        test('カスタム設定でFieldStateを初期化', () => {
            const player = new Player();
            const map = new Map();
            const customConfig = {
                DEFAULT_PLAYER_X: 5,
                DEFAULT_PLAYER_Y: 5,
                ENCOUNTER_RATE: 0.2
            };
            
            const fieldState = new FieldState(player, map, customConfig);
            
            // カスタム初期位置が設定されることを確認
            expect(player.x).toBe(5);
            expect(player.y).toBe(5);
        });

        test('cleanup メソッドが正しく動作する', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            // クリーンアップ前はアクティブ
            expect(fieldState.isFieldActive()).toBe(true);
            
            // クリーンアップ実行
            fieldState.cleanup();
            
            // クリーンアップ後は非アクティブ
            expect(fieldState.isFieldActive()).toBe(false);
        });
    });

    describe('統合テスト', () => {
        test('プレイヤー移動とエンカウントの統合処理', () => {
            const player = new Player();
            const map = new Map();
            const fieldState = new FieldState(player, map);
            
            player.setPosition(10, 10);
            
            // 複数回移動してエンカウントをテスト
            const originalRandom = Math.random;
            let encounterCount = 0;
            
            // 10回移動をシミュレート
            for (let i = 0; i < 10; i++) {
                Math.random = jest.fn().mockReturnValue(i < 2 ? 0.05 : 0.9);
                
                const moveResult = fieldState.handlePlayerMove('right');
                
                if (moveResult.encounter && moveResult.encounter.encountered) {
                    encounterCount++;
                }
            }
            
            // エンカウントが発生したことを確認
            expect(encounterCount).toBe(2);
            expect(player.x).toBe(20); // 10回右に移動
            
            Math.random = originalRandom;
        });
    });
});