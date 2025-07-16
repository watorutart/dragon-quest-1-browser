/**
 * FieldState - フィールド状態管理クラス
 * プレイヤーの移動、エンカウント処理、入力処理を管理
 */

// 依存性の解決
let InputHandler, EncounterSystem, Map;
if (typeof require !== 'undefined') {
    InputHandler = require('./inputHandler');
    EncounterSystem = require('./encounterSystem');
    Map = require('./map');
}

// ブラウザ環境では他のスクリプトファイルから直接参照

// 定数定義
const FIELD_CONFIG = {
    DEFAULT_PLAYER_X: 10,
    DEFAULT_PLAYER_Y: 10,
    MAP_WIDTH: 120,
    MAP_HEIGHT: 120,
    ENCOUNTER_RATE: 0.1,
    AVAILABLE_MONSTERS: ['slime', 'goblin']
};

class FieldState {
    /**
     * FieldState を初期化する
     * @param {Player} player - プレイヤーオブジェクト
     * @param {Map} map - マップオブジェクト
     * @param {Object} config - 設定オプション
     */
    constructor(player, map, config = {}) {
        this.player = player;
        this.map = map;
        this.config = { ...FIELD_CONFIG, ...config };
        
        // システムコンポーネントを初期化
        this.inputHandler = new InputHandler();
        this.encounterSystem = new EncounterSystem();
        
        // プレイヤーの初期位置を設定
        this.player.setPosition(this.config.DEFAULT_PLAYER_X, this.config.DEFAULT_PLAYER_Y);
        
        // 状態管理
        this.isActive = true;
        this.lastMoveTime = 0;
        // Hook test - with universal trigger (*)
    }

    /**
     * プレイヤーの移動を処理する
     * @param {string} direction - 移動方向 ('up', 'down', 'left', 'right')
     * @returns {Object} 移動結果
     */
    handlePlayerMove(direction) {
        const currentX = this.player.x;
        const currentY = this.player.y;
        let newX = currentX;
        let newY = currentY;

        // 移動方向に応じて新しい座標を計算
        switch (direction) {
            case 'up':
                newY = currentY - 1;
                break;
            case 'down':
                newY = currentY + 1;
                break;
            case 'left':
                newX = currentX - 1;
                break;
            case 'right':
                newX = currentX + 1;
                break;
            default:
                return { success: false, reason: 'Invalid direction' };
        }

        // 移動可能性をチェック
        if (!this._canMoveTo(newX, newY)) {
            return { success: false, reason: 'Cannot move to target position' };
        }

        // プレイヤーを移動
        this.player.setPosition(newX, newY);

        // エンカウント判定を実行
        const encounterResult = this.encounterSystem.processEncounter(
            this.config.ENCOUNTER_RATE, 
            this.config.AVAILABLE_MONSTERS
        );

        return {
            success: true,
            encounter: encounterResult,
            newPosition: { x: newX, y: newY }
        };
    }

    /**
     * 入力を処理する
     * @param {Object} inputEvent - 入力イベント
     * @returns {Object} 処理結果
     */
    handleInput(inputEvent) {
        if (inputEvent.type !== 'keydown') {
            return { handled: false };
        }

        let direction = null;

        // キー入力を方向に変換
        switch (inputEvent.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                direction = 'up';
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                direction = 'down';
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                direction = 'left';
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                direction = 'right';
                break;
            default:
                return { handled: false };
        }

        // 移動を実行
        const moveResult = this.handlePlayerMove(direction);
        
        return {
            handled: true,
            moveResult: moveResult
        };
    }

    /**
     * 状態を更新する
     * @param {number} deltaTime - 前回の更新からの経過時間（ミリ秒）
     */
    update(deltaTime) {
        // 現在は特別な更新処理なし
        // 将来的にはアニメーション、時間経過処理などを追加
    }

    /**
     * 描画処理を実行する
     * @param {Object} renderer - レンダラーオブジェクト
     */
    render(renderer) {
        // マップを描画
        renderer.drawMap(this.map);
        
        // プレイヤーを描画
        renderer.drawPlayer(this.player);
        
        // UIを描画
        renderer.drawUI();
    }

    /**
     * フィールド状態をアクティブ/非アクティブに設定
     * @param {boolean} active - アクティブ状態
     */
    setActive(active) {
        this.isActive = active;
    }

    /**
     * フィールド状態がアクティブかチェック
     * @returns {boolean} アクティブな場合true
     */
    isFieldActive() {
        return this.isActive;
    }

    /**
     * 指定座標に移動可能かチェックする
     * @private
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 移動可能な場合true
     */
    _canMoveTo(x, y) {
        // 境界チェック
        if (x < 0 || y < 0) {
            return false;
        }

        // マップの境界チェック（設定値を使用）
        if (x >= this.config.MAP_WIDTH || y >= this.config.MAP_HEIGHT) {
            return false;
        }

        // コリジョン判定（マップがある場合）
        if (this.map && this.map.isCollision) {
            return !this.map.isCollision(x, y);
        }

        // デフォルトでは移動可能
        return true;
    }

    /**
     * 移動方向を正規化する
     * @private
     * @param {string} direction - 移動方向
     * @returns {Object|null} 正規化された移動ベクトル
     */
    _normalizeDirection(direction) {
        const directions = {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
        
        return directions[direction] || null;
    }

    /**
     * リソースをクリーンアップする
     */
    cleanup() {
        if (this.inputHandler && this.inputHandler.cleanup) {
            this.inputHandler.cleanup();
        }
        this.isActive = false;
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FieldState;
}