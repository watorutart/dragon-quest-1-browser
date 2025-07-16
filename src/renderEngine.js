/**
 * RenderEngine - Canvas描画エンジン
 * ゲームの描画処理を管理するクラス
 */

class RenderEngine {
    /**
     * RenderEngineを初期化
     * @param {HTMLCanvasElement} canvas - Canvas要素
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // パフォーマンス最適化のための設定
        this.context.imageSmoothingEnabled = false; // ピクセルアート用
        
        // 描画統計（デバッグ用）
        this.stats = {
            drawCalls: 0,
            culledDrawCalls: 0
        };
    }

    /**
     * 描画統計をリセット
     */
    resetStats() {
        this.stats.drawCalls = 0;
        this.stats.culledDrawCalls = 0;
    }

    /**
     * 描画統計を取得
     * @returns {Object} 描画統計
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 画面をクリア
     */
    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    /**
     * 矩形を描画（カリング付き）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {string} color - 色
     */
    drawRect(x, y, width, height, color) {
        if (!this.isInViewport(x, y, width, height)) {
            this.stats.culledDrawCalls++;
            return;
        }
        
        this.stats.drawCalls++;
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    /**
     * テキストを描画
     * @param {string} text - テキスト
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} color - 色
     * @param {string} font - フォント
     */
    drawText(text, x, y, color, font) {
        this.context.fillStyle = color;
        this.context.font = font;
        this.context.fillText(text, x, y);
    }

    /**
     * 画像を描画（カリング付き）
     * @param {HTMLImageElement} image - 画像
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅（オプション）
     * @param {number} height - 高さ（オプション）
     */
    drawImage(image, x, y, width, height) {
        const imgWidth = width !== undefined ? width : image.width;
        const imgHeight = height !== undefined ? height : image.height;
        
        if (!this.isInViewport(x, y, imgWidth, imgHeight)) {
            this.stats.culledDrawCalls++;
            return;
        }
        
        this.stats.drawCalls++;
        if (width !== undefined && height !== undefined) {
            this.context.drawImage(image, x, y, width, height);
        } else {
            this.context.drawImage(image, x, y);
        }
    }

    /**
     * 描画状態を保存
     */
    save() {
        this.context.save();
    }

    /**
     * 描画状態を復元
     */
    restore() {
        this.context.restore();
    }

    /**
     * 座標変換
     * @param {number} x - X方向の移動量
     * @param {number} y - Y方向の移動量
     */
    translate(x, y) {
        this.context.translate(x, y);
    }

    /**
     * スケール変換
     * @param {number} scaleX - X方向のスケール
     * @param {number} scaleY - Y方向のスケール
     */
    scale(scaleX, scaleY) {
        this.context.scale(scaleX, scaleY);
    }

    /**
     * 枠線付き矩形を描画
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @param {string} color - 色
     * @param {number} lineWidth - 線の太さ
     */
    drawStrokeRect(x, y, width, height, color, lineWidth) {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWidth;
        this.context.strokeRect(x, y, width, height);
    }

    /**
     * タイルを描画（スプライトシートから切り出し）
     * @param {HTMLImageElement} image - スプライトシート画像
     * @param {number} sx - ソースX座標
     * @param {number} sy - ソースY座標
     * @param {number} sWidth - ソース幅
     * @param {number} sHeight - ソース高さ
     * @param {number} dx - 描画先X座標
     * @param {number} dy - 描画先Y座標
     */
    drawTile(image, sx, sy, sWidth, sHeight, dx, dy) {
        this.context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, sWidth, sHeight);
    }

    /**
     * 指定した座標が画面内にあるかチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @returns {boolean} 画面内にある場合true
     */
    isInViewport(x, y, width, height) {
        return !(x + width < 0 || x > this.width || y + height < 0 || y > this.height);
    }

    /**
     * バッチ描画（複数の描画コマンドを一度に実行）
     * @param {Array} drawCalls - 描画コマンドの配列
     */
    batchDraw(drawCalls) {
        drawCalls.forEach(call => {
            switch (call.type) {
                case 'rect':
                    this.drawRect(call.x, call.y, call.width, call.height, call.color);
                    break;
                case 'text':
                    this.drawText(call.text, call.x, call.y, call.color, call.font);
                    break;
                case 'image':
                    this.drawImage(call.image, call.x, call.y, call.width, call.height);
                    break;
                default:
                    console.warn(`Unknown draw call type: ${call.type}`);
            }
        });
    }

    // === スプライト描画システム ===

