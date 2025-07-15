/**
 * Monster クラスのテスト
 */

describe('Monster', () => {
    let Monster;

    beforeEach(() => {
        // Monster クラスをインポート
        Monster = require('../src/monster.js');
    });

    describe('基本ステータス管理', () => {
        test('スライムの初期ステータスが正しく設定される', () => {
            const slime = new Monster('slime');
            
            expect(slime.name).toBe('スライム');
            expect(slime.hp).toBe(3);
            expect(slime.maxHp).toBe(3);
            expect(slime.attack).toBe(2);
            expect(slime.defense).toBe(1);
            expect(slime.experience).toBe(1);
            expect(slime.gold).toBe(2);
        });

        test('ドラキーの初期ステータスが正しく設定される', () => {
            const draky = new Monster('draky');
            
            expect(draky.name).toBe('ドラキー');
            expect(draky.hp).toBe(5);
            expect(draky.maxHp).toBe(5);
            expect(draky.attack).toBe(3);
            expect(draky.defense).toBe(2);
            expect(draky.experience).toBe(2);
            expect(draky.gold).toBe(4);
        });

        test('存在しないモンスターIDでエラーが発生する', () => {
            expect(() => {
                new Monster('invalid_monster');
            }).toThrow('Unknown monster type: invalid_monster');
        });
    });

    describe('ダメージ処理', () => {
        test('ダメージを受けてHPが減少する', () => {
            const slime = new Monster('slime');
            const initialHp = slime.hp;
            
            slime.takeDamage(2);
            
            expect(slime.hp).toBe(initialHp - 2);
        });

        test('HPが0以下になった場合は0に設定される', () => {
            const slime = new Monster('slime');
            
            slime.takeDamage(10); // 最大HPより大きなダメージ
            
            expect(slime.hp).toBe(0);
        });

        test('死亡状態を正しく判定する', () => {
            const slime = new Monster('slime');
            
            expect(slime.isDead()).toBe(false);
            
            slime.takeDamage(slime.maxHp);
            
            expect(slime.isDead()).toBe(true);
        });
    });

    describe('攻撃力計算', () => {
        test('基本攻撃力を返す', () => {
            const slime = new Monster('slime');
            
            expect(slime.getAttackPower()).toBe(2);
        });

        test('防御力を返す', () => {
            const slime = new Monster('slime');
            
            expect(slime.getDefensePower()).toBe(1);
        });
    });

    describe('報酬取得', () => {
        test('経験値を正しく返す', () => {
            const slime = new Monster('slime');
            
            expect(slime.getExperienceReward()).toBe(1);
        });

        test('ゴールドを正しく返す', () => {
            const slime = new Monster('slime');
            
            expect(slime.getGoldReward()).toBe(2);
        });
    });

    describe('静的メソッド', () => {
        test('利用可能なモンスタータイプ一覧を取得できる', () => {
            const types = Monster.getAvailableTypes();
            
            expect(types).toContain('slime');
            expect(types).toContain('draky');
            expect(types).toContain('orc');
            expect(types).toContain('skeleton');
        });

        test('静的メソッドでモンスターデータを取得できる', () => {
            const slimeData = Monster.getMonsterData('slime');
            
            expect(slimeData.name).toBe('スライム');
            expect(slimeData.hp).toBe(3);
        });
    });
});