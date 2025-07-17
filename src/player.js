/**
 * Player クラス - ドラゴンクエスト1のプレイヤーキャラクター
 */
class Player {
    constructor(name = '勇者', level = 1) {
        // 基本情報
        this.name = name;
        
        // 基本ステータス（設計書の初期値に基づく）
        this.level = level;
        this.hp = 15;
        this.maxHp = 15;
        this.mp = 0;
        this.maxMp = 0;
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
     * プレイヤーが生きているかチェック
     * @returns {boolean} 生きている場合true
     */
    isAlive() {
        return this.hp > 0;
    }
    
    /**
     * ダメージを受ける
     * @param {number} damage - 受けるダメージ量
     */
    takeDamage(damage) {
        // 入力値の検証
        if (typeof damage !== 'number' || isNaN(damage) || damage < 0) {
            return;
        }
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
        // 入力値の検証
        if (typeof x !== 'number' || isNaN(x) || x < 0) {
            return;
        }
        this.x = this._validateCoordinate(x);
    }
    
    /**
     * Y座標を設定する（境界チェック付き）
     * @param {number} y - 設定するY座標
     */
    setY(y) {
        // 入力値の検証
        if (typeof y !== 'number' || isNaN(y) || y < 0) {
            return;
        }
        this.y = this._validateCoordinate(y);
    }
    
    /**
     * 位置を一度に設定する
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    setPosition(x, y) {
        // 入力値の検証
        if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y) || x < 0 || y < 0) {
            return;
        }
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
        // 入力値の検証
        if (typeof exp !== 'number' || isNaN(exp) || exp < 0) {
            return { leveledUp: false, newLevel: this.level };
        }
        
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
            4,    // レベル2
            12,   // レベル3
            30,   // レベル4
            60,   // レベル5
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
     * 現在のレベルアップに必要な経験値を取得
     * @returns {number} レベルアップに必要な経験値
     */
    getRequiredExperience() {
        if (this.level >= 30) return this.experience; // 最大レベルの場合
        return this.getExpForLevel(this.level + 1);
    }
    
    /**
     * ゴールドを獲得する
     * @param {number} amount - 獲得するゴールド量
     */
    gainGold(amount) {
        // 入力値の検証
        if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
            return;
        }
        this.gold += amount;
        // ゴールドの最大値制限（ドラゴンクエスト1では65535）
        this.gold = Math.min(this.gold, 65535);
    }
    
    /**
     * レベルアップを実行する
     */
    levelUp() {
        if (this.level >= 30) {
            console.warn('既に最大レベルです');
            return;
        }
        
        this.level++;
        this._applyLevelUpStats();
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
        const defenseGrowth = Math.floor((level - 1) * 1.8);
        
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
    
    // === 装備システム ===
    
    /**
     * 武器を装備する
     * Requirements: 5.2, 5.4 - 装備変更とステータス反映
     * 
     * @param {Item} item - 装備する武器アイテム
     * @returns {Object} 装備結果 {success, previousWeapon, error}
     */
    equipWeapon(item) {
        const validation = this._validateEquipmentItem(item, 'weapon');
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        
        const previousWeapon = this.weapon;
        
        // 既存の武器の効果を除去
        this._removeEquipmentStats(previousWeapon, 'attack');
        
        // 新しい武器を装備
        this.weapon = item;
        this._applyEquipmentStats(item, 'attack');
        
        return {
            success: true,
            previousWeapon: previousWeapon
        };
    }
    
    /**
     * 防具を装備する
     * Requirements: 5.2, 5.4 - 装備変更とステータス反映
     * 
     * @param {Item} item - 装備する防具アイテム
     * @returns {Object} 装備結果 {success, previousArmor, error}
     */
    equipArmor(item) {
        const validation = this._validateEquipmentItem(item, 'armor');
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }
        
        const previousArmor = this.armor;
        
        // 既存の防具の効果を除去
        this._removeEquipmentStats(previousArmor, 'defense');
        
        // 新しい防具を装備
        this.armor = item;
        this._applyEquipmentStats(item, 'defense');
        
        return {
            success: true,
            previousArmor: previousArmor
        };
    }
    
    /**
     * 武器を外す
     * Requirements: 5.2, 5.4 - 装備変更とステータス反映
     * 
     * @returns {Object} 装備解除結果 {success, unequippedWeapon, error}
     */
    unequipWeapon() {
        if (!this.weapon) {
            return { success: false, error: 'No weapon equipped' };
        }
        
        const unequippedWeapon = this.weapon;
        this.attack -= unequippedWeapon.getStatBonus('attack');
        this.weapon = null;
        
        return {
            success: true,
            unequippedWeapon: unequippedWeapon
        };
    }
    
    /**
     * 防具を外す
     * Requirements: 5.2, 5.4 - 装備変更とステータス反映
     * 
     * @returns {Object} 装備解除結果 {success, unequippedArmor, error}
     */
    unequipArmor() {
        if (!this.armor) {
            return { success: false, error: 'No armor equipped' };
        }
        
        const unequippedArmor = this.armor;
        this.defense -= unequippedArmor.getStatBonus('defense');
        this.armor = null;
        
        return {
            success: true,
            unequippedArmor: unequippedArmor
        };
    }
    
    /**
     * 装備込みの総攻撃力を取得
     * Requirements: 5.2, 5.4 - ステータス反映システム
     * 
     * @returns {number} 総攻撃力
     */
    getTotalAttack() {
        return this.attack;
    }
    
    /**
     * 装備込みの総防御力を取得
     * Requirements: 5.2, 5.4 - ステータス反映システム
     * 
     * @returns {number} 総防御力
     */
    getTotalDefense() {
        return this.defense;
    }
    
