/**
 * Player クラス - ドラゴンクエスト1のプレイヤーキャラクター
 */
class Player {
    constructor() {
        // 基本ステータス（設計書の初期値に基づく）
        this.level = 1;
        this.hp = 15;
        this.maxHp = 15;
        this.attack = 4;
        this.defense = 2;
        this.experience = 0;
        this.gold = 120;
        
        // 位置情報（初期位置）
        this.x = 10;
        this.y = 10;
        
        // 装備（初期は未装備）
        this.weapon = null;
        this.armor = null;
    }
    
    /**
     * HPを設定する（最大値と最小値の制限あり）
     * @param {number} value - 設定するHP値
     */
    setHp(value) {
        this.hp = Math.max(0, Math.min(value, this.maxHp));
    }
    
    /**
     * 現在のHPを取得する
     * @returns {number} 現在のHP
     */
    getHp() {
        return this.hp;
    }
    
    /**
     * ダメージを受ける
     * @param {number} damage - 受けるダメージ量
     */
    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
    }
    
    /**
     * プレイヤーが死亡しているかチェック
     * @returns {boolean} 死亡している場合true
     */
    isDead() {
        return this.hp <= 0;
    }
    
    /**
     * ゴールドを追加する
     * @param {number} amount - 追加するゴールド量
     */
    addGold(amount) {
        this.gold += amount;
    }
    
    /**
     * ゴールドを消費する
     * @param {number} amount - 消費するゴールド量
     * @returns {boolean} 消費に成功した場合true
     */
    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            return true;
        }
        return false;
    }
    
    // === 位置管理機能 ===
    
    /**
     * X座標を取得する
     * @returns {number} X座標
     */
    getX() {
        return this.x;
    }
    
    /**
     * Y座標を取得する
     * @returns {number} Y座標
     */
    getY() {
        return this.y;
    }
    
    /**
     * X座標を設定する（境界チェック付き）
     * @param {number} x - 設定するX座標
     */
    setX(x) {
        this.x = this._validateCoordinate(x);
    }
    
    /**
     * Y座標を設定する（境界チェック付き）
     * @param {number} y - 設定するY座標
     */
    setY(y) {
        this.y = this._validateCoordinate(y);
    }
    
    /**
     * 位置を一度に設定する
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    setPosition(x, y) {
        this.setX(x);
        this.setY(y);
    }
    
    /**
     * 現在位置を取得する
     * @returns {Object} {x, y}形式の位置オブジェクト
     */
    getPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }
    
    /**
     * 指定した座標が有効な範囲内かチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 有効な座標の場合true
     */
    isValidPosition(x, y) {
        const maxCoord = 119; // マップサイズ120x120の場合、インデックスは0-119
        return x >= 0 && x <= maxCoord && y >= 0 && y <= maxCoord;
    }
    
    /**
     * 指定した座標に移動可能かチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 移動可能な場合true
     */
    canMoveTo(x, y) {
        return this.isValidPosition(x, y);
    }
    
    /**
     * 座標を有効な範囲内に制限する
     * @private
     * @param {number} coordinate - 座標値
     * @returns {number} 制限された座標値
     */
    _validateCoordinate(coordinate) {
        const maxCoord = 119;
        return Math.max(0, Math.min(coordinate, maxCoord));
    }
    
    // === レベルアップ機能 ===
    
    /**
     * 経験値を獲得し、レベルアップ処理を行う
     * @param {number} exp - 獲得する経験値
     * @returns {Object} レベルアップ結果 {leveledUp: boolean, newLevel: number}
     */
    gainExperience(exp) {
        const oldLevel = this.level;
        this.experience += exp;
        
        // レベルアップチェック
        while (this.level < 30 && this.experience >= this.getExpForLevel(this.level + 1)) {
            this.level++;
            this._applyLevelUpStats();
        }
        
        const leveledUp = this.level > oldLevel;
        return {
            leveledUp: leveledUp,
            newLevel: this.level
        };
    }
    
    /**
     * 指定レベルに必要な累計経験値を取得
     * @param {number} level - レベル
     * @returns {number} 必要経験値
     */
    getExpForLevel(level) {
        // ドラゴンクエスト1の経験値テーブル
        const expTable = [
            0,    // レベル1
            7,    // レベル2
            23,   // レベル3
            47,   // レベル4
            110,  // レベル5
            220,  // レベル6
            450,  // レベル7
            800,  // レベル8
            1300, // レベル9
            2000, // レベル10
            2900, // レベル11
            4000, // レベル12
            5500, // レベル13
            7500, // レベル14
            10000, // レベル15
            13000, // レベル16
            16500, // レベル17
            20000, // レベル18
            24000, // レベル19
            28500, // レベル20
            33500, // レベル21
            39000, // レベル22
            45000, // レベル23
            51500, // レベル24
            58500, // レベル25
            66000, // レベル26
            74000, // レベル27
            82500, // レベル28
            91500, // レベル29
            101000 // レベル30
        ];
        
        return level <= 30 ? expTable[level - 1] : expTable[29];
    }
    
    /**
     * 次のレベルまでに必要な経験値を取得
     * @returns {number} 次のレベルまでの必要経験値
     */
    getExpToNextLevel() {
        if (this.level >= 30) return 0;
        return this.getExpForLevel(this.level + 1) - this.experience;
    }
    
    /**
     * 指定レベルのステータスを計算
     * @param {number} level - レベル
     * @returns {Object} ステータス {maxHp, attack, defense}
     */
    getStatsForLevel(level) {
        // ドラゴンクエスト1のステータス成長式（テスト用に決定的な値）
        const baseHp = 15;
        const baseAttack = 4;
        const baseDefense = 2;
        
        const hpGrowth = Math.floor((level - 1) * 5);
        const attackGrowth = Math.floor((level - 1) * 2);
        const defenseGrowth = Math.floor((level - 1) * 1.5);
        
        return {
            maxHp: baseHp + hpGrowth,
            attack: baseAttack + attackGrowth,
            defense: baseDefense + defenseGrowth
        };
    }
    
    /**
     * レベルアップ時のステータス適用
     * @private
     */
    _applyLevelUpStats() {
        const stats = this.getStatsForLevel(this.level);
        this.maxHp = stats.maxHp;
        this.attack = stats.attack;
        this.defense = stats.defense;
        
        // レベルアップ時にHPを全回復
        this.hp = this.maxHp;
    }
}

// Node.js環境でのエクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}

// ブラウザ環境でのグローバル定義
if (typeof window !== 'undefined') {
    window.Player = Player;
}