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
     * 基本的な描画テスト - デバッグ用
     */
    testDraw(playerX = 10, playerY = 10) {
        // 背景をクリア
        this.context.fillStyle = '#002200';
        this.context.fillRect(0, 0, this.width, this.height);
        
        // テスト用のグリッドを描画
        this.context.strokeStyle = '#004400';
        this.context.lineWidth = 1;
        
        // 縦線
        for (let x = 0; x < this.width; x += 32) {
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.height);
            this.context.stroke();
        }
        
        // 横線
        for (let y = 0; y < this.height; y += 32) {
            this.context.beginPath();
            this.context.moveTo(0, y);
            this.context.lineTo(this.width, y);
            this.context.stroke();
        }
        
        // テスト用のプレイヤー位置
        this.context.fillStyle = '#ffff00';
        this.context.fillRect(playerX * 32, playerY * 32, 32, 32);
        
        // テスト用のテキスト
        this.context.fillStyle = '#ffffff';
        this.context.font = '16px monospace';
        this.context.fillText('Dragon Quest 1 - Test Mode', 10, 30);
        
        // 操作説明
        this.context.fillStyle = '#cccccc';
        this.context.font = '12px monospace';
        this.context.fillText('Use arrow keys or WASD to move', 10, 50);
    }

    /**
     * マップタイルを描画
     * @param {Object} mapData - マップデータ
     * @param {number} cameraX - カメラX座標
     * @param {number} cameraY - カメラY座標
     * @param {number} tileSize - タイルサイズ
     */
    renderMap(mapData, cameraX = 0, cameraY = 0, tileSize = 32) {
        if (!mapData || !mapData.layers || !mapData.tileDefinitions) {
            console.warn('Invalid map data for rendering');
            return;
        }
        
        const backgroundLayer = mapData.layers.find(layer => layer.name === 'background');
        if (!backgroundLayer) {
            console.warn('Background layer not found in map data');
            return;
        }
        
        // 表示範囲を計算
        const tilesPerRow = Math.ceil(this.width / tileSize) + 1;
        const tilesPerCol = Math.ceil(this.height / tileSize) + 1;
        const startTileX = Math.floor(cameraX / tileSize);
        const startTileY = Math.floor(cameraY / tileSize);
        
        // タイルを描画
        for (let row = 0; row < tilesPerCol; row++) {
            for (let col = 0; col < tilesPerRow; col++) {
                const tileX = startTileX + col;
                const tileY = startTileY + row;
                
                // マップ境界チェック
                if (tileX < 0 || tileX >= mapData.width || tileY < 0 || tileY >= mapData.height) {
                    this.stats.culledDrawCalls++;
                    continue;
                }
                
                // タイルIDを取得
                const tileIndex = tileY * mapData.width + tileX;
                const tileId = backgroundLayer.data[tileIndex];
                const tileDef = mapData.tileDefinitions[tileId];
                
                if (!tileDef) {
                    continue;
                }
                
                // 描画位置を計算
                const drawX = col * tileSize - (cameraX % tileSize);
                const drawY = row * tileSize - (cameraY % tileSize);
                
                // タイルを描画（色で代用）
                this.context.fillStyle = tileDef.color || '#000000';
                this.context.fillRect(drawX, drawY, tileSize, tileSize);
                this.stats.drawCalls++;
                
                // タイル境界線（デバッグ用、オプション）
                if (this.debugMode) {
                    this.context.strokeStyle = '#333333';
                    this.context.lineWidth = 1;
                    this.context.strokeRect(drawX, drawY, tileSize, tileSize);
                }
            }
        }
    }

    /**
     * プレイヤーを描画
     * @param {Object} player - プレイヤーオブジェクト
     * @param {number} cameraX - カメラX座標
     * @param {number} cameraY - カメラY座標
     * @param {number} tileSize - タイルサイズ
     */
    renderPlayer(player, cameraX = 0, cameraY = 0, tileSize = 32) {
        if (!player) {
            return;
        }
        
        // プレイヤーの画面上での位置を計算
        const screenX = (player.x * tileSize) - cameraX;
        const screenY = (player.y * tileSize) - cameraY;
        
        // 画面外チェック
        if (screenX < -tileSize || screenX > this.width || 
            screenY < -tileSize || screenY > this.height) {
            return;
        }
        
        // プレイヤーを描画（簡易版）
        this.context.fillStyle = '#FFD700'; // ゴールド色
        this.context.fillRect(screenX + 4, screenY + 4, tileSize - 8, tileSize - 8);
        
        // プレイヤーの詳細描画（簡易アイコン）
        this.context.fillStyle = '#FF0000'; // 赤色の頭部
        this.context.fillRect(screenX + 8, screenY + 6, tileSize - 16, 8);
        
        this.context.fillStyle = '#0000FF'; // 青色の胴体
        this.context.fillRect(screenX + 6, screenY + 14, tileSize - 12, 12);
    }

    /**
     * NPCを描画
     * @param {Array} npcs - NPCの配列
     * @param {number} cameraX - カメラX座標
     * @param {number} cameraY - カメラY座標
     * @param {number} tileSize - タイルサイズ
     */
    renderNPCs(npcs, cameraX = 0, cameraY = 0, tileSize = 32) {
        if (!npcs || npcs.length === 0) {
            return;
        }
        
        npcs.forEach(npc => {
            // NPCの画面上での位置を計算
            const screenX = (npc.x * tileSize) - cameraX;
            const screenY = (npc.y * tileSize) - cameraY;
            
            // 画面外チェック
            if (screenX < -tileSize || screenX > this.width || 
                screenY < -tileSize || screenY > this.height) {
                return;
            }
            
            // NPCを描画（種類別の色）
            let npcColor = '#00FF00'; // デフォルト緑色
            
            switch (npc.sprite) {
                case 'villager':
                    npcColor = '#8B4513'; // 茶色
                    break;
                case 'merchant':
                    npcColor = '#FF6347'; // トマト色
                    break;
                case 'sage':
                    npcColor = '#9400D3'; // 紫色
                    break;
                case 'king':
                    npcColor = '#DAA520'; // ゴールデンロッド
                    break;
                case 'princess':
                    npcColor = '#FFB6C1'; // ライトピンク
                    break;
            }
            
            this.context.fillStyle = npcColor;
            this.context.fillRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4);
            
            // NPC名表示（オプション）
            if (this.debugMode) {
                this.context.fillStyle = '#FFFFFF';
                this.context.font = '10px monospace';
                this.context.fillText(npc.name, screenX, screenY - 2);
            }
        });
    }

    /**
     * デバッグモードの切り替え
     * @param {boolean} enabled - デバッグモードの有効/無効
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }

    /**
     * 戦闘画面を描画
     * @param {Object} battleState - 戦闘状態
     */
    renderBattleScreen(battleState) {
        if (!battleState || !battleState.player || !battleState.monster) {
            return;
        }
        
        // 背景を黒で塗りつぶし
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.width, this.height);
        
        // モンスター表示エリア
        this.context.fillStyle = '#444444';
        this.context.fillRect(50, 50, this.width - 100, 200);
        
        // モンスター名
        this.context.fillStyle = '#FFFFFF';
        this.context.font = '24px monospace';
        this.context.fillText(battleState.monster.name, 70, 100);
        
        // モンスターHP
        const monsterHpBar = `HP: ${battleState.monster.hp}/${battleState.monster.maxHp}`;
        this.context.font = '16px monospace';
        this.context.fillText(monsterHpBar, 70, 130);
        
        // プレイヤー情報エリア
        this.context.fillStyle = '#222222';
        this.context.fillRect(50, this.height - 200, this.width - 100, 150);
        
        // プレイヤー名とレベル
        this.context.fillStyle = '#FFFFFF';
        this.context.font = '18px monospace';
        this.context.fillText(`${battleState.player.name} Lv.${battleState.player.level}`, 70, this.height - 170);
        
        // プレイヤーHP
        const playerHpBar = `HP: ${battleState.player.hp}/${battleState.player.maxHp}`;
        this.context.font = '16px monospace';
        this.context.fillText(playerHpBar, 70, this.height - 140);
        
        // 戦闘コマンド
        this.context.fillStyle = '#FFFF00';
        this.context.font = '16px monospace';
        this.context.fillText('コマンド: [1]攻撃 [2]逃走', 70, this.height - 110);
        
        // 戦闘状況メッセージ
        if (battleState.lastMessage) {
            this.context.fillStyle = '#CCCCCC';
            this.context.font = '14px monospace';
            this.context.fillText(battleState.lastMessage, 70, this.height - 80);
        }
        
        // ターン表示
        const turnText = battleState.currentTurn === 'player' ? 'あなたのターン' : 'モンスターのターン';
        this.context.fillStyle = '#00FF00';
        this.context.font = '16px monospace';
        this.context.fillText(turnText, this.width - 200, this.height - 170);
    }

    /**
     * 対話画面を描画
     * @param {Object} dialogState - 対話状態
     */
    renderDialogScreen(dialogState) {
        if (!dialogState || !dialogState.npc) {
            return;
        }
        
        // 半透明の背景オーバーレイ
        this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.context.fillRect(0, 0, this.width, this.height);
        
        // 対話ウィンドウ
        const dialogX = 50;
        const dialogY = this.height - 150;
        const dialogWidth = this.width - 100;
        const dialogHeight = 100;
        
        this.context.fillStyle = '#FFFFFF';
        this.context.fillRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        this.context.strokeStyle = '#000000';
        this.context.lineWidth = 3;
        this.context.strokeRect(dialogX, dialogY, dialogWidth, dialogHeight);
        
        // NPC名
        this.context.fillStyle = '#000000';
        this.context.font = '16px monospace';
        this.context.fillText(dialogState.npc.name, dialogX + 10, dialogY + 25);
        
        // 対話テキスト
        this.context.font = '14px monospace';
        if (dialogState.currentMessage) {
            const lines = this.wrapText(dialogState.currentMessage, dialogWidth - 20);
            lines.forEach((line, index) => {
                this.context.fillText(line, dialogX + 10, dialogY + 50 + (index * 18));
            });
        }
        
        // 続行メッセージ
        this.context.fillStyle = '#666666';
        this.context.font = '12px monospace';
        this.context.fillText('Enterキーで続行', dialogX + dialogWidth - 120, dialogY + dialogHeight - 10);
    }

    /**
     * テキストを指定幅で折り返し
     * @param {string} text - テキスト
     * @param {number} maxWidth - 最大幅
     * @returns {Array} 行の配列
     */
    wrapText(text, maxWidth) {
        const words = text.split('');
        const lines = [];
        let currentLine = '';
        
        for (const char of words) {
            const testLine = currentLine + char;
            const metrics = this.context.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine !== '') {
            lines.push(currentLine);
        }
        
        return lines;
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

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RenderEngine;
}