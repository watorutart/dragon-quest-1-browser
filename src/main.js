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
        this.currentState = 'field';
        
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
        
        // マップ作成と実際のマップデータの読み込み
        this.map = new Map();
        this.mapData = window.MapData.createTestWorldMapData();
        this.map.loadMapData(this.mapData);
        
        // プレイヤーの初期位置を設定
        this.player.setPosition(
            this.mapData.playerStartPosition.x,
            this.mapData.playerStartPosition.y
        );
        
        // 描画エンジン
        this.renderEngine = new RenderEngine(this.canvas);
        this.renderEngine.setDebugMode(true); // デバッグモード有効
        
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
        
        // カメラシステムの初期化
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            smoothing: 0.1
        };
        
        // 初期状態をフィールドに設定
        const fieldState = new FieldState(this.player, this.map, this.encounterSystem);
        this.stateManager.setState(fieldState);
        
        console.log('ゲームシステム初期化完了');
        console.log('マップ:', this.mapData.worldName);
        console.log('プレイヤー初期位置:', this.player.x, this.player.y);
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
        // カメラ更新
        this.updateCamera();
        
        // 現在の状態を更新
        const currentState = this.stateManager.getCurrentState();
        if (currentState && currentState.update) {
            currentState.update(deltaTime);
        }
        
        // UI更新
        this.updateUI();
    }
    
    /**
     * カメラ更新（プレイヤーを追従）
     */
    updateCamera() {
        if (!this.player) return;
        
        const tileSize = 32;
        
        // プレイヤーを画面中央に表示する位置を計算
        this.camera.targetX = (this.player.x * tileSize) - (this.canvas.width / 2);
        this.camera.targetY = (this.player.y * tileSize) - (this.canvas.height / 2);
        
        // カメラのスムーズな移動
        this.camera.x += (this.camera.targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (this.camera.targetY - this.camera.y) * this.camera.smoothing;
        
        // マップ境界での制限
        const maxCameraX = (this.mapData.width * tileSize) - this.canvas.width;
        const maxCameraY = (this.mapData.height * tileSize) - this.canvas.height;
        
        this.camera.x = Math.max(0, Math.min(maxCameraX, this.camera.x));
        this.camera.y = Math.max(0, Math.min(maxCameraY, this.camera.y));
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
        
        // 現在の状態に応じて描画
        switch (this.currentState) {
            case 'field':
                this.renderFieldState();
                break;
            case 'battle':
                this.renderBattleState();
                break;
            case 'dialog':
                this.renderFieldState(); // 背景としてフィールドを描画
                this.renderDialogState();
                break;
            default:
                this.renderFieldState();
        }
        
        // デバッグ情報表示
        if (this.renderEngine.debugMode) {
            this.renderDebugInfo();
        }
    }
    
    /**
     * フィールド状態の描画
     */
    renderFieldState() {
        // 実際のマップを描画
        if (this.mapData) {
            this.renderEngine.renderMap(this.mapData, this.camera.x, this.camera.y, 32);
            this.renderEngine.renderNPCs(this.mapData.npcs, this.camera.x, this.camera.y, 32);
            this.renderEngine.renderPlayer(this.player, this.camera.x, this.camera.y, 32);
        }
    }
    
    /**
     * 戦闘状態の描画
     */
    renderBattleState() {
        const currentState = this.stateManager.getCurrentState();
        if (currentState && currentState.constructor.name === 'BattleState') {
            this.renderEngine.renderBattleScreen(currentState);
        }
    }
    
    /**
     * 対話状態の描画
     */
    renderDialogState() {
        const currentState = this.stateManager.getCurrentState();
        if (currentState && currentState.constructor.name === 'DialogState') {
            this.renderEngine.renderDialogScreen(currentState);
        }
    }
    
    /**
     * デバッグ情報を描画
     */
    renderDebugInfo() {
        this.renderEngine.drawText(`Player: (${this.player.x}, ${this.player.y})`, 10, 20, '#FFFFFF', '14px monospace');
        this.renderEngine.drawText(`Camera: (${Math.round(this.camera.x)}, ${Math.round(this.camera.y)})`, 10, 40, '#FFFFFF', '14px monospace');
        this.renderEngine.drawText(`Map: ${this.mapData.worldName}`, 10, 60, '#FFFFFF', '14px monospace');
        
        const stats = this.renderEngine.getStats();
        this.renderEngine.drawText(`Draw calls: ${stats.drawCalls}`, 10, this.canvas.height - 40, '#FFFFFF', '12px monospace');
        this.renderEngine.drawText(`Culled: ${stats.culledDrawCalls}`, 10, this.canvas.height - 20, '#FFFFFF', '12px monospace');
    }
    
    /**
     * 入力ハンドラーの設定
     */
    setupInputHandlers() {
        this.inputHandler.onKeyDown = (key) => {
            // デバッグモード切り替え
            if (key === 'F3') {
                this.renderEngine.setDebugMode(!this.renderEngine.debugMode);
                return;
            }
            
            // 現在の状態に応じた入力処理
            switch (this.currentState) {
                case 'field':
                    this.handlePlayerMovement(key);
                    this.handleFieldInput(key);
                    break;
                case 'battle':
                    this.handleBattleInput(key);
                    break;
                case 'dialog':
                    this.handleDialogInput(key);
                    break;
            }
            
            // 状態クラスの入力処理も呼び出す
            const currentState = this.stateManager.getCurrentState();
            if (currentState && currentState.handleInput) {
                currentState.handleInput(key, this.stateManager);
            }
        };
        
        this.inputHandler.enable();
    }
    
    /**
     * プレイヤー移動処理
     */
    handlePlayerMovement(key) {
        if (!this.player || !this.map) return;
        
        let newX = this.player.x;
        let newY = this.player.y;
        
        switch(key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                newY--;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                newY++;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                newX--;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                newX++;
                break;
            default:
                return; // 移動キーでない場合は何もしない
        }
        
        // 移動可能かチェック
        if (this.map.isWalkable(newX, newY)) {
            this.player.setPosition(newX, newY);
            
            // エンカウント判定を実行
            this.checkRandomEncounter();
        }
    }
    
    /**
     * ランダムエンカウント判定
     */
    checkRandomEncounter() {
        if (!this.encounterSystem) return;
        
        // エンカウント判定を実行
        const encounterResult = this.encounterSystem.checkEncounter(this.player);
        
        if (encounterResult.encountered) {
            // エンカウント発生時の処理
            console.log('エンカウント発生！', encounterResult.monster.name);
            this.startBattle(encounterResult.monster);
        }
    }
    
    /**
     * 戦闘開始
     * @param {Monster} monster - 敵モンスター
     */
    startBattle(monster) {
        console.log(`${monster.name}が現れた！`);
        
        // BattleStateに遷移
        const battleState = new BattleState(this.player, monster);
        battleState.startBattle();
        
        // 戦闘終了後のコールバックを設定
        battleState.onBattleEnd = (result) => {
            this.endBattle(result);
        };
        
        // 状態を戦闘に変更
        this.stateManager.setState(battleState);
        this.currentState = 'battle';
    }
    
    /**
     * 戦闘終了処理
     * @param {Object} result - 戦闘結果
     */
    endBattle(result) {
        console.log('戦闘終了:', result);
        
        // 経験値・ゴールド処理
        if (result.victory) {
            const expGained = result.expGained || 0;
            const goldGained = result.goldGained || 0;
            
            this.player.gainExperience(expGained);
            this.player.gainGold(goldGained);
            
            console.log(`${expGained}の経験値と${goldGained}Gを獲得！`);
        }
        
        // フィールド状態に戻る
        const fieldState = new FieldState(this.player, this.map, this.encounterSystem);
        this.stateManager.setState(fieldState);
        this.currentState = 'field';
    }
    
    /**
     * フィールド状態での入力処理
     * @param {string} key - 押されたキー
     */
    handleFieldInput(key) {
        // Enterキーでnpc interaction
        if (key === 'Enter') {
            this.checkNPCInteraction();
        }
    }
    
    /**
     * 戦闘状態での入力処理
     * @param {string} key - 押されたキー
     */
    handleBattleInput(key) {
        const currentState = this.stateManager.getCurrentState();
        if (!currentState || currentState.constructor.name !== 'BattleState') return;
        
        switch (key) {
            case '1':
                // 攻撃コマンド
                const attackResult = currentState.executeCommand('attack');
                if (attackResult.success) {
                    currentState.lastMessage = `${attackResult.damage}のダメージ！`;
                    currentState.nextTurn();
                }
                break;
            case '2':
                // 逃走コマンド
                const fleeResult = currentState.executeCommand('flee');
                if (fleeResult.success) {
                    currentState.lastMessage = '逃走成功！';
                    this.endBattle({ victory: false, fled: true });
                } else {
                    currentState.lastMessage = '逃走失敗...';
                    currentState.nextTurn();
                }
                break;
        }
        
        // 戦闘終了チェック
        const battleResult = currentState.checkBattleEnd();
        if (battleResult.isOver) {
            this.endBattle(battleResult);
        }
    }
    
    /**
     * 対話状態での入力処理
     * @param {string} key - 押されたキー
     */
    handleDialogInput(key) {
        if (key === 'Enter') {
            // 対話終了処理
            this.currentState = 'field';
        }
    }
    
    /**
     * NPC相互作用チェック
     */
    checkNPCInteraction() {
        if (!this.mapData || !this.mapData.npcs) return;
        
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // プレイヤーの隣接位置をチェック
        const adjacentPositions = [
            { x: playerX, y: playerY - 1 }, // 上
            { x: playerX + 1, y: playerY }, // 右
            { x: playerX, y: playerY + 1 }, // 下
            { x: playerX - 1, y: playerY }  // 左
        ];
        
        for (const pos of adjacentPositions) {
            const npc = this.map.getNPCAt(pos.x, pos.y);
            if (npc) {
                this.startDialog(npc);
                break;
            }
        }
    }
    
    /**
     * 対話開始
     * @param {Object} npc - NPC オブジェクト
     */
    startDialog(npc) {
        console.log(`${npc.name}と話す:`);
        console.log(npc.dialogue[0]);
        
        // 将来的にDialogStateクラスを使用する
        this.currentState = 'dialog';
        // TODO: DialogState implementation
    }
}