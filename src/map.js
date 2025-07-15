/**
 * Map クラス - ゲームマップの管理
 * ドラゴンクエスト1のマップシステム実装
 */

class Map {
    constructor() {
        // デフォルトマップサイズ（ドラクエ1準拠）
        this.width = 120;
        this.height = 120;
        this.tileSize = 16;
        
        // マップレイヤーの初期化
        this.layers = this._initializeLayers();
        
        // NPCデータの初期化（高速検索用のMapも作成）
        this.npcs = [];
        this._npcPositionMap = new globalThis.Map(); // "x,y" -> npc の高速検索用
        this._npcIdMap = new globalThis.Map(); // id -> npc の高速検索用
    }
    
    /**
     * レイヤーを初期化する（プライベートメソッド）
     * @private
     */
    _initializeLayers() {
        const totalTiles = this.width * this.height;
        return {
            background: {
                name: "background",
                data: new Array(totalTiles).fill(0)
            },
            collision: {
                name: "collision", 
                data: new Array(totalTiles).fill(0)
            }
        };
    }
    
    /**
     * 外部マップデータを読み込む
     * @param {Object} mapData - マップデータオブジェクト
     */
    loadMapData(mapData) {
        this.width = mapData.width;
        this.height = mapData.height;
        this.tileSize = mapData.tileSize;
        
        // レイヤーデータの読み込み
        this.layers = {};
        mapData.layers.forEach(layer => {
            this.layers[layer.name] = {
                name: layer.name,
                data: [...layer.data] // 配列をコピー
            };
        });
        
        // NPCデータの読み込みと高速検索用Mapの構築
        this.npcs = mapData.npcs ? [...mapData.npcs] : [];
        this._rebuildNPCMaps();
    }
    
    /**
     * NPC検索用のMapを再構築する（プライベートメソッド）
     * @private
     */
    _rebuildNPCMaps() {
        this._npcPositionMap.clear();
        this._npcIdMap.clear();
        
        this.npcs.forEach(npc => {
            const posKey = `${npc.x},${npc.y}`;
            this._npcPositionMap.set(posKey, npc);
            this._npcIdMap.set(npc.id, npc);
        });
    }
    
    /**
     * 座標からタイルIDを取得
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} layerName - レイヤー名
     * @returns {number|null} タイルID、無効な場合はnull
     */
    getTileAt(x, y, layerName) {
        // 座標の有効性チェック
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        
        // レイヤーの存在チェック
        if (!this.layers[layerName]) {
            return null;
        }
        
        const index = this.getIndexFromCoords(x, y);
        return this.layers[layerName].data[index];
    }
    
    /**
     * 座標にタイルIDを設定
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {string} layerName - レイヤー名
     * @param {number} tileId - 設定するタイルID
     */
    setTileAt(x, y, layerName, tileId) {
        // 座標の有効性チェック
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        
        // レイヤーの存在チェック
        if (!this.layers[layerName]) {
            return;
        }
        
        const index = this.getIndexFromCoords(x, y);
        this.layers[layerName].data[index] = tileId;
    }
    
    /**
     * 座標からインデックスを計算
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {number} 配列インデックス
     */
    getIndexFromCoords(x, y) {
        return y * this.width + x;
    }
    
    /**
     * インデックスから座標を計算
     * @param {number} index - 配列インデックス
     * @returns {Object} {x, y}座標オブジェクト
     */
    getCoordsFromIndex(index) {
        return {
            x: index % this.width,
            y: Math.floor(index / this.width)
        };
    }
    
    /**
     * 座標からNPCを取得（高速化版）
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {Object|null} NPCオブジェクト、見つからない場合はnull
     */
    getNPCAt(x, y) {
        const posKey = `${x},${y}`;
        return this._npcPositionMap.get(posKey) || null;
    }
    
    /**
     * IDでNPCを取得（高速化版）
     * @param {string} id - NPC ID
     * @returns {Object|null} NPCオブジェクト、見つからない場合はnull
     */
    getNPCById(id) {
        return this._npcIdMap.get(id) || null;
    }
    
