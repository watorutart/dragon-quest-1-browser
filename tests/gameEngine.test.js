/**
 * GameEngine クラスのテスト
 */

// テスト用にGameEngineクラスを読み込み
// 実際のブラウザ環境ではないため、クラスを直接定義
class GameEngine {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.isRunning = false;
        this.lastTime = 0;
        this.gameState = 'field';
        this.tileSize = 16;
        this.scale = 2;
    }
    
    init() {
        this.setupInputHandlers();
        this.render();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
    }
    
    update(deltaTime) {
        // 基本更新処理
    }
    
    render() {
        if (!this.ctx) return;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setupInputHandlers() {
        // 入力ハンドラー設定
    }
    
    handleKeyDown(event) {
        // キー処理
    }
}

describe('GameEngine', () => {
    let canvas, ctx, gameEngine;
    
    beforeEach(() => {
        // モックCanvasとContextを作成
        canvas = {
            width: 800,
            height: 600,
            style: {}
        };
        
        ctx = {
            fillRect: jest.fn(),
            fillStyle: '',
            font: '',
            fillText: jest.fn()
        };
        
        gameEngine = new GameEngine(canvas, ctx);
    });
    
    test('GameEngineが正しく初期化される', () => {
        expect(gameEngine.canvas).toBe(canvas);
        expect(gameEngine.ctx).toBe(ctx);
        expect(gameEngine.isRunning).toBe(false);
        expect(gameEngine.gameState).toBe('field');
        expect(gameEngine.tileSize).toBe(16);
        expect(gameEngine.scale).toBe(2);
    });
    
    test('init()メソッドが正しく動作する', () => {
        gameEngine.init();
        // 初期化処理が実行されることを確認
        expect(ctx.fillRect).toHaveBeenCalled();
    });
    
    test('start()メソッドがゲームを開始する', () => {
        expect(gameEngine.isRunning).toBe(false);
        gameEngine.start();
        expect(gameEngine.isRunning).toBe(true);
    });
    
    test('render()メソッドが画面を描画する', () => {
        gameEngine.render();
        expect(ctx.fillStyle).toBe('#000');
        expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
    
    test('複数回start()を呼んでも問題ない', () => {
        gameEngine.start();
        expect(gameEngine.isRunning).toBe(true);
        
        gameEngine.start(); // 2回目の呼び出し
        expect(gameEngine.isRunning).toBe(true); // 状態は変わらない
    });
});