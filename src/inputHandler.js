/**
 * InputHandler - キーボード入力を処理するクラス
 * 
 * 機能:
 * - キーボードイベントの監視と状態管理
 * - 移動キー（矢印キー、WASD）の検出
 * - 移動方向の判定とコールバック通知
 */
class InputHandler {
    constructor() {
        this.keys = {};
        this.lastPressedKey = null;
        this.movementCallback = null;
        this.onKeyDown = null;
        this.onKeyUp = null;
        
        // 移動キーのマッピング（拡張しやすい構造）
        this.movementKeys = this._createMovementKeyMap();
        
        // イベントリスナーをバインドして初期化
        this._initializeEventListeners();
    }
    
    /**
     * 移動キーマッピングを作成
     * @private
     * @returns {Object} キーマッピング
     */
    _createMovementKeyMap() {
        return {
            // 矢印キー
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            // WASD キー
            'w': 'up',
            's': 'down',
            'a': 'left',
            'd': 'right'
        };
    }
    
    /**
     * イベントリスナーを初期化
     * @private
     */
    _initializeEventListeners() {
        // イベントリスナーをバインド
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // イベントリスナーを追加
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }
    
    /**
     * キーダウンイベントハンドラー
     * @param {KeyboardEvent} event 
     */
    handleKeyDown(event) {
        const key = event.key;
        this.keys[key] = true;
        
        // 汎用キーダウンコールバック
        if (this.onKeyDown) {
            this.onKeyDown(key);
        }
        
        // 移動キーの場合、最後に押されたキーとして記録
        if (this.movementKeys[key]) {
            this.lastPressedKey = key;
            
            // コールバックが設定されている場合は呼び出し
            if (this.movementCallback) {
                this.movementCallback(this.movementKeys[key]);
            }
        }
    }
    
    /**
     * キーアップイベントハンドラー
     * @param {KeyboardEvent} event 
     */
    handleKeyUp(event) {
        const key = event.key;
        this.keys[key] = false;
        
        // 汎用キーアップコールバック
        if (this.onKeyUp) {
            this.onKeyUp(key);
        }
        
        // 最後に押されたキーが離された場合はクリア
        if (this.lastPressedKey === key) {
            this.lastPressedKey = null;
        }
    }
    
    /**
     * 指定されたキーが押されているかチェック
     * @param {string} key 
     * @returns {boolean}
     */
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    /**
     * 現在の移動方向を取得
     * @returns {string|null} 'up', 'down', 'left', 'right', または null
     */
    getMovementDirection() {
        if (this.lastPressedKey && this.keys[this.lastPressedKey]) {
            return this.movementKeys[this.lastPressedKey];
        }
        return null;
    }
    
    /**
     * 移動入力時のコールバックを設定
     * @param {Function} callback 
     */
    onMovementInput(callback) {
        this.movementCallback = callback;
    }
    
    /**
     * キー状態をリセット
     */
    reset() {
        this.keys = {};
        this.lastPressedKey = null;
    }
    
    /**
     * 入力ハンドラーを有効化
     */
    enable() {
        // 既にイベントリスナーが登録されているため、特別な処理は不要
        // 将来的に無効化機能を追加する場合に備えて空のメソッドを提供
    }
    
    /**
     * 入力ハンドラーを無効化
     */
    disable() {
        this.keys = {};
        this.lastPressedKey = null;
    }
    
    /**
     * イベントリスナーを削除してクリーンアップ
     */
    cleanup() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.keys = {};
        this.lastPressedKey = null;
        this.movementCallback = null;
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}