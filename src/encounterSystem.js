/**
 * エンカウントシステム
 * プレイヤーの移動時にモンスターとのエンカウント判定を行う
 */

class EncounterSystem {
    /**
     * エンカウント判定を行う（原始版）
     * @param {number} encounterRate - エンカウント率 (0.0 - 1.0)
     * @returns {boolean} エンカウントが発生したかどうか
     */
    checkEncounter_primitive(encounterRate) {
        if (encounterRate <= 0) return false;
        if (encounterRate >= 1) return true;
        
        return Math.random() < encounterRate;
    }

    /**
     * モンスターリストからランダムにモンスターを選択する
     * @param {Array} monsters - モンスターリスト
     * @returns {*} 選択されたモンスター、リストが空の場合はnull
     */
    getRandomMonster(monsters) {
        if (!monsters || monsters.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * monsters.length);
        return monsters[randomIndex];
    }

    /**
     * エンカウント処理を実行する
     * @param {number} encounterRate - エンカウント率
     * @param {Array} monsters - 出現可能なモンスターリスト
     * @returns {Object} エンカウント結果
     */
    processEncounter(encounterRate, monsters) {
        const encountered = this.checkEncounter_primitive(encounterRate);
        
        if (encountered) {
            const monster = this.getRandomMonster(monsters);
            return {
                encountered: true,
                monster: monster
            };
        }
        
        return {
            encountered: false,
            monster: null
        };
    }

    /**
     * プレイヤーのエンカウント判定を実行する（Player依存版）
     * @param {Player} player - プレイヤーオブジェクト
     * @returns {Object} エンカウント結果
     */
    checkEncounter(player) {
        // デフォルトのエンカウント率とモンスターリスト
        const defaultRate = this.encounterRate || 0.1;
        const defaultMonsters = ['slime', 'goblin', 'skeleton'];
        
        // 直接processEncounterメソッドを呼び出すのではなく、独自実装
        const encountered = this.checkEncounter_impl(defaultRate);
        
        if (encountered) {
            const monster = this.getRandomMonster(defaultMonsters);
            return {
                encountered: true,
                monster: monster
            };
        }
        
        return {
            encountered: false,
            monster: null
        };
    }

    /**
     * エンカウント判定を行う（実装）
     * @param {number} encounterRate - エンカウント率 (0.0 - 1.0)
     * @returns {boolean} エンカウントが発生したかどうか
     */
    checkEncounter_impl(encounterRate) {
        if (encounterRate <= 0) return false;
        if (encounterRate >= 1) return true;
        
        return Math.random() < encounterRate;
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EncounterSystem;
}