    /**
     * NPCを追加
     * @param {Object} npc - NPCオブジェクト
     */
    addNPC(npc) {
        this.npcs.push(npc);
        // 高速検索用Mapも更新
        const posKey = `${npc.x},${npc.y}`;
        this._npcPositionMap.set(posKey, npc);
        this._npcIdMap.set(npc.id, npc);
    }
    
    /**
     * NPCを削除
     * @param {string} id - 削除するNPC ID
     */
    removeNPC(id) {
        const npc = this._npcIdMap.get(id);
        if (npc) {
            // 配列から削除
            this.npcs = this.npcs.filter(n => n.id !== id);
            // 高速検索用Mapからも削除
            const posKey = `${npc.x},${npc.y}`;
            this._npcPositionMap.delete(posKey);
            this._npcIdMap.delete(id);
        }
    }
    
    /**
     * 指定座標が移動可能かチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {boolean} 移動可能な場合true
     */
    isWalkable(x, y) {
        // 境界チェック
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        // コリジョンチェック
        const collisionTile = this.getTileAt(x, y, 'collision');
        if (collisionTile === 1) {
            return false;
        }
        
        // NPCチェック
        const npc = this.getNPCAt(x, y);
        if (npc) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 移動可能な隣接座標を取得
     * @param {number} x - 中心X座標
     * @param {number} y - 中心Y座標
     * @returns {Array} 移動可能な座標の配列
     */
    getWalkableNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            {x: 0, y: -1}, // 上
            {x: 1, y: 0},  // 右
            {x: 0, y: 1},  // 下
            {x: -1, y: 0}  // 左
        ];
        
        directions.forEach(dir => {
            const newX = x + dir.x;
            const newY = y + dir.y;
            if (this.isWalkable(newX, newY)) {
                neighbors.push({x: newX, y: newY});
            }
        });
        
        return neighbors;
    }
    
    /**
     * 四方向の移動可能性をチェック
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @returns {Object} 各方向の移動可能性
     */
    getWalkableDirections(x, y) {
        return {
            up: this.isWalkable(x, y - 1),
            right: this.isWalkable(x + 1, y),
            down: this.isWalkable(x, y + 1),
            left: this.isWalkable(x - 1, y)
        };
    }
    
    /**
     * 矩形エリア内にコリジョンがあるかチェック
     * @param {number} x - 開始X座標
     * @param {number} y - 開始Y座標
     * @param {number} width - 幅
     * @param {number} height - 高さ
     * @returns {boolean} コリジョンがある場合true
     */
    hasCollisionInArea(x, y, width, height) {
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                if (!this.isWalkable(x + dx, y + dy)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * パス上にコリジョンがあるかチェック
     * @param {Array} path - 座標の配列
     * @returns {boolean} コリジョンがある場合true
     */
    hasCollisionInPath(path) {
        return path.some(coord => !this.isWalkable(coord.x, coord.y));
    }
    
    /**
     * 最短パスを計算（簡易A*アルゴリズム）
     * @param {number} startX - 開始X座標
     * @param {number} startY - 開始Y座標
     * @param {number} endX - 終了X座標
     * @param {number} endY - 終了Y座標
     * @returns {Array|null} パスの配列、見つからない場合はnull
     */
    findPath(startX, startY, endX, endY) {
        // 開始点と終了点が移動可能かチェック
        if (!this.isWalkable(startX, startY) || !this.isWalkable(endX, endY)) {
            return null;
        }
        
        // 同じ座標の場合
        if (startX === endX && startY === endY) {
            return [{x: startX, y: startY}];
        }
        
        // 簡易パスファインディング（BFS）
        const queue = [{x: startX, y: startY, path: [{x: startX, y: startY}]}];
        const visited = new Set();
        visited.add(`${startX},${startY}`);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // 目標に到達
            if (current.x === endX && current.y === endY) {
                return current.path;
            }
            
            // 隣接座標を探索
            const neighbors = this.getWalkableNeighbors(current.x, current.y);
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        x: neighbor.x,
                        y: neighbor.y,
                        path: [...current.path, neighbor]
                    });
                }
            }
            
            // 無限ループ防止（最大探索数制限）
            if (visited.size > 1000) {
                break;
            }
        }
        
        return null; // パスが見つからない
    }
}

// CommonJS形式でエクスポート
module.exports = Map;