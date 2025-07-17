/**
 * CombatSystem クラス - 戦闘システムとダメージ計算を管理
 */

class CombatSystem {
    /**
     * ダメージを計算する
     * ドラゴンクエスト1の基本ダメージ計算式: 攻撃力 - 防御力（最小1）
     * @param {Player|Monster} attacker - 攻撃者オブジェクト
     * @param {Player|Monster} defender - 防御者オブジェクト
     * @returns {number} 計算されたダメージ
     */
    calculateDamage(attacker, defender) {
        const MIN_DAMAGE = 1;
        
        // 攻撃力と防御力を取得
        const attack = attacker?.attack || attacker?.getAttackPower?.() || 0;
        const defense = defender?.defense || defender?.getDefensePower?.() || 0;
        
        // 入力値の正規化
        const normalizedAttack = CombatSystem._normalizeAttack(attack);
        const normalizedDefense = CombatSystem._normalizeDefense(defense);
        
        // 基本ダメージ計算にランダム要素を追加
        const baseDamage = normalizedAttack - normalizedDefense;
        const randomFactor = 0.65 + (Math.random() * 0.5); // 0.65 to 1.15
        
        // 最小ダメージ保証
        return Math.max(MIN_DAMAGE, Math.floor(baseDamage * randomFactor));
    }

    /**
     * 攻撃力を正規化する
     * @private
     * @param {number} attack - 攻撃力
     * @returns {number} 正規化された攻撃力
     */
    static _normalizeAttack(attack) {
        return Math.max(0, attack);
    }

    /**
     * 防御力を正規化する
     * @private
     * @param {number} defense - 防御力
     * @returns {number} 正規化された防御力
     */
    static _normalizeDefense(defense) {
        // 負の防御力は攻撃力を増加させる効果として扱う
        return defense < 0 ? defense : Math.max(0, defense);
    }

    /**
     * プレイヤーがモンスターを攻撃する
     * @param {Player} player - プレイヤーオブジェクト
     * @param {Monster} monster - モンスターオブジェクト
     * @returns {Object} 攻撃結果
     */
    static playerAttack(player, monster) {
        const combatSystem = new CombatSystem();
        const damage = combatSystem.calculateDamage(player, monster);
        monster.takeDamage(damage);
        
        return {
            attacker: 'player',
            target: 'monster',
            damage: damage,
            targetHp: monster.hp
        };
    }

    /**
     * モンスターがプレイヤーを攻撃する
     * @param {Monster} monster - モンスターオブジェクト
     * @param {Player} player - プレイヤーオブジェクト
     * @returns {Object} 攻撃結果
     */
    static monsterAttack(monster, player) {
        const combatSystem = new CombatSystem();
        const damage = combatSystem.calculateDamage(monster, player);
        player.takeDamage(damage);
        
        return {
            attacker: 'monster',
            target: 'player',
            damage: damage,
            targetHp: player.hp
        };
    }

    /**
     * 戦闘結果をチェックする
     * @param {Player} player - プレイヤーオブジェクト
     * @param {Monster} monster - モンスターオブジェクト
     * @returns {Object} 戦闘結果
     */
    static checkBattleResult(player, monster) {
        if (monster.isDead()) {
            return {
                isOver: true,
                winner: 'player',
                experienceGained: monster.getExperienceReward(),
                goldGained: monster.getGoldReward()
            };
        }
        
        if (!player.isAlive()) {
            return {
                isOver: true,
                winner: 'monster',
                experienceGained: 0,
                goldGained: 0
            };
        }
        
        return {
            isOver: false,
            winner: null,
            experienceGained: 0,
            goldGained: 0
        };
    }

    /**
     * 戦闘をシミュレーションする
     * @param {Player} player - プレイヤーオブジェクト
     * @param {Monster} monster - モンスターオブジェクト
     * @returns {Object} 戦闘シミュレーション結果
     */
    simulateBattle(player, monster) {
        const log = [];
        let turns = 0;
        const maxTurns = 100; // 無限ループ防止
        
        while (turns < maxTurns) {
            turns++;
            
            // プレイヤーの攻撃
            const playerAttackResult = this.playerAttack(player, monster);
            log.push(`Turn ${turns}: Player attacks for ${playerAttackResult.damage} damage. Monster HP: ${playerAttackResult.targetHp}`);
            
            const battleResult = this.checkBattleResult(player, monster);
            if (battleResult.isOver) {
                return {
                    ...battleResult,
                    turns: turns,
                    log: log
                };
            }
            
            // モンスターの攻撃
            const monsterAttackResult = this.monsterAttack(monster, player);
            log.push(`Turn ${turns}: Monster attacks for ${monsterAttackResult.damage} damage. Player HP: ${monsterAttackResult.targetHp}`);
            
            const battleResult2 = this.checkBattleResult(player, monster);
            if (battleResult2.isOver) {
                return {
                    ...battleResult2,
                    turns: turns,
                    log: log
                };
            }
        }
        
        // 最大ターン数に達した場合（引き分け扱い）
        return {
            isOver: true,
            winner: null,
            experienceGained: 0,
            goldGained: 0,
            turns: turns,
            log: log
        };
    }
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}