/**
 * DragonKing クラスのテスト
 * 最終ボス「竜王」の特殊能力をテスト
 */

describe('DragonKing', () => {
    let DragonKing;

    beforeEach(() => {
        // DragonKing クラスをインポート
        DragonKing = require('../src/dragonKing.js');
    });

    describe('基本ステータス管理', () => {
        test('竜王の初期ステータスが正しく設定される', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.name).toBe('竜王');
            expect(dragonKing.hp).toBe(100);
            expect(dragonKing.maxHp).toBe(100);
            expect(dragonKing.attack).toBe(90);
            expect(dragonKing.defense).toBe(50);
            expect(dragonKing.experience).toBe(0); // 最終ボスなので経験値なし
            expect(dragonKing.gold).toBe(0); // 最終ボスなのでゴールドなし
            expect(dragonKing.isBoss).toBe(true);
        });

        test('竜王は通常のモンスターより強力である', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.hp).toBeGreaterThan(50);
            expect(dragonKing.attack).toBeGreaterThan(50);
            expect(dragonKing.defense).toBeGreaterThan(30);
        });
    });

    describe('特殊能力システム', () => {
        test('竜王は激しい炎を吐く特殊攻撃を持つ', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.hasSpecialAttack()).toBe(true);
            expect(dragonKing.getSpecialAttackName()).toBe('激しい炎');
        });

        test('特殊攻撃は通常攻撃より強力である', () => {
            const dragonKing = new DragonKing();
            const normalAttack = dragonKing.getAttackPower();
            const specialAttack = dragonKing.getSpecialAttackPower();
            
            expect(specialAttack).toBeGreaterThan(normalAttack);
            expect(specialAttack).toBe(normalAttack * 1.5); // 1.5倍のダメージ
        });

        test('特殊攻撃の使用確率は30%である', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.getSpecialAttackChance()).toBe(0.3);
        });

        test('特殊攻撃を使用するかどうかを判定できる', () => {
            const dragonKing = new DragonKing();
            
            // モックで確率を制御
            jest.spyOn(Math, 'random').mockReturnValue(0.2); // 30%未満なので特殊攻撃
            expect(dragonKing.shouldUseSpecialAttack()).toBe(true);
            
            jest.spyOn(Math, 'random').mockReturnValue(0.5); // 30%以上なので通常攻撃
            expect(dragonKing.shouldUseSpecialAttack()).toBe(false);
            
            Math.random.mockRestore();
        });
    });

    describe('戦闘行動システム', () => {
        test('竜王の攻撃行動を取得できる', () => {
            const dragonKing = new DragonKing();
            
            // 通常攻撃の場合
            jest.spyOn(dragonKing, 'shouldUseSpecialAttack').mockReturnValue(false);
            const normalAction = dragonKing.getAttackAction();
            
            expect(normalAction.type).toBe('normal');
            expect(normalAction.damage).toBe(dragonKing.getAttackPower());
            expect(normalAction.message).toBe('竜王の攻撃！');
            
            // 特殊攻撃の場合
            jest.spyOn(dragonKing, 'shouldUseSpecialAttack').mockReturnValue(true);
            const specialAction = dragonKing.getAttackAction();
            
            expect(specialAction.type).toBe('special');
            expect(specialAction.damage).toBe(dragonKing.getSpecialAttackPower());
            expect(specialAction.message).toBe('竜王は激しい炎を吐いた！');
        });
    });

    describe('ボス戦専用機能', () => {
        test('竜王は逃走できない', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.canEscape()).toBe(false);
        });

        test('竜王戦では特別な戦闘開始メッセージがある', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.getBattleStartMessage()).toBe('竜王が立ちはだかった！');
        });

        test('竜王を倒した時の特別な勝利メッセージがある', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.getDefeatMessage()).toBe('竜王を倒した！\n姫を救出した！');
        });
    });

    describe('HPによる行動変化', () => {
        test('HPが50%以下になると特殊攻撃の確率が上がる', () => {
            const dragonKing = new DragonKing();
            
            // HP満タン時
            expect(dragonKing.getSpecialAttackChance()).toBe(0.3);
            
            // HP50%以下
            dragonKing.takeDamage(51); // HP49になる
            expect(dragonKing.getSpecialAttackChance()).toBe(0.5);
        });

        test('HPが25%以下になると更に特殊攻撃の確率が上がる', () => {
            const dragonKing = new DragonKing();
            
            // HP25%以下
            dragonKing.takeDamage(76); // HP24になる
            expect(dragonKing.getSpecialAttackChance()).toBe(0.7);
        });
    });

    describe('戦闘システム統合', () => {
        let mockPlayer;

        beforeEach(() => {
            mockPlayer = {
                hp: 50,
                takeDamage: jest.fn(),
                getDefensePower: jest.fn().mockReturnValue(10)
            };
        });

        test('竜王がプレイヤーを攻撃できる', () => {
            const dragonKing = new DragonKing();
            
            const result = dragonKing.performAttack(mockPlayer);
            
            expect(result).toHaveProperty('type');
            expect(result).toHaveProperty('damage');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('targetHp');
            expect(mockPlayer.takeDamage).toHaveBeenCalled();
        });

        test('攻撃ダメージは防御力を考慮して計算される', () => {
            const dragonKing = new DragonKing();
            jest.spyOn(dragonKing, 'shouldUseSpecialAttack').mockReturnValue(false);
            
            const result = dragonKing.performAttack(mockPlayer);
            
            // 通常攻撃(90) - 防御力(10) = 80ダメージ
            expect(result.damage).toBe(80);
        });

        test('最小ダメージは1である', () => {
            const dragonKing = new DragonKing();
            mockPlayer.getDefensePower.mockReturnValue(100); // 高い防御力
            jest.spyOn(dragonKing, 'shouldUseSpecialAttack').mockReturnValue(false);
            
            const result = dragonKing.performAttack(mockPlayer);
            
            expect(result.damage).toBe(1);
        });
    });

    describe('ステータス取得', () => {
        test('HP割合を正しく計算する', () => {
            const dragonKing = new DragonKing();
            
            expect(dragonKing.getHpPercentage()).toBe(1.0);
            
            dragonKing.takeDamage(50);
            expect(dragonKing.getHpPercentage()).toBe(0.5);
            
            dragonKing.takeDamage(25);
            expect(dragonKing.getHpPercentage()).toBe(0.25);
        });

        test('現在の状態を取得できる', () => {
            const dragonKing = new DragonKing();
            const status = dragonKing.getStatus();
            
            expect(status).toHaveProperty('name', '竜王');
            expect(status).toHaveProperty('hp', 100);
            expect(status).toHaveProperty('maxHp', 100);
            expect(status).toHaveProperty('hpPercentage', 1.0);
            expect(status).toHaveProperty('attack', 90);
            expect(status).toHaveProperty('defense', 50);
            expect(status).toHaveProperty('specialAttackChance', 0.3);
            expect(status).toHaveProperty('isBoss', true);
        });
    });
});