/**
 * StateManager - ゲーム状態管理システム
 * フィールド、戦闘、メニューなどの状態遷移を管理
 */

// 依存性の解決
let BattleState, Player;
if (typeof require !== 'undefined') {
    BattleState = require('./battleState');
    Player = require('./player');
}

// ブラウザ環境では他のスクリプトファイルから直接参照

// 状態定数
const GAME_STATES = {
    FIELD: 'field',
    BATTLE: 'battle',
    MENU: 'menu',
    DIALOG: 'dialog'
};

// 状態遷移ルール
const VALID_TRANSITIONS = {
    [GAME_STATES.FIELD]: [GAME_STATES.BATTLE, GAME_STATES.MENU, GAME_STATES.DIALOG],
    [GAME_STATES.BATTLE]: [GAME_STATES.FIELD],
    [GAME_STATES.MENU]: [GAME_STATES.FIELD],
    [GAME_STATES.DIALOG]: [GAME_STATES.FIELD]
};

class StateManager {
    /**
     * StateManagerを初期化する
     */
    constructor() {
        this.currentState = GAME_STATES.FIELD;
        this.battleState = null;
        this.fieldState = {
            playerPosition: { x: 10, y: 10 },
            lastEncounterStep: 0
        };
        this.stateChangeListeners = [];
        this.transitionHandlers = this._initializeTransitionHandlers();
    }

    /**
     * 現在の状態を取得する
     * @returns {string} 現在の状態 ('field', 'battle', 'menu', 'dialog')
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * 戦闘状態オブジェクトを取得する
     * @returns {BattleState|null} 戦闘状態オブジェクト
     */
    getBattleState() {
        return this.battleState;
    }

    /**
     * フィールド状態オブジェクトを取得する
     * @returns {Object} フィールド状態オブジェクト
     */
    getFieldState() {
        return this.fieldState;
    }

    /**
     * エンカウント結果を処理して状態遷移を行う
     * @param {Object} encounterResult - エンカウント結果
     * @param {boolean} encounterResult.encountered - エンカウントが発生したか
     * @param {Monster} encounterResult.monster - 出現したモンスター
     */
    handleEncounter(encounterResult) {
        if (!encounterResult.encountered) {
            return; // エンカウント未発生の場合は何もしない
        }

        this._executeTransition(GAME_STATES.BATTLE, encounterResult, 'encounter');
    }

    /**
     * 戦闘終了結果を処理して状態遷移を行う
     * @param {Object} battleResult - 戦闘結果
     * @param {boolean} battleResult.isOver - 戦闘が終了したか
     * @param {string} battleResult.winner - 勝者 ('player' or 'monster')
     * @param {number} battleResult.experienceGained - 獲得経験値
     * @param {number} battleResult.goldGained - 獲得ゴールド
     */
    handleBattleEnd(battleResult) {
        if (this.currentState !== GAME_STATES.BATTLE) {
            throw new Error('Invalid state transition: not in battle');
        }

        if (!battleResult.isOver) {
            return; // 戦闘が終了していない場合は何もしない
        }

        this._executeTransition(GAME_STATES.FIELD, battleResult, 'battleEnd');
    }

    /**
     * 逃走結果を処理して状態遷移を行う
     * @param {Object} fleeResult - 逃走結果
     * @param {boolean} fleeResult.success - 逃走が成功したか
     * @param {number} fleeResult.fleeChance - 逃走成功率
     * @param {number} fleeResult.attempts - 逃走試行回数
     */
    handleFleeResult(fleeResult) {
        if (this.currentState !== GAME_STATES.BATTLE) {
            return; // 戦闘状態でない場合は何もしない
        }

        if (fleeResult.success) {
            this._executeTransition(GAME_STATES.FIELD, fleeResult, 'flee');
        }
        // 逃走失敗時は戦闘状態を継続（何もしない）
    }

    /**
     * 状態変更イベントリスナーを登録する
     * @param {Function} callback - コールバック関数
     */
    onStateChange(callback) {
        this.stateChangeListeners.push(callback);
    }

    /**
     * 状態変更イベントリスナーを削除する
     * @param {Function} callback - 削除するコールバック関数
     */
    offStateChange(callback) {
        const index = this.stateChangeListeners.indexOf(callback);
        if (index > -1) {
            this.stateChangeListeners.splice(index, 1);
        }
    }

