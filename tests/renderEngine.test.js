/**
 * RenderEngine テストファイル
 * Canvas描画エンジンのテスト駆動開発
 */

describe('RenderEngine', () => {
    let renderEngine;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        // Canvas要素のモック作成
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: jest.fn()
        };
        
        mockContext = {
            fillRect: jest.fn(),
            fillStyle: '',
            font: '',
            fillText: jest.fn(),
            clearRect: jest.fn(),
            drawImage: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            strokeRect: jest.fn(),
            strokeStyle: '',
            lineWidth: 1,
            globalAlpha: 1
        };
        
        mockCanvas.getContext.mockReturnValue(mockContext);
        
        // RenderEngineをインポート（まだ存在しないのでエラーになる予定）
        const RenderEngine = require('../src/renderEngine');
        renderEngine = new RenderEngine(mockCanvas);
    });

    describe('初期化', () => {
        test('RenderEngineが正しく初期化される', () => {
            expect(renderEngine).toBeDefined();
            expect(renderEngine.canvas).toBe(mockCanvas);
            expect(renderEngine.context).toBe(mockContext);
            expect(renderEngine.stats).toBeDefined();
            expect(renderEngine.stats.drawCalls).toBe(0);
            expect(renderEngine.stats.culledDrawCalls).toBe(0);
        });

        test('Canvas要素が正しく設定される', () => {
            expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
            expect(mockContext.imageSmoothingEnabled).toBe(false);
        });

        test('描画統計が管理される', () => {
            const stats = renderEngine.getStats();
            expect(stats.drawCalls).toBe(0);
            expect(stats.culledDrawCalls).toBe(0);
            
            renderEngine.resetStats();
            expect(renderEngine.stats.drawCalls).toBe(0);
            expect(renderEngine.stats.culledDrawCalls).toBe(0);
        });
    });

    describe('基本描画機能', () => {
        test('画面をクリアできる', () => {
            renderEngine.clear();
            
            expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
        });

        test('矩形を描画できる', () => {
            renderEngine.drawRect(10, 20, 100, 50, '#FF0000');
            
            expect(mockContext.fillStyle).toBe('#FF0000');
            expect(mockContext.fillRect).toHaveBeenCalledWith(10, 20, 100, 50);
        });

        test('テキストを描画できる', () => {
            renderEngine.drawText('Hello World', 100, 200, '#000000', '16px Arial');
            
            expect(mockContext.fillStyle).toBe('#000000');
            expect(mockContext.font).toBe('16px Arial');
            expect(mockContext.fillText).toHaveBeenCalledWith('Hello World', 100, 200);
        });

        test('画像を描画できる', () => {
            const mockImage = { width: 32, height: 32 };
            renderEngine.drawImage(mockImage, 50, 75);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 50, 75);
        });

        test('画像を指定サイズで描画できる', () => {
            const mockImage = { width: 32, height: 32 };
            renderEngine.drawImage(mockImage, 50, 75, 64, 64);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(mockImage, 50, 75, 64, 64);
        });
    });

    describe('描画状態管理', () => {
        test('描画状態を保存・復元できる', () => {
            renderEngine.save();
            expect(mockContext.save).toHaveBeenCalled();
            
            renderEngine.restore();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('座標変換ができる', () => {
            renderEngine.translate(100, 200);
            expect(mockContext.translate).toHaveBeenCalledWith(100, 200);
        });

        test('スケール変換ができる', () => {
            renderEngine.scale(2, 2);
            expect(mockContext.scale).toHaveBeenCalledWith(2, 2);
        });
    });

    describe('高度な描画機能', () => {
        test('枠線付き矩形を描画できる', () => {
            renderEngine.drawStrokeRect(10, 20, 100, 50, '#0000FF', 2);
            
            expect(mockContext.strokeStyle).toBe('#0000FF');
            expect(mockContext.lineWidth).toBe(2);
            expect(mockContext.strokeRect).toHaveBeenCalledWith(10, 20, 100, 50);
        });

        test('タイルを描画できる', () => {
            const mockTileImage = { width: 16, height: 16 };
            renderEngine.drawTile(mockTileImage, 0, 0, 16, 16, 100, 200);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockTileImage, 0, 0, 16, 16, 100, 200, 16, 16
            );
        });
    });

    describe('スプライト描画システム', () => {
        let mockSpriteSheet;

        beforeEach(() => {
            mockSpriteSheet = {
                width: 256,
                height: 256,
                complete: true
            };
        });

        test('スプライトシートからスプライトを描画できる', () => {
            renderEngine.drawSprite(mockSpriteSheet, 0, 0, 16, 16, 100, 100);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockSpriteSheet, 0, 0, 16, 16, 100, 100, 16, 16
            );
        });

        test('スプライトを拡大して描画できる', () => {
            renderEngine.drawSprite(mockSpriteSheet, 16, 16, 16, 16, 200, 200, 32, 32);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockSpriteSheet, 16, 16, 16, 16, 200, 200, 32, 32
            );
        });

        test('スプライトを反転して描画できる', () => {
            renderEngine.drawSpriteFlipped(mockSpriteSheet, 0, 0, 16, 16, 100, 100, true, false);
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.scale).toHaveBeenCalledWith(-1, 1);
            expect(mockContext.drawImage).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('アニメーションフレームを描画できる', () => {
            const animationData = {
                spriteSheet: mockSpriteSheet,
                frameWidth: 16,
                frameHeight: 16,
                frames: [
                    { x: 0, y: 0 },
                    { x: 16, y: 0 },
                    { x: 32, y: 0 }
                ]
            };
            
            renderEngine.drawAnimationFrame(animationData, 1, 100, 100);
            
            expect(mockContext.drawImage).toHaveBeenCalledWith(
                mockSpriteSheet, 16, 0, 16, 16, 100, 100, 16, 16
            );
        });

        test('スプライトの透明度を設定して描画できる', () => {
            renderEngine.drawSpriteWithAlpha(mockSpriteSheet, 0, 0, 16, 16, 100, 100, 0.5);
            
            expect(mockContext.save).toHaveBeenCalled();
            expect(mockContext.globalAlpha).toBe(0.5);
            expect(mockContext.drawImage).toHaveBeenCalled();
            expect(mockContext.restore).toHaveBeenCalled();
        });

        test('画面外のスプライトはカリングされる', () => {
            renderEngine.resetStats();
            
            renderEngine.drawSprite(mockSpriteSheet, 0, 0, 16, 16, -100, -100);
            
            expect(renderEngine.stats.culledDrawCalls).toBe(1);
            expect(renderEngine.stats.drawCalls).toBe(0);
            expect(mockContext.drawImage).not.toHaveBeenCalled();
        });

        test('スプライトバッチ描画が可能', () => {
            const sprites = [
                { spriteSheet: mockSpriteSheet, sx: 0, sy: 0, sw: 16, sh: 16, dx: 100, dy: 100 },
                { spriteSheet: mockSpriteSheet, sx: 16, sy: 0, sw: 16, sh: 16, dx: 116, dy: 100 }
            ];
            
            renderEngine.drawSpriteBatch(sprites);
            
            expect(mockContext.drawImage).toHaveBeenCalledTimes(2);
            expect(mockContext.drawImage).toHaveBeenNthCalledWith(1, mockSpriteSheet, 0, 0, 16, 16, 100, 100, 16, 16);
            expect(mockContext.drawImage).toHaveBeenNthCalledWith(2, mockSpriteSheet, 16, 0, 16, 16, 116, 100, 16, 16);
        });
    });

    describe('パフォーマンス最適化', () => {
        test('描画領域外の要素はスキップされる', () => {
            // 画面外の座標での描画
            const result = renderEngine.isInViewport(-100, -100, 32, 32);
            expect(result).toBe(false);
            
            // 画面内の座標での描画
            const result2 = renderEngine.isInViewport(100, 100, 32, 32);
            expect(result2).toBe(true);
        });

        test('画面外の矩形描画はカリングされる', () => {
            renderEngine.resetStats();
            
            // 画面外の矩形を描画
            renderEngine.drawRect(-100, -100, 50, 50, '#FF0000');
            
            expect(renderEngine.stats.culledDrawCalls).toBe(1);
            expect(renderEngine.stats.drawCalls).toBe(0);
            expect(mockContext.fillRect).not.toHaveBeenCalled();
        });

        test('画面内の矩形描画は実行される', () => {
            renderEngine.resetStats();
            
            // 画面内の矩形を描画
            renderEngine.drawRect(100, 100, 50, 50, '#FF0000');
            
            expect(renderEngine.stats.drawCalls).toBe(1);
            expect(renderEngine.stats.culledDrawCalls).toBe(0);
            expect(mockContext.fillRect).toHaveBeenCalledWith(100, 100, 50, 50);
        });

        test('画面外の画像描画はカリングされる', () => {
            renderEngine.resetStats();
            const mockImage = { width: 32, height: 32 };
            
            // 画面外の画像を描画
            renderEngine.drawImage(mockImage, -100, -100);
            
            expect(renderEngine.stats.culledDrawCalls).toBe(1);
            expect(renderEngine.stats.drawCalls).toBe(0);
            expect(mockContext.drawImage).not.toHaveBeenCalled();
        });

        test('バッチ描画が可能', () => {
            const drawCalls = [
                { type: 'rect', x: 0, y: 0, width: 50, height: 50, color: '#FF0000' },
                { type: 'text', text: 'Test', x: 100, y: 100, color: '#000000', font: '12px Arial' }
            ];
            
            renderEngine.batchDraw(drawCalls);
            
            expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 50, 50);
            expect(mockContext.fillText).toHaveBeenCalledWith('Test', 100, 100);
        });
    });
});