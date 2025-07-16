/**
 * DragonKing クラス - 最終ボス「竜王」の実装
 * 特殊能力と強化されたステータスを持つボスモンスター
 * 
 * バランス調整:
 * - HP: 100 (プレイヤーレベル15-20想定)
 * - 攻撃力: 90 (高レベルプレイヤーでも脅威)
 * - 防御力: 50 (適度な防御力で長期戦)
 * - 特殊攻撃: 通常攻撃の1.5倍、HP減少で確率上昇
 */

class DragonKing {
    constructor() {
        // 基本ステータス（バランス調整済み）
        this.name = '竜王';
        this.hp = 100;
        this.maxHp = 100;
        this.attack = 90;
        this.defense = 50;
        this.experience = 0; // 最終ボスなので経験値報酬なし
        this.gold = 0; // 最終ボスなのでゴールド報酬なし
        this.isBoss = true;
        
        // 特殊攻撃の設定（バランス調整）
        this.specialAttackName = '激しい炎';
        this.baseSpecialAttackChance = 0.3; // 基本30%の確率
        this.specialAttackMultiplier = 1.5; // 通常攻撃の1.5倍
    }

    /**
     * ダメージを受ける
     * @param {number} damage - 受けるダメージ量
     */
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp < 0) {
            this.hp = 0;
        }
    }

    /**
     * 死亡状態かどうかを判定
     * @returns {boolean} 死亡している場合true
     */
    isDead() {
        return this.hp <= 0;
    }

    /**
     * 基本攻撃力を取得
     * @returns {number} 攻撃力
     */
    getAttackPower() {
        return this.attack;
    }

    /**
     * 防御力を取得
     * @returns {number} 防御力
     */
    getDefensePower() {
        return this.defense;
    }

    /**
     * 経験値報酬を取得（最終ボスなので0）
     * @returns {number} 経験値
     */
    getExperienceReward() {
        return this.experience;
    }

    /**
     * ゴールド報酬を取得（最終ボスなので0）
     * @returns {number} ゴールド
     */
    getGoldReward() {
        return this.gold;
    }

    /**
     * 特殊攻撃を持っているかどうか
     * @returns {boolean} 特殊攻撃を持つ場合true
     */
    hasSpecialAttack() {
        return true;
    }

    /**
     * 特殊攻撃の名前を取得
     * @returns {string} 特殊攻撃名
     */
    getSpecialAttackName() {
        return this.specialAttackName;
    }

    /**
     * 特殊攻撃の威力を取得
     * @returns {number} 特殊攻撃の威力（通常攻撃の1.5倍）
     */
    getSpecialAttackPower() {
        return Math.floor(this.attack * this.specialAttackMultiplier);
    }

    /**
     * 特殊攻撃の使用確率を取得（HPによって変動）
     * @returns {number} 使用確率（0.0-1.0）
     */
    getSpecialAttackChance() {
        const hpPercentage = this.hp / this.maxHp;
        
        if (hpPercentage <= 0.25) {
            // HP25%以下：70%の確率
            return 0.7;
        } else if (hpPercentage <= 0.5) {
            // HP50%以下：50%の確率
            return 0.5;
        } else {
            // HP50%超：30%の確率
            return this.baseSpecialAttackChance;
        }
    }

    /**
     * 特殊攻撃を使用するかどうかを判定
     * @returns {boolean} 特殊攻撃を使用する場合true
     */
    shouldUseSpecialAttack() {
        return Math.random() < this.getSpecialAttackChance();
    }

    /**
     * 攻撃行動を取得
     * @returns {Object} 攻撃行動の詳細
     */
    getAttackAction() {
        if (this.shouldUseSpecialAttack()) {
            return {
                type: 'special',
                damage: this.getSpecialAttackPower(),
                message: '竜王は激しい炎を吐いた！'
            };
        } else {
            return {
                type: 'normal',
                damage: this.getAttackPower(),
                message: '竜王の攻撃！'
            };
        }
    }

    /**
     * 逃走可能かどうか（ボス戦では逃走不可）
     * @returns {boolean} 逃走可能な場合true
     */
    canEscape() {
        return false;
    }

    /**
     * 戦闘開始メッセージを取得
     * @returns {string} 戦闘開始メッセージ
     */
    getBattleStartMessage() {
        return '竜王が立ちはだかった！';
    }

    /**
     * 撃破時のメッセージを取得
     * @returns {string} 撃破メッセージ
     */
    getDefeatMessage() {
        return '竜王を倒した！\n姫を救出した！';
    }

    /**
     * 戦闘システムとの互換性のため、攻撃行動を実行
     * @param {Player} player - 攻撃対象のプレイヤー
     * @returns {Object} 攻撃結果
     */
    performAttack(player) {
        const action = this.getAttackAction();
        const actualDamage = Math.max(1, action.damage - player.getDefensePower());
        
        player.takeDamage(actualDamage);
        
        return {
            type: action.type,
            damage: actualDamage,
            message: action.message,
            targetHp: player.hp
        };
    }

    /**
     * 現在のHP割合を取得（デバッグ・バランス調整用）
     * @returns {number} HP割合（0.0-1.0）
     */
    getHpPercentage() {
        return this.hp / this.maxHp;
    }

    /**
     * 竜王の現在の状態を取得（デバッグ用）
     * @returns {Object} 現在の状態
     */
    getStatus() {
        return {
            name: this.name,
            hp: this.hp,
            maxHp: this.maxHp,
            hpPercentage: this.getHpPercentage(),
            attack: this.attack,
            defense: this.defense,
            specialAttackChance: this.getSpecialAttackChance(),
            isBoss: this.isBoss
        };
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DragonKing;
}