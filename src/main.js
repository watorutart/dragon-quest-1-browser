/**
 * ドラゴンクエスト1 - メインゲームファイル
 */

// ゲーム初期化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
        console.error('Canvas context not available');
        return;
    }
    
    // ゲームエンジンの初期化
    const game = new GameEngine(canvas, ctx);
    game.init();
    game.start();
});

/**
 * メインゲームエンジンクラス
 */
class GameEngine {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;
        this.isRunning = false;
        this.lastTime = 0;
        
        // ゲーム状態
        this.gameState = 'field';
        
        // 基本設定
        this.tileSize = 16;
        this.scale = 2; // ピクセルアートのスケール
        
        // 実際の描画サイズを設定
        this.canvas.style.width = (this.canvas.width * this.scale) + 'px';
        this.canvas.style.height = (this.canvas.height * this.scale) + 'px';
    }
    
    /**
     * ゲーム初期化
     */
    init() {
        console.log('ドラゴンクエスト1 - ゲーム初期化中...');
        
        // キーボードイベントリスナーの設定
        this.setupInputHandlers();
        
        // 初期画面の描画
        this.render();
        
        console.log('ゲーム初期化完了');
    }
    
    /**
     * ゲーム開始
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
        
        console.log('ゲーム開始');
    }
    
    /**
     * メインゲームループ
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // ゲーム更新
        this.update(deltaTime);
        
        // 画面描画
        this.render();
        
        // 次のフレームをリクエスト
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * ゲーム状態更新
     */
    update(deltaTime) {
        // 現在は基本的な更新のみ
        // 後のタスクで具体的なゲームロジックを実装
    }
    
    /**
     * 画面描画
     */
    render() {
        // 画面クリア
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 基本的なテスト描画
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(100, 100, this.tileSize, this.tileSize);
        
        // テキスト表示
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px monospace';
        this.ctx.fillText('ドラゴンクエスト1 - 準備完了', 50, 50);
    }
    
    /**
     * 入力ハンドラーの設定
     */
    setupInputHandlers() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
    }
    
    /**
     * キー押下処理
     */
    handleKeyDown(event) {
        console.log('Key pressed:', event.key);
        
        // 基本的なキー処理（後のタスクで拡張）
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                console.log('上移動');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                console.log('下移動');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                console.log('左移動');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                console.log('右移動');
                break;
        }
        
        event.preventDefault();
    }
    
    /**
     * キー離上処理
     */
    handleKeyUp(event) {
        // 現在は何もしない
    }
}