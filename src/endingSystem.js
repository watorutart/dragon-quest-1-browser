/**
 * EndingSystem クラス - ゲームクリア処理とエンディング表示を管理
 * Requirements 6.2, 6.3, 6.4 に対応
 * 
 * 機能:
 * - ゲームクリア状態の管理
 * - プレイ統計の記録と表示
 * - エンディング演出の段階管理
 * - タイトル画面への復帰機能
 */

class EndingSystem {
    constructor() {
        // ゲーム状態
        this.gameCleared = false;
        this.gameStartTime = null;
        this.gameClearTime = null;
        
        // 統計情報のテンプレート
        this.gameStats = this._createEmptyStats();
        
        // エンディング演出の段階定義
        this.endingPhases = ['none', 'victory', 'rescue', 'stats', 'complete'];
        this.currentPhaseIndex = 0;
        
        // 定数
        this.MILLISECONDS_PER_SECOND = 1000;
        this.SECONDS_PER_MINUTE = 60;
        this.SECONDS_PER_HOUR = 3600;
    }

    /**
     * 空の統計情報オブジェクトを作成
     * @private
     * @returns {Object} 空の統計情報
     */
    _createEmptyStats() {
        return {
            isCleared: false,
            playerLevel: 0,
            finalHp: 0,
            finalMaxHp: 0,
            finalAttack: 0,
            finalDefense: 0,
            totalExperience: 0,
            finalGold: 0,
            playTime: 0
        };
    }

    /**
     * ゲーム開始時間を設定
     * @param {number} startTime - ゲーム開始時間（ミリ秒）
     */
    setGameStartTime(startTime) {
        this.gameStartTime = startTime;
    }

    /**
     * ゲームクリア状態を取得
     * @returns {boolean} クリア済みの場合true
     */
    isGameCleared() {
        return this.gameCleared;
    }

    /**
     * ゲームクリアを実行
     * @param {Object} player - プレイヤーオブジェクト（オプション）
     */
    triggerGameClear(player = null) {
        this.gameCleared = true;
        this.gameClearTime = Date.now();
        
        // プレイ時間を計算
        this._calculatePlayTime();
        
        // プレイヤー統計を記録
        this._recordPlayerStats(player);
    }

    /**
     * プレイ時間を計算
     * @private
     */
    _calculatePlayTime() {
        if (this.gameStartTime) {
            const playTimeMs = this.gameClearTime - this.gameStartTime;
            this.gameStats.playTime = Math.floor(playTimeMs / this.MILLISECONDS_PER_SECOND);
        }
    }

    /**
     * プレイヤー統計を記録
     * @private
     * @param {Object} player - プレイヤーオブジェクト
     */
    _recordPlayerStats(player) {
        this.gameStats.isCleared = true;
        
        if (player) {
            this.gameStats.playerLevel = player.level || 0;
            this.gameStats.finalHp = player.hp || 0;
            this.gameStats.finalMaxHp = player.maxHp || 0;
            this.gameStats.finalAttack = player.attack || 0;
            this.gameStats.finalDefense = player.defense || 0;
            this.gameStats.totalExperience = player.experience || 0;
            this.gameStats.finalGold = player.gold || 0;
        }
    }

    /**
     * ゲーム統計情報を取得
     * @returns {Object} 統計情報
     */
    getGameStats() {
        return { ...this.gameStats };
    }

    /**
     * エンディングメッセージを取得
     * @returns {string} エンディングメッセージ
     */
    getEndingMessage() {
        let message = '竜王を倒した！\n姫を救出した！\n世界に平和が戻った。';
        
        if (this.gameStats.playerLevel > 0) {
            message += `\n\nあなたはレベル${this.gameStats.playerLevel}で冒険を完了しました。`;
        }
        
        if (this.gameStats.playTime > 0) {
            const timeStr = this.formatPlayTime();
            message += `\nプレイ時間: ${timeStr}`;
        }
        
        return message;
    }

    /**
     * 統計情報の表示用文字列を取得
     * @returns {string} 統計情報表示
     */
    getStatsDisplay() {
        const stats = this.gameStats;
        let display = '=== 冒険の記録 ===\n';
        
        display += `クリアレベル: ${stats.playerLevel}\n`;
        display += `最終HP: ${stats.finalHp}/${stats.finalMaxHp}\n`;
        display += `最終攻撃力: ${stats.finalAttack}\n`;
        display += `最終防御力: ${stats.finalDefense}\n`;
        display += `総経験値: ${stats.totalExperience}\n`;
        display += `最終所持金: ${stats.finalGold}G\n`;
        display += `プレイ時間: ${this.formatPlayTime()}`;
        
        return display;
    }

    /**
     * プレイ時間を時:分:秒形式でフォーマット
     * @returns {string} フォーマットされた時間
     */
    formatPlayTime() {
        const totalSeconds = this.gameStats.playTime;
        const hours = Math.floor(totalSeconds / this.SECONDS_PER_HOUR);
        const minutes = Math.floor((totalSeconds % this.SECONDS_PER_HOUR) / this.SECONDS_PER_MINUTE);
        const seconds = totalSeconds % this.SECONDS_PER_MINUTE;
        
        return `${hours}:${this._padZero(minutes)}:${this._padZero(seconds)}`;
    }

    /**
     * 数値を2桁の文字列にパディング
     * @private
     * @param {number} num - パディングする数値
     * @returns {string} パディングされた文字列
     */
    _padZero(num) {
        return num.toString().padStart(2, '0');
    }

    /**
     * タイトル画面に戻ることができるかどうか
     * @returns {boolean} 戻ることができる場合true
     */
    canReturnToTitle() {
        return true;
    }

    /**
     * タイトル画面に戻る
     */
    returnToTitle() {
        this.gameCleared = false;
        this.gameStartTime = null;
        this.gameClearTime = null;
        this.currentPhaseIndex = 0;
        
        // 統計情報をリセット
        this.gameStats = this._createEmptyStats();
    }

    /**
     * タイトル復帰メッセージを取得
     * @returns {string} タイトル復帰メッセージ
     */
    getTitleReturnMessage() {
        return 'タイトル画面に戻る';
    }

    /**
     * エンディング演出を開始
     */
    startEndingSequence() {
        this.currentPhaseIndex = 1; // 'victory' フェーズから開始
    }

    /**
     * 現在のエンディング段階を取得
     * @returns {string} 現在の段階
     */
    getCurrentEndingPhase() {
        return this.endingPhases[this.currentPhaseIndex];
    }

    /**
     * 次のエンディング段階に進む
     */
    nextEndingPhase() {
        if (this.currentPhaseIndex < this.endingPhases.length - 1) {
            this.currentPhaseIndex++;
        }
    }

    /**
     * 現在の段階のメッセージを取得
     * @returns {string} 段階別メッセージ
     */
    getCurrentPhaseMessage() {
        const phase = this.getCurrentEndingPhase();
        
        switch (phase) {
            case 'victory':
                return '竜王を倒した！\n勇者の勝利だ！';
            case 'rescue':
                return '姫を救出した！\n「勇者様、ありがとうございます」';
            case 'stats':
                return '冒険の記録\n\n' + this.getStatsDisplay();
            case 'complete':
                return 'ドラゴンクエストをプレイしていただき\nありがとうございました！';
            default:
                return '';
        }
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EndingSystem;
}