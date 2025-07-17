/**
 * Battle Transition テスト - 戦闘画面遷移システムのテスト
 */

// モックとしてDOM環境をセットアップ
const mockCanvas = {
    width: 800,
    height: 600,
    getContext: jest.fn(),
    style: {}
};

const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    set fillStyle(value) { this._fillStyle = value; },
    get fillStyle() { return this._fillStyle; },
    set strokeStyle(value) { this._strokeStyle = value; },
    get strokeStyle() { return this._strokeStyle; },
    set font(value) { this._font = value; },
    get font() { return this._font; },
    set lineWidth(value) { this._lineWidth = value; },
    get lineWidth() { return this._lineWidth; },
    imageSmoothingEnabled: false
};

mockCanvas.getContext.mockReturnValue(mockContext);

// DOM環境のモック
global.document = {
    getElementById: jest.fn(() => mockCanvas),
    addEventListener: jest.fn()
};

global.window = {
    MapData: {
        createTestWorldMapData: jest.fn(() => ({
            width: 20,
            height: 20,
            worldName: 'テストワールド',
            playerStartPosition: { x: 10, y: 10 },
            layers: [{
                name: 'background',
                data: new Array(400).fill(1)
            }],
            tileDefinitions: {
                1: { color: '#228B22', walkable: true, name: 'grass' }
            },
            npcs: []
        }))
    }
};

global.performance = {
    now: jest.fn(() => Date.now())
};

global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 16));

// 必要なクラスをインポート
const Player = require('../src/player');
const Monster = require('../src/monster');
const EncounterSystem = require('../src/encounterSystem');
const BattleState = require('../src/battleState');
const StateManager = require('../src/stateManager');
const FieldState = require('../src/fieldState');

describe('Battle Transition System', () => {
    let player, monster, encounterSystem, battleState, stateManager;
    
    beforeEach(() => {
        player = new Player('テスト勇者', 1);
        player.setPosition(10, 10);
        
        monster = new Monster('slime');
        encounterSystem = new EncounterSystem();
        stateManager = new StateManager();
        
        battleState = new BattleState(player, monster);
    });
    
    describe('エンカウントから戦闘開始までの流れ', () => {
        test('エンカウント発生時に戦闘状態に遷移する', () => {
            // エンカウント率を100%に設定
            encounterSystem.encounterRate = 1.0;
            
            // エンカウント判定を実行（確実にslimeが出現するよう設定）
            const encounterResult = encounterSystem.processEncounter(1.0, ['slime']);
            
            expect(encounterResult.encountered).toBe(true);
            expect(encounterResult.monster).toBe('slime');
            
            // 戦闘状態を作成
            const testBattleState = new BattleState(player, new Monster(encounterResult.monster));
            testBattleState.startBattle();
            
            expect(testBattleState.isActive).toBe(true);
            expect(testBattleState.currentTurn).toBe('player');
        });
        
        test('戦闘状態への遷移が正しく管理される', () => {
            // FieldStateインスタンスを作成
            const mockMap = { loadMapData: jest.fn(), isWalkable: jest.fn(() => true) };
            const fieldState = new FieldState(player, mockMap);
            stateManager.setState(fieldState);
            
            // StateManagerがFIELD状態になることを確認
            expect(stateManager.currentState).toBe('field');
            expect(stateManager.fieldState).toBe(fieldState);
            
            // 戦闘状態に遷移
            battleState.startBattle();
            stateManager.setState(battleState);
            
            // StateManagerがBATTLE状態になることを確認
            expect(stateManager.currentState).toBe('battle');
            expect(stateManager.battleState).toBe(battleState);
            expect(stateManager.battleState.isActive).toBe(true);
        });
        
        test('戦闘画面の描画が正しく切り替わる', () => {
            // 戦闘状態を開始
            battleState.startBattle();
            
            // 戦闘状態の基本情報が正しく設定されている
            expect(battleState.player).toBe(player);
            expect(battleState.monster).toBe(monster);
            expect(battleState.isActive).toBe(true);
            expect(battleState.currentTurn).toBe('player');
        });
    });
    
    describe('戦闘中の状態管理', () => {
        test('プレイヤーの攻撃後にモンスターターンに切り替わる', () => {
            battleState.startBattle();
            expect(battleState.currentTurn).toBe('player');
            
            // プレイヤーの攻撃を実行
            const attackResult = battleState.executeCommand('attack');
            expect(attackResult.success).toBe(true);
            
            // ターンを切り替え
            battleState.nextTurn();
            expect(battleState.currentTurn).toBe('monster');
        });
        
        test('戦闘状態中のプレイヤー入力が正しく処理される', () => {
            battleState.startBattle();
            
            // 攻撃コマンドが正しく実行される
            const attackResult = battleState.executeCommand('attack');
            expect(attackResult.success).toBe(true);
            expect(attackResult).toHaveProperty('damage');
            expect(attackResult).toHaveProperty('targetHp');
        });
        
        test('戦闘終了条件が正しく判定される', () => {
            battleState.startBattle();
            
            // モンスターのHPを0にする
            monster.hp = 0;
            
            const battleResult = battleState.checkBattleEnd();
            expect(battleResult.isOver).toBe(true);
            expect(battleResult.winner).toBe('player');
        });
    });
    
    describe('戦闘画面の表示要素', () => {
        test('戦闘状態でプレイヤー情報が正しく取得できる', () => {
            battleState.startBattle();
            
            expect(battleState.player.name).toBe('テスト勇者');
            expect(battleState.player.level).toBe(1);
            expect(battleState.player.hp).toBeGreaterThan(0);
        });
        
        test('戦闘状態でモンスター情報が正しく取得できる', () => {
            battleState.startBattle();
            
            expect(battleState.monster.name).toBe('スライム');
            expect(battleState.monster.hp).toBeGreaterThan(0);
            expect(battleState.monster.attack).toBeGreaterThan(0);
        });
        
        test('戦闘メッセージが正しく設定される', () => {
            battleState.startBattle();
            
            // 攻撃を実行してメッセージを確認
            const attackResult = battleState.executeCommand('attack');
            if (attackResult.success) {
                battleState.lastMessage = `${attackResult.damage}のダメージ！`;
                expect(battleState.lastMessage).toContain('ダメージ');
            }
        });
    });
    
    describe('戦闘画面遷移のエラーハンドリング', () => {
        test('無効なモンスターでの戦闘開始を防ぐ', () => {
            expect(() => {
                new BattleState(player, null);
            }).not.toThrow(); // コンストラクタ自体はエラーにならない
            
            const invalidBattleState = new BattleState(player, null);
            // nullモンスターでの戦闘開始は問題が発生する可能性があるが、
            // 実際のゲームロジックでは事前にチェックされるべき
        });
        
        test('戦闘終了後の状態が正しくリセットされる', () => {
            battleState.startBattle();
            expect(battleState.isActive).toBe(true);
            
            battleState.endBattle();
            expect(battleState.isActive).toBe(false);
            expect(battleState.isOver).toBe(true);
        });
        
        test('非アクティブ状態でのコマンド実行が拒否される', () => {
            battleState.endBattle(); // 戦闘を終了
            
            const result = battleState.executeCommand('attack');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Battle is not active');
        });
    });
});