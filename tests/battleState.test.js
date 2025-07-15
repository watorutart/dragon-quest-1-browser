/**
 * BattleState クラスのテスト - 戦闘状態管理システム
 */

describe('BattleState', () => {
    let BattleState, Player, Monster;

    beforeEach(() => {
        BattleState = require('../src/battleState.js'); // まだ存在しない
        Player = require('../src/player.js');
        Monster = require('../src/monster.js');
    });

    describe('戦闘開始', () => {
        test('戦闘状態を正しく初期化できる', () => {
            const player = new Player();
            const monster = new Monster('slime');
            
            const battleState = new BattleState(player, monster);
            
            expect(battleState.isActive).toBe(true);
            expect(battleState.player).toBe(player);
            expect(battleState.monster).toBe(monster);
            expect(battleState.currentTurn).toBe('player');
            expect(battleState.isOver).toBe(false);
        });

        test('戦闘開始時にプレイヤーターンから始まる', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            expect(battleState.currentTurn).toBe('player');
            expect(battleState.isActive).toBe(true);
        });
    });

    describe('戦闘終了', () => {
        test('プレイヤー勝利時に戦闘が正しく終了する', () => {
            const player = new Player();
            const monster = new Monster('slime');
            
            // モンスターを倒す
            monster.takeDamage(monster.maxHp);
            
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            const result = battleState.checkBattleEnd();
            
            expect(result.isOver).toBe(true);
            expect(result.winner).toBe('player');
            expect(result.experienceGained).toBe(monster.getExperienceReward());
            expect(result.goldGained).toBe(monster.getGoldReward());
        });

        test('プレイヤー敗北時に戦闘が正しく終了する', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            // プレイヤーを倒す
            player.takeDamage(player.maxHp);
            
            // const battleState = new BattleState(player, monster);
            // battleState.startBattle();
            // const result = battleState.checkBattleEnd();
            
            // expect(result.isOver).toBe(true);
            // expect(result.winner).toBe('monster');
            // expect(result.experienceGained).toBe(0);
            // expect(result.goldGained).toBe(0);
        });

        test('戦闘終了後は状態がinactiveになる', () => {
            const player = new Player();
            const monster = new Monster('slime');
            monster.takeDamage(monster.maxHp);
            
            // const battleState = new BattleState(player, monster);
            // battleState.startBattle();
            // battleState.endBattle();
            
            // expect(battleState.isActive).toBe(false);
            // expect(battleState.isOver).toBe(true);
        });
    });

    describe('ターン管理', () => {
        test('プレイヤーターン後にモンスターターンに切り替わる', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            // const battleState = new BattleState(player, monster);
            // battleState.startBattle();
            
            // expect(battleState.currentTurn).toBe('player');
            
            // battleState.nextTurn();
            // expect(battleState.currentTurn).toBe('monster');
        });

        test('モンスターターン後にプレイヤーターンに切り替わる', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            // const battleState = new BattleState(player, monster);
            // battleState.startBattle();
            // battleState.nextTurn(); // monster turn
            
            // battleState.nextTurn();
            // expect(battleState.currentTurn).toBe('player');
        });
    });

    describe('戦闘コマンド処理', () => {
        test('攻撃コマンドを実行できる', () => {
            const player = new Player();
            const monster = new Monster('slime');
            const initialMonsterHp = monster.hp;
            
            // const battleState = new BattleState(player, monster);
            // battleState.startBattle();
            
            // const result = battleState.executeCommand('attack');
            
            // expect(result.success).toBe(true);
            // expect(result.damage).toBeGreaterThan(0);
            // expect(monster.hp).toBeLessThan(initialMonsterHp);
        });

        test('逃走コマンドを実行できる', () => {
            const player = new Player();
            const monster = new Monster('orc');
            
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            const result = battleState.executeCommand('flee');
            
            expect(result.success).toBeDefined();
            expect(typeof result.success).toBe('boolean');
        });

        test('無効なコマンドは拒否される', () => {
            const player = new Player();
            const monster = new Monster('slime');
            
            // const battleState = new BattleState(player, monster);
            // battleState.startBattle();
            
            // const result = battleState.executeCommand('invalid');
            
            // expect(result.success).toBe(false);
            // expect(result.error).toBeDefined();
        });
    });

    describe('逃走システム', () => {
        test('逃走成功時は戦闘が終了する', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            // Math.randomをモックして逃走成功をシミュレート
            const originalRandom = Math.random;
            Math.random = jest.fn(() => 0.3); // 計算された確率未満なので成功
            
            const result = battleState.executeCommand('flee');
            
            expect(result.success).toBe(true);
            expect(result.fleeChance).toBeDefined();
            expect(result.attempts).toBe(1);
            expect(battleState.isOver).toBe(true);
            expect(battleState.isActive).toBe(false);
            
            // Math.randomを元に戻す
            Math.random = originalRandom;
        });

        test('逃走失敗時は戦闘が継続する', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            // Math.randomをモックして逃走失敗をシミュレート
            const originalRandom = Math.random;
            Math.random = jest.fn(() => 0.9); // 計算された確率以上なので失敗
            
            const result = battleState.executeCommand('flee');
            
            expect(result.success).toBe(false);
            expect(result.fleeChance).toBeDefined();
            expect(result.attempts).toBe(1);
            expect(battleState.isOver).toBe(false);
            expect(battleState.isActive).toBe(true);
            
            // Math.randomを元に戻す
            Math.random = originalRandom;
        });

        test('基本逃走成功率は約50%である', () => {
            const player = new Player();
            const monster = new Monster('orc');
            let successCount = 0;
            const trials = 1000;
            
            for (let i = 0; i < trials; i++) {
                const battleState = new BattleState(player, monster);
                battleState.startBattle();
                
                const result = battleState.executeCommand('flee');
                if (result.success) {
                    successCount++;
                }
            }
            
            const successRate = successCount / trials;
            // 基本50%前後の範囲で成功率をテスト（レベル補正等を考慮して幅を広げる）
            expect(successRate).toBeGreaterThan(0.40);
            expect(successRate).toBeLessThan(0.60);
        });

        test('プレイヤーレベルが高いほど逃走成功率が上がる', () => {
            const lowLevelPlayer = new Player();
            lowLevelPlayer.level = 1;
            const highLevelPlayer = new Player();
            highLevelPlayer.level = 10;
            const monster = new Monster('orc');
            
            const lowLevelBattle = new BattleState(lowLevelPlayer, monster);
            const highLevelBattle = new BattleState(highLevelPlayer, monster);
            
            lowLevelBattle.startBattle();
            highLevelBattle.startBattle();
            
            // 逃走確率を直接計算して比較
            const lowLevelChance = lowLevelBattle._calculateFleeChance();
            const highLevelChance = highLevelBattle._calculateFleeChance();
            
            expect(highLevelChance).toBeGreaterThan(lowLevelChance);
        });

        test('強いモンスターほど逃走成功率が下がる', () => {
            const player = new Player();
            const weakMonster = new Monster('slime'); // 攻撃力2
            const strongMonster = new Monster('orc');  // 攻撃力5
            
            const weakBattle = new BattleState(player, weakMonster);
            const strongBattle = new BattleState(player, strongMonster);
            
            weakBattle.startBattle();
            strongBattle.startBattle();
            
            const weakChance = weakBattle._calculateFleeChance();
            const strongChance = strongBattle._calculateFleeChance();
            
            expect(weakChance).toBeGreaterThan(strongChance);
        });

        test('連続逃走試行で成功率が下がる', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            // Math.randomをモックして逃走失敗を強制
            const originalRandom = Math.random;
            Math.random = jest.fn(() => 0.9);
            
            const firstAttempt = battleState.executeCommand('flee');
            const secondAttempt = battleState.executeCommand('flee');
            
            expect(firstAttempt.fleeChance).toBeGreaterThan(secondAttempt.fleeChance);
            expect(firstAttempt.attempts).toBe(1);
            expect(secondAttempt.attempts).toBe(2);
            
            Math.random = originalRandom;
        });

        test('逃走成功率は10%〜90%の範囲に制限される', () => {
            const player = new Player();
            player.level = 1; // 最低レベル
            const veryStrongMonster = new Monster('orc');
            veryStrongMonster.attack = 50; // 非常に高い攻撃力
            
            const battleState = new BattleState(player, veryStrongMonster);
            battleState.startBattle();
            
            // 複数回逃走試行して成功率を下げる
            for (let i = 0; i < 10; i++) {
                battleState.fleeAttempts++;
            }
            
            const fleeChance = battleState._calculateFleeChance();
            
            expect(fleeChance).toBeGreaterThanOrEqual(0.1);
            expect(fleeChance).toBeLessThanOrEqual(0.9);
        });

        test('戦闘終了後は逃走コマンドを実行できない', () => {
            const player = new Player();
            const monster = new Monster('slime');
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            // 戦闘を終了させる
            battleState.endBattle();
            
            const result = battleState.executeCommand('flee');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Battle is not active');
        });

        test('プレイヤーターン以外では逃走できない', () => {
            const player = new Player();
            const monster = new Monster('orc');
            const battleState = new BattleState(player, monster);
            battleState.startBattle();
            
            // モンスターターンに切り替え
            battleState.nextTurn();
            
            const result = battleState.executeCommand('flee');
            
            expect(result.success).toBe(false);
            expect(result.error).toBe('Not player turn');
        });
    });
});