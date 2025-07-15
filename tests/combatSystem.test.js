/**
 * CombatSystem クラスのテスト - ダメージ計算システム
 */

describe('CombatSystem', () => {
    let CombatSystem, Player, Monster;

    beforeEach(() => {
        CombatSystem = require('../src/combatSystem.js');
        Player = require('../src/player.js');
        Monster = require('../src/monster.js');
    });

    describe('プレイヤーからモンスターへの攻撃', () => {
        test('基本ダメージ計算が正しく行われる', () => {
            const player = new Player();
            const slime = new Monster('slime');
            
            // プレイヤー攻撃力4、スライム防御力1 → 期待ダメージ3
            const damage = CombatSystem.calculateDamage(player.attack, slime.defense);
            
            expect(damage).toBe(3);
        });

        test('防御力が攻撃力を上回る場合は最小ダメージ1', () => {
            const player = new Player();
            player.attack = 2;
            const strongMonster = new Monster('skeleton'); // 防御力6
            
            const damage = CombatSystem.calculateDamage(player.attack, strongMonster.defense);
            
            expect(damage).toBe(1); // 最小ダメージ
        });

        test('攻撃実行でモンスターのHPが減少する', () => {
            const player = new Player();
            const slime = new Monster('slime');
            const initialHp = slime.hp;
            
            const result = CombatSystem.playerAttack(player, slime);
            
            expect(slime.hp).toBeLessThan(initialHp);
            expect(result.damage).toBeGreaterThan(0);
            expect(result.attacker).toBe('player');
            expect(result.target).toBe('monster');
        });
    });

    describe('モンスターからプレイヤーへの攻撃', () => {
        test('基本ダメージ計算が正しく行われる', () => {
            const player = new Player();
            const slime = new Monster('slime');
            
            // スライム攻撃力2、プレイヤー防御力2 → 期待ダメージ1（最小）
            const damage = CombatSystem.calculateDamage(slime.attack, player.defense);
            
            expect(damage).toBe(1);
        });

        test('攻撃実行でプレイヤーのHPが減少する', () => {
            const player = new Player();
            const orc = new Monster('orc');
            const initialHp = player.hp;
            
            const result = CombatSystem.monsterAttack(orc, player);
            
            expect(player.hp).toBeLessThan(initialHp);
            expect(result.damage).toBeGreaterThan(0);
            expect(result.attacker).toBe('monster');
            expect(result.target).toBe('player');
        });
    });

    describe('戦闘結果判定', () => {
        test('モンスターが死亡した場合の戦闘結果', () => {
            const player = new Player();
            const slime = new Monster('slime');
            
            // スライムを倒すまで攻撃
            slime.takeDamage(slime.maxHp);
            
            const result = CombatSystem.checkBattleResult(player, slime);
            
            expect(result.isOver).toBe(true);
            expect(result.winner).toBe('player');
            expect(result.experienceGained).toBe(slime.getExperienceReward());
            expect(result.goldGained).toBe(slime.getGoldReward());
        });

        test('プレイヤーが死亡した場合の戦闘結果', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            // プレイヤーを倒す
            player.takeDamage(player.maxHp);
            
            const result = CombatSystem.checkBattleResult(player, monster);
            
            expect(result.isOver).toBe(true);
            expect(result.winner).toBe('monster');
            expect(result.experienceGained).toBe(0);
            expect(result.goldGained).toBe(0);
        });

        test('両者生存中は戦闘継続', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            const result = CombatSystem.checkBattleResult(player, monster);
            
            expect(result.isOver).toBe(false);
            expect(result.winner).toBe(null);
        });
    });

    describe('完全な戦闘シミュレーション', () => {
        test('戦闘を最後まで実行できる', () => {
            const player = new Player();
            const slime = new Monster('slime');
            
            const battleResult = CombatSystem.simulateBattle(player, slime);
            
            expect(battleResult.isOver).toBe(true);
            expect(['player', 'monster']).toContain(battleResult.winner);
            expect(battleResult.turns).toBeGreaterThan(0);
            expect(Array.isArray(battleResult.log)).toBe(true);
        });
    });

    describe('ダメージ計算の境界値テスト', () => {
        test('攻撃力0の場合は最小ダメージ1', () => {
            const damage = CombatSystem.calculateDamage(0, 5);
            expect(damage).toBe(1);
        });

        test('防御力0の場合は攻撃力がそのままダメージ', () => {
            const damage = CombatSystem.calculateDamage(10, 0);
            expect(damage).toBe(10);
        });

        test('負の値が入力された場合の処理', () => {
            const damage1 = CombatSystem.calculateDamage(-5, 2);
            const damage2 = CombatSystem.calculateDamage(5, -2);
            
            expect(damage1).toBe(1); // 最小ダメージ
            expect(damage2).toBe(7); // 攻撃力 + |防御力|
        });
    });

    describe('逃走システムとの統合', () => {
        test('戦闘中に逃走が成功した場合、戦闘結果に反映される', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const BattleState = require('../src/battleState.js');
            
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            // Math.randomをモックして逃走成功をシミュレート
            const originalRandom = Math.random;
            Math.random = jest.fn(() => 0.1); // 確実に成功
            
            const fleeResult = battleState.executeCommand('flee');
            
            expect(fleeResult.success).toBe(true);
            expect(battleState.isOver).toBe(true);
            
            // 戦闘結果をチェック（逃走成功時は経験値・ゴールドなし）
            const battleResult = CombatSystem.checkBattleResult(player, monster);
            expect(battleResult.isOver).toBe(false); // プレイヤーもモンスターも生きているため
            
            Math.random = originalRandom;
        });
    });
});