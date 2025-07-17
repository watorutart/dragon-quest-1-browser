/**
 * MapData テスト - 実際のマップデータの定義と読み込みテスト
 */

const Map = require('../src/map');

describe('MapData Integration', () => {
    let map;
    
    beforeEach(() => {
        map = new Map();
    });
    
    describe('基本マップデータの読み込み', () => {
        test('基本的なマップデータを正しく読み込める', () => {
            const testMapData = createTestMapData();
            
            map.loadMapData(testMapData);
            
            expect(map.width).toBe(testMapData.width);
            expect(map.height).toBe(testMapData.height);
            expect(map.tileSize).toBe(testMapData.tileSize);
            expect(map.layers).toHaveProperty('background');
            expect(map.layers).toHaveProperty('collision');
        });
        
        test('草地タイルが正しく配置される', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            // 草地エリア（水域を避けた場所をチェック）
            expect(map.getTileAt(0, 0, 'background')).toBe(1); // 草地タイル
            expect(map.getTileAt(0, 0, 'collision')).toBe(0); // 移動可能
            expect(map.getTileAt(10, 10, 'background')).toBe(1); // 草地タイル
            expect(map.getTileAt(10, 10, 'collision')).toBe(0); // 移動可能
            expect(map.getTileAt(8, 8, 'background')).toBe(1); // 草地タイル
            expect(map.getTileAt(8, 8, 'collision')).toBe(0); // 移動可能
        });
        
        test('山岳タイルが正しく配置される', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            // 山岳エリア（15,15）をチェック
            expect(map.getTileAt(15, 15, 'background')).toBe(3); // 山岳タイル
            expect(map.getTileAt(15, 15, 'collision')).toBe(1); // 移動不可
        });
        
        test('水域タイルが正しく配置される', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            // 水域エリア（5,5）をチェック
            expect(map.getTileAt(5, 5, 'background')).toBe(2); // 水域タイル
            expect(map.getTileAt(5, 5, 'collision')).toBe(1); // 移動不可
        });
        
        test('プレイヤーの初期位置が移動可能である', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            const playerStartX = 10;
            const playerStartY = 10;
            
            expect(map.isWalkable(playerStartX, playerStartY)).toBe(true);
        });
    });
    
    describe('NPCデータの読み込み', () => {
        test('NPCが正しく配置される', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            const npc = map.getNPCAt(12, 10);
            expect(npc).not.toBeNull();
            expect(npc.id).toBe('villager_01');
            expect(npc.name).toBe('村人');
        });
        
        test('NPC位置は移動不可になる', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            expect(map.isWalkable(12, 10)).toBe(false); // NPC位置
        });
    });
    
    describe('マップ境界の確認', () => {
        test('マップ境界外は移動不可', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            expect(map.isWalkable(-1, 10)).toBe(false);
            expect(map.isWalkable(10, -1)).toBe(false);
            expect(map.isWalkable(testMapData.width, 10)).toBe(false);
            expect(map.isWalkable(10, testMapData.height)).toBe(false);
        });
    });
    
    describe('マップデータの妥当性', () => {
        test('レイヤーデータのサイズが正しい', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            const expectedSize = testMapData.width * testMapData.height;
            expect(map.layers.background.data.length).toBe(expectedSize);
            expect(map.layers.collision.data.length).toBe(expectedSize);
        });
        
        test('タイル座標からインデックスの変換が正しい', () => {
            const testMapData = createTestMapData();
            map.loadMapData(testMapData);
            
            expect(map.getIndexFromCoords(0, 0)).toBe(0);
            expect(map.getIndexFromCoords(1, 0)).toBe(1);
            expect(map.getIndexFromCoords(0, 1)).toBe(testMapData.width);
            expect(map.getIndexFromCoords(5, 3)).toBe(3 * testMapData.width + 5);
        });
    });
});

/**
 * テスト用のマップデータを作成
 * @returns {Object} マップデータ
 */
function createTestMapData() {
    const width = 20;
    const height = 20;
    const totalTiles = width * height;
    
    // 背景レイヤー（地形）
    const backgroundData = new Array(totalTiles).fill(1); // デフォルト草地
    
    // コリジョンレイヤー（移動可能性）
    const collisionData = new Array(totalTiles).fill(0); // デフォルト移動可能
    
    // 特定エリアに異なるタイルを配置
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            
            // 水域エリア（中央付近）
            if (x >= 4 && x <= 6 && y >= 4 && y <= 6) {
                backgroundData[index] = 2; // 水域タイル
                collisionData[index] = 1;  // 移動不可
            }
            
            // 山岳エリア（右下）
            if (x >= 15 && y >= 15) {
                backgroundData[index] = 3; // 山岳タイル
                collisionData[index] = 1;  // 移動不可
            }
            
            // 砂漠エリア（左下）
            if (x <= 3 && y >= 15) {
                backgroundData[index] = 4; // 砂漠タイル
                collisionData[index] = 0;  // 移動可能
            }
        }
    }
    
    return {
        width: width,
        height: height,
        tileSize: 16,
        layers: [
            {
                name: 'background',
                data: backgroundData
            },
            {
                name: 'collision',
                data: collisionData
            }
        ],
        npcs: [
            {
                id: 'villager_01',
                name: '村人',
                x: 12,
                y: 10,
                sprite: 'villager',
                dialogue: ['こんにちは、勇者様！', 'この世界にようこそ！']
            },
            {
                id: 'merchant_01',
                name: '商人',
                x: 8,
                y: 12,
                sprite: 'merchant',
                dialogue: ['武器や防具はいかがですか？']
            }
        ],
        tileDefinitions: {
            0: { name: '空', walkable: true, sprite: 'empty' },
            1: { name: '草地', walkable: true, sprite: 'grass' },
            2: { name: '水域', walkable: false, sprite: 'water' },
            3: { name: '山岳', walkable: false, sprite: 'mountain' },
            4: { name: '砂漠', walkable: true, sprite: 'desert' }
        }
    };
}

module.exports = { createTestMapData };