    /**
     * スプライトを描画（カリング付き・最適化済み）
     * @param {HTMLImageElement} spriteSheet - スプライトシート
     * @param {number} sx - ソースX座標
     * @param {number} sy - ソースY座標
     * @param {number} sw - ソース幅
     * @param {number} sh - ソース高さ
     * @param {number} dx - 描画先X座標
     * @param {number} dy - 描画先Y座標
     * @param {number} dw - 描画先幅（オプション）
     * @param {number} dh - 描画先高さ（オプション）
     */
    drawSprite(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh) {
        const drawWidth = dw !== undefined ? dw : sw;
        const drawHeight = dh !== undefined ? dh : sh;
        
        // 早期カリング - 画面外の描画をスキップ
        if (!this.isInViewport(dx, dy, drawWidth, drawHeight)) {
            this.stats.culledDrawCalls++;
            return;
        }
        
        // 画像の読み込み状態チェック（最適化）
        if (!spriteSheet.complete) {
            console.warn('Sprite sheet not loaded yet');
            return;
        }
        
        this.stats.drawCalls++;
        
        // 描画パラメータの最適化
        if (dw !== undefined && dh !== undefined) {
            this.context.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh);
        } else {
            this.context.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, sw, sh);
        }
    }

    /**
     * スプライトを反転して描画
     * @param {HTMLImageElement} spriteSheet - スプライトシート
     * @param {number} sx - ソースX座標
     * @param {number} sy - ソースY座標
     * @param {number} sw - ソース幅
     * @param {number} sh - ソース高さ
     * @param {number} dx - 描画先X座標
     * @param {number} dy - 描画先Y座標
     * @param {boolean} flipX - X軸反転
     * @param {boolean} flipY - Y軸反転
     */
    drawSpriteFlipped(spriteSheet, sx, sy, sw, sh, dx, dy, flipX = false, flipY = false) {
        if (!this.isInViewport(dx, dy, sw, sh)) {
            this.stats.culledDrawCalls++;
            return;
        }
        
        this.stats.drawCalls++;
        this.context.save();
        
        if (flipX || flipY) {
            const scaleX = flipX ? -1 : 1;
            const scaleY = flipY ? -1 : 1;
            const translateX = flipX ? -(dx + sw) : dx;
            const translateY = flipY ? -(dy + sh) : dy;
            
            this.context.scale(scaleX, scaleY);
            this.context.drawImage(spriteSheet, sx, sy, sw, sh, translateX, translateY, sw, sh);
        } else {
            this.context.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, sw, sh);
        }
        
        this.context.restore();
    }

    /**
     * アニメーションフレームを描画
     * @param {Object} animationData - アニメーションデータ
     * @param {number} frameIndex - フレームインデックス
     * @param {number} dx - 描画先X座標
     * @param {number} dy - 描画先Y座標
     */
    drawAnimationFrame(animationData, frameIndex, dx, dy) {
        const { spriteSheet, frameWidth, frameHeight, frames } = animationData;
        
        if (frameIndex < 0 || frameIndex >= frames.length) {
            console.warn(`Invalid frame index: ${frameIndex}`);
            return;
        }
        
        const frame = frames[frameIndex];
        this.drawSprite(spriteSheet, frame.x, frame.y, frameWidth, frameHeight, dx, dy);
    }

    /**
     * 透明度を指定してスプライトを描画
     * @param {HTMLImageElement} spriteSheet - スプライトシート
     * @param {number} sx - ソースX座標
     * @param {number} sy - ソースY座標
     * @param {number} sw - ソース幅
     * @param {number} sh - ソース高さ
     * @param {number} dx - 描画先X座標
     * @param {number} dy - 描画先Y座標
     * @param {number} alpha - 透明度（0.0-1.0）
     */
    drawSpriteWithAlpha(spriteSheet, sx, sy, sw, sh, dx, dy, alpha) {
        if (!this.isInViewport(dx, dy, sw, sh)) {
            this.stats.culledDrawCalls++;
            return;
        }
        
        this.stats.drawCalls++;
        this.context.save();
        this.context.globalAlpha = alpha;
        this.context.drawImage(spriteSheet, sx, sy, sw, sh, dx, dy, sw, sh);
        this.context.restore();
    }

    /**
     * スプライトバッチ描画（複数のスプライトを効率的に描画・最適化済み）
     * @param {Array} sprites - スプライト描画データの配列
     */
    drawSpriteBatch(sprites) {
        // スプライトシート別にグループ化して描画効率を向上
        const spriteGroups = new Map();
        
        sprites.forEach(sprite => {
            const { spriteSheet } = sprite;
            if (!spriteGroups.has(spriteSheet)) {
                spriteGroups.set(spriteSheet, []);
            }
            spriteGroups.get(spriteSheet).push(sprite);
        });
        
        // グループごとに描画実行
        spriteGroups.forEach((groupSprites, spriteSheet) => {
            // 画像の読み込み状態を一度だけチェック
            if (!spriteSheet.complete) {
                console.warn('Sprite sheet not loaded yet, skipping batch');
                return;
            }
            
            groupSprites.forEach(sprite => {
                const { sx, sy, sw, sh, dx, dy, dw, dh } = sprite;
                this.drawSprite(spriteSheet, sx, sy, sw, sh, dx, dy, dw, dh);
            });
        });
    }
}

module.exports = RenderEngine;