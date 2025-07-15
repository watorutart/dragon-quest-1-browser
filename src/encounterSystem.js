/**
 * エンカウントシステム
 * プレイヤーの移動時にモンスターとのエンカウント判定を行う
 */

class EncounterSystem {
    /**
     * エンカウント判定を行う
     * @param {number} encounterRate - エンカウント率 (0.0 - 1.0)
     * @returns {boolean} エンカウントが発生したかどうか
     */
    checkEncounter(encounterRate) {
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
        const encountered = this.checkEncounter(encounterRate);
        
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
}

module.exports = EncounterSystem;