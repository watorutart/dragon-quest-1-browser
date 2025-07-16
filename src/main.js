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
        
        // 基本設定
        this.tileSize = 16;
        this.scale = 2;
        
        // 実際の描画サイズを設定
        this.canvas.style.width = (this.canvas.width * this.scale) + 'px';
        this.canvas.style.height = (this.canvas.height * this.scale) + 'px';
        
        // ゲームシステムの初期化
        this.initGameSystems();
    }
    
    /**
     * ゲームシステムの初期化
     */
    initGameSystems() {
        // プレイヤー作成
        this.player = new Player('勇者', 1);
        this.player.setPosition(10, 10);
        
        // マップ作成
        this.map = new Map(50, 50);
        
        // 描画エンジン
        this.renderEngine = new RenderEngine(this.canvas);
        
        // 入力ハンドラー
        this.inputHandler = new InputHandler();
        
        // 状態管理
        this.stateManager = new StateManager();
        
        // エンカウントシステム
        this.encounterSystem = new EncounterSystem();
        
        // 戦闘システム
        this.combatSystem = new CombatSystem();
        
        // エンディングシステム
        this.endingSystem = new EndingSystem();
        
        // テスト用のプレイヤー位置
        this.testPlayerX = 10;
        this.testPlayerY = 10;
        
        // 初期状態をフィールドに設定
        const fieldState = new FieldState(this.player, this.map, this.encounterSystem);
        this.stateManager.setState(fieldState);
        
        console.log('ゲームシステム初期化完了');
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
        // 現在の状態を更新
        const currentState = this.stateManager.getCurrentState();
        if (currentState && currentState.update) {
            currentState.update(deltaTime);
        }
        
        // UI更新
        this.updateUI();
    }
    
    /**
     * UI更新
     */
    updateUI() {
        const levelElement = document.getElementById('player-level');
        const hpElement = document.getElementById('player-hp');
        const goldElement = document.getElementById('player-gold');
        
        if (levelElement) levelElement.textContent = `Lv: ${this.player.level}`;
        if (hpElement) hpElement.textContent = `HP: ${this.player.hp}/${this.player.maxHp}`;
        if (goldElement) goldElement.textContent = `G: ${this.player.gold}`;
    }
    
    /**
     * 画面描画
     */
    render() {
        // 画面クリア
        this.renderEngine.clear();
        
        // テスト描画（デバッグ用）
        this.renderEngine.testDraw(this.testPlayerX, this.testPlayerY);
        
        // 現在の状態を描画
        const currentState = this.stateManager.getCurrentState();
        if (currentState && currentState.render) {
            currentState.render(this.renderEngine);
        }
    }
    
    /**
     * 入力ハンドラーの設定
     */
    setupInputHandlers() {
        this.inputHandler.onKeyDown = (key) => {
            // テスト用の移動処理
            this.handleTestMovement(key);
            
            const currentState = this.stateManager.getCurrentState();
            if (currentState && currentState.handleInput) {
                currentState.handleInput(key, this.stateManager);
            }
        };
        
        this.inputHandler.enable();
    }
    
    /**
     * テスト用の移動処理
     */
    handleTestMovement(key) {
        const maxX = Math.floor(this.canvas.width / 32) - 1;
        const maxY = Math.floor(this.canvas.height / 32) - 1;
        
        switch(key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.testPlayerY > 0) this.testPlayerY--;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.testPlayerY < maxY) this.testPlayerY++;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.testPlayerX > 0) this.testPlayerX--;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.testPlayerX < maxX) this.testPlayerX++;
                break;
        }
    }
}