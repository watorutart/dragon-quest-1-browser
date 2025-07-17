/**
 * Monster クラス - モンスターの基本ステータスと行動を管理
 */

// モンスターデータベース（静的データ）
const MONSTER_DATABASE = {
    'slime': {
        name: 'スライム',
        hp: 3,
        attack: 2,
        defense: 1,
        experience: 1,
        gold: 2
    },
    'draky': {
        name: 'ドラキー',
        hp: 5,
        attack: 3,
        defense: 2,
        experience: 2,
        gold: 4
    },
    'orc': {
        name: 'オーク',
        hp: 20,
        attack: 14,
        defense: 8,
        experience: 6,
        gold: 12
    },
    'goblin': {
        name: 'ゴブリン',
        hp: 8,
        attack: 5,
        defense: 3,
        experience: 3,
        gold: 6
    },
    'skeleton': {
        name: 'がいこつ',
        hp: 18,
        attack: 11,
        defense: 6,
        experience: 11,
        gold: 20
    },
    'dragonKing': {
        name: '竜王',
        hp: 58,
        attack: 24,
        defense: 14,
        experience: 1000,
        gold: 2000
    }
};

class Monster {
    constructor(type) {
        const monsterData = Monster.getMonsterData(type);
        
        if (!monsterData) {
            throw new Error(`Unknown monster type: ${type}`);
        }

        this.type = type;
        this.name = monsterData.name;
        this.hp = monsterData.hp;
        this.maxHp = monsterData.hp;
        this.attack = monsterData.attack;
        this.defense = monsterData.defense;
        this.experience = monsterData.experience;
        this.gold = monsterData.gold;
    }

    /**
     * モンスターデータを取得（静的メソッド）
     * @param {string} type - モンスタータイプ
     * @returns {Object|null} モンスターデータ
     */
    static getMonsterData(type) {
        return MONSTER_DATABASE[type] || null;
    }

    /**
     * 利用可能なモンスタータイプ一覧を取得
     * @returns {string[]} モンスタータイプの配列
     */
    static getAvailableTypes() {
        return Object.keys(MONSTER_DATABASE);
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
     * 生存状態かどうかを判定
     * @returns {boolean} 生きている場合true
     */
    isAlive() {
        return this.hp > 0;
    }

    /**
     * 攻撃力を取得
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
     * 経験値報酬を取得
     * @returns {number} 経験値
     */
    getExperienceReward() {
        return this.experience;
    }

    /**
     * ゴールド報酬を取得
     * @returns {number} ゴールド
     */
    getGoldReward() {
        return this.gold;
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Monster;
}