    /**
     * 状態遷移ハンドラーを初期化する
     * @private
     * @returns {Object} 遷移ハンドラーのマップ
     */
    _initializeTransitionHandlers() {
        return {
            encounter: (data) => this._handleEncounterTransition(data),
            battleEnd: (data) => this._handleBattleEndTransition(data),
            flee: (data) => this._handleFleeTransition(data)
        };
    }

    /**
     * 状態遷移を実行する
     * @private
     * @param {string} targetState - 遷移先の状態
     * @param {Object} data - 遷移データ
     * @param {string} transitionType - 遷移タイプ
     */
    _executeTransition(targetState, data, transitionType) {
        // 遷移の妥当性をチェック
        if (!this._isValidTransition(this.currentState, targetState)) {
            throw new Error(`Invalid transition from ${this.currentState} to ${targetState}`);
        }

        const previousState = this.currentState;
        
        // 遷移前処理
        this._beforeStateTransition(previousState, targetState, data);
        
        // 状態変更
        this.currentState = targetState;
        
        // 遷移後処理
        if (this.transitionHandlers[transitionType]) {
            this.transitionHandlers[transitionType](data);
        }
        
        // 状態変更イベントを発火
        this._emitStateChange({
            from: previousState,
            to: targetState,
            data: data,
            type: transitionType
        });
    }

    /**
     * 状態遷移の妥当性をチェックする
     * @private
     * @param {string} fromState - 遷移元の状態
     * @param {string} toState - 遷移先の状態
     * @returns {boolean} 妥当な遷移の場合true
     */
    _isValidTransition(fromState, toState) {
        const validTargets = VALID_TRANSITIONS[fromState];
        return validTargets && validTargets.includes(toState);
    }

    /**
     * 状態遷移前の処理
     * @private
     * @param {string} fromState - 遷移元の状態
     * @param {string} toState - 遷移先の状態
     * @param {Object} data - 遷移データ
     */
    _beforeStateTransition(fromState, toState, data) {
        // 戦闘状態から離脱する場合の処理
        if (fromState === GAME_STATES.BATTLE && toState !== GAME_STATES.BATTLE) {
            this.battleState = null;
        }
    }

    /**
     * エンカウント遷移の処理
     * @private
     * @param {Object} data - エンカウントデータ
     */
    _handleEncounterTransition(data) {
        // プレイヤーは外部から注入される想定だが、テストのため仮実装
        // ブラウザ環境ではPlayerクラスは既に利用可能
        const player = new Player();
        
        this.battleState = new BattleState(player, data.monster);
        this.battleState.startBattle();
    }

    /**
     * 戦闘終了遷移の処理
     * @private
     * @param {Object} data - 戦闘終了データ
     */
    _handleBattleEndTransition(data) {
        // 戦闘終了時の追加処理（経験値・ゴールド処理など）
        // 現在は特別な処理なし（将来の拡張用）
    }

    /**
     * 逃走遷移の処理
     * @private
     * @param {Object} data - 逃走データ
     */
    _handleFleeTransition(data) {
        // 逃走時の追加処理
        // 現在は特別な処理なし（将来の拡張用）
    }

    /**
     * 状態変更イベントを発火する
     * @private
     * @param {Object} eventData - イベントデータ
     */
    _emitStateChange(eventData) {
        this.stateChangeListeners.forEach(listener => {
            try {
                listener(eventData);
            } catch (error) {
                console.error('State change listener error:', error);
            }
        });
    }

    /**
     * 状態オブジェクトを設定する（初期化用）
     * @param {Object} stateObject - 状態オブジェクト
     */
    setState(stateObject) {
        if (stateObject instanceof FieldState) {
            this.fieldState = stateObject;
            this.currentState = GAME_STATES.FIELD;
        } else if (stateObject instanceof BattleState) {
            this.battleState = stateObject;
            this.currentState = GAME_STATES.BATTLE;
        } else {
            throw new Error('Invalid state object type');
        }
    }

    /**
     * 状態を強制的に設定する（デバッグ用）
     * @param {string} state - 設定する状態
     */
    _setState(state) {
        const previousState = this.currentState;
        this.currentState = state;
        
        this._emitStateChange({
            from: previousState,
            to: state,
            data: { forced: true }
        });
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}