    /**
     * 装備情報を取得
     * Requirements: 5.2, 5.4 - 装備管理ロジック
     * 
     * @returns {Object} 装備情報 {weapon, armor, totalAttackBonus, totalDefenseBonus}
     */
    getEquipmentInfo() {
        const weaponBonus = this.weapon ? this.weapon.getStatBonus('attack') : 0;
        const armorBonus = this.armor ? this.armor.getStatBonus('defense') : 0;
        
        return {
            weapon: this.weapon,
            armor: this.armor,
            totalAttackBonus: weaponBonus,
            totalDefenseBonus: armorBonus
        };
    }
    
    /**
     * 装備アイテムの検証
     * @private
     * @param {Item} item - 検証するアイテム
     * @param {string} expectedType - 期待するアイテムタイプ
     * @returns {Object} 検証結果 {valid: boolean, error?: string}
     */
    _validateEquipmentItem(item, expectedType) {
        if (!item) {
            return { valid: false, error: 'Invalid item' };
        }
        
        if (expectedType === 'weapon' && !item.isWeapon()) {
            return { valid: false, error: 'Item is not a weapon' };
        }
        
        if (expectedType === 'armor' && !item.isArmor()) {
            return { valid: false, error: 'Item is not armor' };
        }
        
        return { valid: true };
    }
    
    /**
     * 装備のステータス効果を適用
     * @private
     * @param {Item} item - 装備アイテム
     * @param {string} statType - ステータスタイプ ('attack' or 'defense')
     */
    _applyEquipmentStats(item, statType) {
        if (item && typeof item.getStatBonus === 'function') {
            this[statType] += item.getStatBonus(statType);
        }
    }
    
    /**
     * 装備のステータス効果を除去
     * @private
     * @param {Item} item - 装備アイテム
     * @param {string} statType - ステータスタイプ ('attack' or 'defense')
     */
    _removeEquipmentStats(item, statType) {
        if (item && typeof item.getStatBonus === 'function') {
            this[statType] -= item.getStatBonus(statType);
        }
    }
    
    // === 移動システム ===
    
    /**
     * 指定方向に移動する
     * Requirements: 1.1, 1.2, 1.3, 1.4 - プレイヤーの移動処理
     * 
     * @param {string} direction - 移動方向 ('up', 'down', 'left', 'right')
     * @param {Object} map - マップオブジェクト（コリジョン検出用）
     * @returns {Object} 移動結果 {success, direction, oldPosition, newPosition}
     */
    move(direction, map) {
        const oldPosition = this.getPosition();
        
        // 方向の有効性をチェック
        if (!this._isValidDirection(direction)) {
            return this._createMoveResult(false, direction, oldPosition, oldPosition);
        }
        
        const newPosition = this._calculateNewPosition(direction);
        
        // 移動可能性をチェック
        if (!this._isValidMove(newPosition, map)) {
            return this._createMoveResult(false, direction, oldPosition, oldPosition);
        }
        
        // 移動を実行
        this.setPosition(newPosition.x, newPosition.y);
        
        return this._createMoveResult(true, direction, oldPosition, this.getPosition());
    }
    
    /**
     * 指定方向に移動可能かチェック
     * @param {string} direction - 移動方向
     * @param {Object} map - マップオブジェクト
     * @returns {boolean} 移動可能な場合true
     */
    canMoveInDirection(direction, map) {
        const newPosition = this._calculateNewPosition(direction);
        return this._isValidMove(newPosition, map);
    }
    
    /**
     * 移動結果オブジェクトを作成
     * @private
     * @param {boolean} success - 移動成功フラグ
     * @param {string} direction - 移動方向
     * @param {Object} oldPosition - 移動前の位置
     * @param {Object} newPosition - 移動後の位置
     * @returns {Object} 移動結果オブジェクト
     */
    _createMoveResult(success, direction, oldPosition, newPosition) {
        return {
            success: success,
            direction: direction,
            oldPosition: oldPosition,
            newPosition: newPosition
        };
    }
    
    /**
     * 指定方向の新しい座標を計算
     * @private
     * @param {string} direction - 移動方向
     * @returns {Object} 新しい座標 {x, y}
     */
    _calculateNewPosition(direction) {
        const currentPos = this.getPosition();
        const directionMap = this._getDirectionMap();
        
        const delta = directionMap[direction];
        if (!delta) {
            return currentPos; // 無効な方向の場合は現在位置を返す
        }
        
        return {
            x: currentPos.x + delta.x,
            y: currentPos.y + delta.y
        };
    }
    
    /**
     * 方向と座標変化のマッピングを取得
     * @private
     * @returns {Object} 方向マッピング
     */
    _getDirectionMap() {
        return {
            'up': { x: 0, y: -1 },
            'down': { x: 0, y: 1 },
            'left': { x: -1, y: 0 },
            'right': { x: 1, y: 0 }
        };
    }
    
    /**
     * 移動方向が有効かチェック
     * @private
     * @param {string} direction - 移動方向
     * @returns {boolean} 有効な方向の場合true
     */
    _isValidDirection(direction) {
        if (typeof direction !== 'string') {
            return false;
        }
        return ['up', 'down', 'left', 'right'].includes(direction);
    }
    
    /**
     * 移動が有効かチェック
     * @private
     * @param {Object} position - チェックする座標 {x, y}
     * @param {Object} map - マップオブジェクト
     * @returns {boolean} 移動可能な場合true
     */
    _isValidMove(position, map) {
        // 座標の有効性チェック（境界チェック）
        if (!this.isValidPosition(position.x, position.y)) {
            return false;
        }
        
        // マップのコリジョンチェック（地形・障害物チェック）
        if (map && typeof map.isWalkable === 'function') {
            return map.isWalkable(position.x, position.y);
        }
        
        // マップが提供されていない場合は座標の有効性のみチェック
        return true;
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