/**
 * Status Display テスト - ステータス表示システムのテスト
 */

// 必要なクラスをインポート
const Player = require('../src/player');

describe('Status Display System', () => {
    let player;
    
    beforeEach(() => {
        player = new Player('テスト勇者', 1);
    });
    
    describe('プレイヤーステータスの基本機能', () => {
        test('プレイヤー名が正しく設定される', () => {
            expect(player.name).toBe('テスト勇者');
        });
        
        test('初期レベルが正しく設定される', () => {
            expect(player.level).toBe(1);
        });
        
        test('初期HPが正しく設定される', () => {
            expect(player.hp).toBe(15);
            expect(player.maxHp).toBe(15);
        });
        
        test('初期MPが正しく設定される', () => {
            expect(player.mp).toBe(0);
            expect(player.maxMp).toBe(0);
        });
        
        test('初期攻撃力が正しく設定される', () => {
            expect(player.attack).toBe(4);
        });
        
        test('初期防御力が正しく設定される', () => {
            expect(player.defense).toBe(2);
        });
        
        test('初期経験値が正しく設定される', () => {
            expect(player.experience).toBe(0);
        });
        
        test('次のレベルまでの経験値が正しく計算される', () => {
            const nextLevelExp = player.getExpToNextLevel();
            expect(nextLevelExp).toBe(7); // レベル2までに必要な経験値
        });
        
        test('初期ゴールドが正しく設定される', () => {
            expect(player.gold).toBe(120);
        });
    });
    
    describe('ステータス変化機能', () => {
        test('HPダメージを受けた時の処理', () => {
            player.hp = 10; // ダメージを受ける
            expect(player.hp).toBe(10);
            expect(player.maxHp).toBe(15);
        });
        
        test('経験値獲得時の処理', () => {
            player.experience = 5;
            expect(player.experience).toBe(5);
            expect(player.getExpToNextLevel()).toBe(2); // レベル2まであと2
        });
        
        test('ゴールド獲得時の処理', () => {
            const initialGold = player.gold;
            player.gainGold(50);
            expect(player.gold).toBe(initialGold + 50);
        });
        
        test('レベルアップ時の処理', () => {
            // レベル2まで経験値を獲得
            player.experience = 7;
            player.levelUp();
            
            expect(player.level).toBe(2);
            expect(player.getExpToNextLevel()).toBe(16); // レベル3まで必要な経験値
        });
    });
    
    describe('ステータス計算機能', () => {
        test('レベルアップに必要な経験値が正しく計算される', () => {
            expect(player.getRequiredExperience()).toBe(7); // レベル2に必要
            
            player.level = 2;
            expect(player.getRequiredExperience()).toBe(23); // レベル3に必要
        });
        
        test('経験値獲得で自動レベルアップする', () => {
            const initialLevel = player.level;
            player.gainExperience(10); // 7以上なのでレベルアップ
            
            expect(player.level).toBeGreaterThan(initialLevel);
            expect(player.experience).toBe(10);
        });
        
        test('ゴールド上限が正しく適用される', () => {
            player.gainGold(70000); // 上限を超える量
            expect(player.gold).toBe(65535); // 上限値
        });
        
        test('最大レベル時の次レベル経験値', () => {
            player.level = 30; // 最大レベル
            expect(player.getExpToNextLevel()).toBe(0);
        });
    });
    
});