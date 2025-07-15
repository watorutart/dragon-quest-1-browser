/**
 * エンカウントシステムのテスト
 */

const EncounterSystem = require('../src/encounterSystem');

describe('EncounterSystem', () => {
    let encounterSystem;

    beforeEach(() => {
        encounterSystem = new EncounterSystem();
        // Math.randomをモック化してテストを予測可能にする
        jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        Math.random.mockRestore();
    });

    describe('checkEncounter', () => {
        test('エンカウント率が0.1の時、乱数0.05でエンカウントが発生する', () => {
            Math.random.mockReturnValue(0.05);
            
            const result = encounterSystem.checkEncounter(0.1);
            
            expect(result).toBe(true);
        });

        test('エンカウント率が0.1の時、乱数0.15でエンカウントが発生しない', () => {
            Math.random.mockReturnValue(0.15);
            
            const result = encounterSystem.checkEncounter(0.1);
            
            expect(result).toBe(false);
        });

        test('エンカウント率が0の時、常にエンカウントが発生しない', () => {
            Math.random.mockReturnValue(0.01);
            
            const result = encounterSystem.checkEncounter(0);
            
            expect(result).toBe(false);
        });

        test('エンカウント率が1の時、常にエンカウントが発生する', () => {
            Math.random.mockReturnValue(0.99);
            
            const result = encounterSystem.checkEncounter(1);
            
            expect(result).toBe(true);
        });
    });

    describe('getRandomMonster', () => {
        test('モンスターリストからランダムにモンスターを選択する', () => {
            const monsters = ['スライム', 'ゴブリン', 'オーク'];
            Math.random.mockReturnValue(0.5);
            
            const result = encounterSystem.getRandomMonster(monsters);
            
            expect(result).toBe('ゴブリン');
        });

        test('空のモンスターリストの場合、nullを返す', () => {
            const monsters = [];
            
            const result = encounterSystem.getRandomMonster(monsters);
            
            expect(result).toBeNull();
        });
    });

    describe('processEncounter', () => {
        test('エンカウントが発生した場合、モンスター情報を返す', () => {
            const monsters = ['スライム', 'ゴブリン'];
            Math.random.mockReturnValueOnce(0.05); // エンカウント判定
            Math.random.mockReturnValueOnce(0.3);  // モンスター選択
            
            const result = encounterSystem.processEncounter(0.1, monsters);
            
            expect(result).toEqual({
                encountered: true,
                monster: 'スライム'
            });
        });

        test('エンカウントが発生しなかった場合、encountered: falseを返す', () => {
            const monsters = ['スライム', 'ゴブリン'];
            Math.random.mockReturnValue(0.15);
            
            const result = encounterSystem.processEncounter(0.1, monsters);
            
            expect(result).toEqual({
                encountered: false,
                monster: null
            });
        });
    });
});