/**
 * BattleState クラス - 戦闘状態管理システム
 */

// ブラウザ環境では他のスクリプトファイルから直接参照
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleState;
}

class BattleState {
    /**
     * 戦闘状態を初期化する
     * @param {Player} player - プレイヤーオブジェクト
     * @param {Monster} monster - モンスターオブジェクト
     */
    constructor(player, monster) {
        this.player = player;
        this.monster = monster;
        this.isActive = true;
        this.isOver = false;
        this.currentTurn = 'player';
        this.battleResult = null;
        this.fleeAttempts = 0; // 逃走試行回数を追跡
    }

    /**
     * 戦闘を開始する
     */
    startBattle() {
        this.isActive = true;
        this.isOver = false;
        this.currentTurn = 'player';
        this.battleResult = null;
    }

    /**
     * 戦闘終了をチェックする
     * @returns {Object} 戦闘結果
     */
    checkBattleEnd() {
        const result = CombatSystem.checkBattleResult(this.player, this.monster);
        
        if (result.isOver) {
            this.battleResult = result;
            this.isOver = true;
        }
        
        return result;
    }

    /**
     * 戦闘を終了する
     */
    endBattle() {
        this.isActive = false;
        this.isOver = true;
    }

    /**
     * 次のターンに切り替える
     */
    nextTurn() {
        if (this.currentTurn === 'player') {
            this.currentTurn = 'monster';
        } else {
            this.currentTurn = 'player';
        }
    }

    /**
     * 戦闘コマンドを実行する
     * @param {string} command - 実行するコマンド
     * @returns {Object} コマンド実行結果
     */
    executeCommand(command) {
        if (this.isOver || !this.isActive) {
            return {
                success: false,
                error: 'Battle is not active'
            };
        }

        switch (command) {
            case 'attack':
                return this._executeAttack();
            case 'flee':
                return this._executeFlee();
            default:
                return {
                    success: false,
                    error: 'Invalid command'
                };
        }
    }

    /**
     * 攻撃コマンドを実行する
     * @private
     * @returns {Object} 攻撃結果
     */
    _executeAttack() {
        if (this.currentTurn !== 'player') {
            return {
                success: false,
                error: 'Not player turn'
            };
        }

        const attackResult = CombatSystem.playerAttack(this.player, this.monster);
        
        return {
            success: true,
            damage: attackResult.damage,
            targetHp: attackResult.targetHp
        };
    }

    /**
     * 逃走コマンドを実行する
     * @private
     * @returns {Object} 逃走結果
     */
    _executeFlee() {
        if (this.currentTurn !== 'player') {
            return {
                success: false,
                error: 'Not player turn'
            };
        }

        this.fleeAttempts++;
        const fleeChance = this._calculateFleeChance();
        const fleeSuccess = Math.random() < fleeChance;
        
        if (fleeSuccess) {
            this.endBattle();
        }
        
        return {
            success: fleeSuccess,
            fleeChance: fleeChance,
            attempts: this.fleeAttempts
        };
    }

    /**
     * 逃走成功率を計算する
     * ドラゴンクエスト1の逃走システムを再現
     * @private
     * @returns {number} 逃走成功率（0.0-1.0）
     */
    _calculateFleeChance() {
        // 基本逃走率は50%
        let baseFleeRate = 0.5;
        
        // プレイヤーのレベルが高いほど逃走しやすい（わずかに）
        const levelBonus = (this.player.level - 1) * 0.02;
        
        // モンスターのレベル（攻撃力で代用）が高いほど逃走しにくい
        const monsterPenalty = (this.monster.attack - 2) * 0.01;
        
        // 逃走試行回数が増えるほど成功率が下がる（連続逃走防止）
        const attemptPenalty = (this.fleeAttempts - 1) * 0.1;
        
        // 最終的な逃走率を計算
        let finalFleeRate = baseFleeRate + levelBonus - monsterPenalty - attemptPenalty;
        
        // 逃走率を10%〜90%の範囲に制限
        return Math.max(0.1, Math.min(0.9, finalFleeRate));
    }
}

// ブラウザ環境ではグローバルスコープで利用可能