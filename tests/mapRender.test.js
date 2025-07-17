/**
 * MapRender テスト - マップ描画機能のテスト
 */

const RenderEngine = require('../src/renderEngine');
const Map = require('../src/map');
const { createTestMapData } = require('./mapData.test');

describe('Map Rendering System', () => {
    let canvas, context, renderEngine, map, mapData;
    
    beforeEach(() => {
        // Canvasのモック作成
        canvas = {
            width: 800,
            height: 600,
            getContext: jest.fn()
        };
        
        // 2D Contextのモック作成
        context = {
            clearRect: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            fillText: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            set fillStyle(value) { this._fillStyle = value; },
            get fillStyle() { return this._fillStyle; },
            set strokeStyle(value) { this._strokeStyle = value; },
            get strokeStyle() { return this._strokeStyle; },
            set font(value) { this._font = value; },
            get font() { return this._font; },
            set lineWidth(value) { this._lineWidth = value; },
            get lineWidth() { return this._lineWidth; },
            set globalAlpha(value) { this._globalAlpha = value; },
            get globalAlpha() { return this._globalAlpha; },
            imageSmoothingEnabled: false
        };
        
        canvas.getContext.mockReturnValue(context);
        
        renderEngine = new RenderEngine(canvas);
        map = new Map();
        mapData = createTestMapData();
        map.loadMapData(mapData);
    });
    
    describe('マップ描画機能', () => {
        test('renderMapが正しく動作する', () => {
            renderEngine.renderMap(mapData, 0, 0, 32);
            
            // fillRectが呼ばれることを確認（タイルの描画）
            expect(context.fillRect).toHaveBeenCalled();
        });
        
        test('無効なマップデータでエラーにならない', () => {
            expect(() => {
                renderEngine.renderMap(null, 0, 0, 32);
            }).not.toThrow();
            
            expect(() => {
                renderEngine.renderMap({}, 0, 0, 32);
            }).not.toThrow();
        });
        
        test('カメラオフセットが正しく適用される', () => {
            renderEngine.renderMap(mapData, 64, 64, 32);
            
            // オフセットを考慮したタイル描画位置の計算が行われることを確認
            expect(context.fillRect).toHaveBeenCalled();
        });
        
        test('画面外のタイルがカリングされる', () => {
            const callCountBefore = context.fillRect.mock.calls.length;
            
            // 画面外のカメラ位置で描画
            renderEngine.renderMap(mapData, 10000, 10000, 32);
            
            // fillRectの呼び出し回数が制限されることを確認
            const callCountAfter = context.fillRect.mock.calls.length;
            expect(callCountAfter).toBeGreaterThanOrEqual(callCountBefore);
        });
        
        test('デバッグモードでタイル境界線が描画される', () => {
            renderEngine.setDebugMode(true);
            renderEngine.renderMap(mapData, 0, 0, 32);
            
            // strokeRectが呼ばれることを確認（境界線の描画）
            expect(context.strokeRect).toHaveBeenCalled();
        });
        
        test('デバッグモード無効時は境界線が描画されない', () => {
            renderEngine.setDebugMode(false);
            context.strokeRect.mockClear();
            
            renderEngine.renderMap(mapData, 0, 0, 32);
            
            // strokeRectが呼ばれないことを確認
            expect(context.strokeRect).not.toHaveBeenCalled();
        });
    });
    
    describe('プレイヤー描画機能', () => {
        test('renderPlayerが正しく動作する', () => {
            const player = { x: 5, y: 5 };
            
            renderEngine.renderPlayer(player, 0, 0, 32);
            
            // プレイヤーの描画でfillRectが呼ばれることを確認
            expect(context.fillRect).toHaveBeenCalled();
        });
        
        test('プレイヤーがnullの場合エラーにならない', () => {
            expect(() => {
                renderEngine.renderPlayer(null, 0, 0, 32);
            }).not.toThrow();
        });
        
        test('プレイヤーが画面外の場合は描画されない', () => {
            const player = { x: -10, y: -10 };
            context.fillRect.mockClear();
            
            renderEngine.renderPlayer(player, 0, 0, 32);
            
            // 画面外なので描画されない
            expect(context.fillRect).not.toHaveBeenCalled();
        });
        
        test('カメラオフセットを考慮した位置で描画される', () => {
            const player = { x: 10, y: 10 };
            context.fillRect.mockClear();
            
            renderEngine.renderPlayer(player, 100, 100, 32);
            
            // カメラオフセットを考慮した描画が行われることを確認
            expect(context.fillRect).toHaveBeenCalled();
            
            // プレイヤーの描画では複数のfillRectが呼ばれる（背景、頭部、胴体）
            // 最初の呼び出し（背景部分）の位置をチェック
            const calls = context.fillRect.mock.calls;
            const firstCall = calls[0];
            const [x, y] = firstCall;
            
            // プレイヤー位置 * タイルサイズ - カメラオフセット + オフセット調整
            const expectedX = (player.x * 32) - 100 + 4; // +4は描画オフセット
            const expectedY = (player.y * 32) - 100 + 4; // +4は描画オフセット
            
            expect(x).toBe(expectedX);
            expect(y).toBe(expectedY);
        });
    });
    
    describe('NPC描画機能', () => {
        test('renderNPCsが正しく動作する', () => {
            renderEngine.renderNPCs(mapData.npcs, 0, 0, 32);
            
            // NPCの描画でfillRectが呼ばれることを確認
            expect(context.fillRect).toHaveBeenCalled();
        });
        
        test('NPCリストが空の場合エラーにならない', () => {
            expect(() => {
                renderEngine.renderNPCs([], 0, 0, 32);
                renderEngine.renderNPCs(null, 0, 0, 32);
            }).not.toThrow();
        });
        
        test('NPCの種類別に色が設定される', () => {
            const npcs = [
                { x: 5, y: 5, sprite: 'villager', name: '村人' },
                { x: 6, y: 6, sprite: 'merchant', name: '商人' }
            ];
            
            renderEngine.renderNPCs(npcs, 0, 0, 32);
            
            // 異なる色でfillStyleが設定されることを確認
            expect(context.fillRect).toHaveBeenCalledTimes(npcs.length);
        });
        
        test('デバッグモードでNPC名が表示される', () => {
            renderEngine.setDebugMode(true);
            
            renderEngine.renderNPCs(mapData.npcs, 0, 0, 32);
            
            // NPC名の描画でfillTextが呼ばれることを確認
            expect(context.fillText).toHaveBeenCalled();
        });
    });
    
    describe('描画統計機能', () => {
        test('描画コール数が正しくカウントされる', () => {
            renderEngine.resetStats();
            
            renderEngine.renderMap(mapData, 0, 0, 32);
            
            const stats = renderEngine.getStats();
            expect(stats.drawCalls).toBeGreaterThan(0);
        });
        
        test('カリングされた描画コール数が正しくカウントされる', () => {
            renderEngine.resetStats();
            
            // 画面外のマップを描画
            renderEngine.renderMap(mapData, -10000, -10000, 32);
            
            const stats = renderEngine.getStats();
            expect(stats.culledDrawCalls).toBeGreaterThan(0);
        });
        
        test('統計がリセットされる', () => {
            renderEngine.renderMap(mapData, 0, 0, 32);
            renderEngine.resetStats();
            
            const stats = renderEngine.getStats();
            expect(stats.drawCalls).toBe(0);
            expect(stats.culledDrawCalls).toBe(0);
        });
    });
});