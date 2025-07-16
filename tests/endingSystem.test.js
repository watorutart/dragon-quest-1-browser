/**
 * EndingSystem クラスのテスト
 * ゲームクリア処理とエンディング表示をテスト
 */

describe('EndingSystem', () => {
    let EndingSystem;

    beforeEach(() => {
        // EndingSystem クラスをインポート
        EndingSystem = require('../src/endingSystem.js');
    });

    describe('ゲームクリア処理', () => {
        test('ゲームクリア状態を正しく管理する', () => {
            const endingSystem = new EndingSystem();
            
            expect(endingSystem.isGameCleared()).toBe(false);
            
            endingSystem.triggerGameClear();
            
            expect(endingSystem.isGameCleared()).toBe(true);
        });

        test('ゲームクリア時に統計情報を記録する', () => {
            const endingSystem = new EndingSystem();
            const mockPlayer = {
                level: 18,
                hp: 45,
                maxHp: 85,
                attack: 65,
                defense: 40,
                experience: 2500,
                gold: 1200
            };
            
            const startTime = Date.now() - 3600000; // 1時間前
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear(mockPlayer);
            
            const stats = endingSystem.getGameStats();
            
            expect(stats.isCleared).toBe(true);
            expect(stats.playerLevel).toBe(18);
            expect(stats.finalHp).toBe(45);
            expect(stats.finalMaxHp).toBe(85);
            expect(stats.finalAttack).toBe(65);
            expect(stats.finalDefense).toBe(40);
            expect(stats.totalExperience).toBe(2500);
            expect(stats.finalGold).toBe(1200);
            expect(stats.playTime).toBeGreaterThan(0);
        });

        test('プレイ時間を正しく計算する', () => {
            const endingSystem = new EndingSystem();
            const startTime = Date.now() - 7200000; // 2時間前
            
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear();
            
            const stats = endingSystem.getGameStats();
            const expectedPlayTime = Math.floor((Date.now() - startTime) / 1000);
            
            expect(Math.abs(stats.playTime - expectedPlayTime)).toBeLessThan(2); // 2秒の誤差許容
        });
    });

    describe('エンディングメッセージ', () => {
        test('基本的なエンディングメッセージを取得できる', () => {
            const endingSystem = new EndingSystem();
            
            const message = endingSystem.getEndingMessage();
            
            expect(message).toContain('竜王を倒した！');
            expect(message).toContain('姫を救出した！');
            expect(message).toContain('世界に平和が戻った');
        });

        test('プレイヤーレベルに応じたメッセージを取得できる', () => {
            const endingSystem = new EndingSystem();
            const mockPlayer = { level: 20 };
            
            endingSystem.triggerGameClear(mockPlayer);
            const message = endingSystem.getEndingMessage();
            
            expect(message).toContain('レベル20');
        });

        test('プレイ時間に応じたメッセージを取得できる', () => {
            const endingSystem = new EndingSystem();
            const startTime = Date.now() - 1800000; // 30分前
            
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear();
            const message = endingSystem.getEndingMessage();
            
            expect(message).toContain('0:30:');
        });
    });

    describe('統計情報表示', () => {
        test('統計情報を整形して表示できる', () => {
            const endingSystem = new EndingSystem();
            const mockPlayer = {
                level: 15,
                hp: 60,
                maxHp: 75,
                attack: 55,
                defense: 35,
                experience: 1800,
                gold: 800
            };
            
            const startTime = Date.now() - 5400000; // 1.5時間前
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear(mockPlayer);
            
            const statsDisplay = endingSystem.getStatsDisplay();
            
            expect(statsDisplay).toContain('クリアレベル: 15');
            expect(statsDisplay).toContain('最終HP: 60/75');
            expect(statsDisplay).toContain('最終攻撃力: 55');
            expect(statsDisplay).toContain('最終防御力: 35');
            expect(statsDisplay).toContain('総経験値: 1800');
            expect(statsDisplay).toContain('最終所持金: 800G');
            expect(statsDisplay).toContain('プレイ時間:');
        });

        test('プレイ時間を時間:分:秒形式で表示する', () => {
            const endingSystem = new EndingSystem();
            const startTime = Date.now() - 7323000; // 2時間2分3秒前
            
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear();
            
            const timeDisplay = endingSystem.formatPlayTime();
            
            expect(timeDisplay).toMatch(/2:0[12]:[0-9]{2}/); // 2:01:xx または 2:02:xx
        });

        test('短いプレイ時間を正しく表示する', () => {
            const endingSystem = new EndingSystem();
            const startTime = Date.now() - 125000; // 2分5秒前
            
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear();
            
            const timeDisplay = endingSystem.formatPlayTime();
            
            expect(timeDisplay).toMatch(/0:0[12]:[0-9]{2}/); // 0:01:xx または 0:02:xx
        });
    });

    describe('タイトル画面への復帰', () => {
        test('タイトル画面復帰オプションを提供する', () => {
            const endingSystem = new EndingSystem();
            
            expect(endingSystem.canReturnToTitle()).toBe(true);
        });

        test('タイトル画面復帰時にゲーム状態をリセットする', () => {
            const endingSystem = new EndingSystem();
            
            endingSystem.triggerGameClear();
            expect(endingSystem.isGameCleared()).toBe(true);
            
            endingSystem.returnToTitle();
            
            expect(endingSystem.isGameCleared()).toBe(false);
            expect(endingSystem.getGameStats().isCleared).toBe(false);
        });

        test('タイトル復帰メッセージを取得できる', () => {
            const endingSystem = new EndingSystem();
            
            const message = endingSystem.getTitleReturnMessage();
            
            expect(message).toContain('タイトル画面に戻る');
        });
    });

    describe('エンディング演出', () => {
        test('エンディング演出の段階を管理できる', () => {
            const endingSystem = new EndingSystem();
            
            expect(endingSystem.getCurrentEndingPhase()).toBe('none');
            
            endingSystem.startEndingSequence();
            expect(endingSystem.getCurrentEndingPhase()).toBe('victory');
            
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentEndingPhase()).toBe('rescue');
            
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentEndingPhase()).toBe('stats');
            
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentEndingPhase()).toBe('complete');
        });

        test('各段階のメッセージを取得できる', () => {
            const endingSystem = new EndingSystem();
            
            endingSystem.startEndingSequence();
            
            // 勝利段階
            expect(endingSystem.getCurrentPhaseMessage()).toContain('竜王を倒した');
            
            // 救出段階
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentPhaseMessage()).toContain('姫を救出');
            
            // 統計段階
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentPhaseMessage()).toContain('冒険の記録');
            
            // 完了段階
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentPhaseMessage()).toContain('ありがとうございました');
        });
    });

    describe('エラーハンドリングと境界値', () => {
        test('プレイヤー情報が不完全でもエラーにならない', () => {
            const endingSystem = new EndingSystem();
            const incompletePlayer = { level: 10 }; // 他のプロパティが欠けている
            
            expect(() => {
                endingSystem.triggerGameClear(incompletePlayer);
            }).not.toThrow();
            
            const stats = endingSystem.getGameStats();
            expect(stats.playerLevel).toBe(10);
            expect(stats.finalHp).toBe(0);
            expect(stats.finalAttack).toBe(0);
        });

        test('ゲーム開始時間が設定されていなくてもエラーにならない', () => {
            const endingSystem = new EndingSystem();
            
            expect(() => {
                endingSystem.triggerGameClear();
            }).not.toThrow();
            
            const stats = endingSystem.getGameStats();
            expect(stats.playTime).toBe(0);
        });

        test('非常に長いプレイ時間も正しく表示される', () => {
            const endingSystem = new EndingSystem();
            const startTime = Date.now() - 36000000; // 10時間前
            
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear();
            
            const timeDisplay = endingSystem.formatPlayTime();
            expect(timeDisplay).toMatch(/^10:/); // 10時間から始まる
        });

        test('0秒のプレイ時間も正しく表示される', () => {
            const endingSystem = new EndingSystem();
            const startTime = Date.now();
            
            endingSystem.setGameStartTime(startTime);
            endingSystem.triggerGameClear();
            
            const timeDisplay = endingSystem.formatPlayTime();
            expect(timeDisplay).toBe('0:00:00');
        });
    });

    describe('統合テスト', () => {
        test('完全なゲームクリアフローが正常に動作する', () => {
            const endingSystem = new EndingSystem();
            const player = {
                level: 20,
                hp: 80,
                maxHp: 100,
                attack: 70,
                defense: 45,
                experience: 3000,
                gold: 1500
            };
            
            // ゲーム開始
            const startTime = Date.now() - 7200000; // 2時間前
            endingSystem.setGameStartTime(startTime);
            
            // ゲームクリア
            endingSystem.triggerGameClear(player);
            
            // エンディング演出開始
            endingSystem.startEndingSequence();
            
            // 各段階を確認
            expect(endingSystem.getCurrentEndingPhase()).toBe('victory');
            expect(endingSystem.getCurrentPhaseMessage()).toContain('竜王を倒した');
            
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentEndingPhase()).toBe('rescue');
            
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentEndingPhase()).toBe('stats');
            
            endingSystem.nextEndingPhase();
            expect(endingSystem.getCurrentEndingPhase()).toBe('complete');
            
            // 統計情報確認
            const stats = endingSystem.getGameStats();
            expect(stats.isCleared).toBe(true);
            expect(stats.playerLevel).toBe(20);
            expect(stats.playTime).toBeGreaterThan(7000); // 約2時間
            
            // タイトルに戻る
            endingSystem.returnToTitle();
            expect(endingSystem.isGameCleared()).toBe(false);
            expect(endingSystem.getCurrentEndingPhase()).toBe('none');
        });
    });
});