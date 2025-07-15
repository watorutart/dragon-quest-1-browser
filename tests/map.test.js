/**
 * Map クラスのテスト
 * TDD アプローチ: Red -> Green -> Refactor
 */

// Mapクラスを読み込み
const Map = require('../src/map');

describe('Map クラスの基本機能', () => {
    let map;
    
    beforeEach(() => {
        // 各テスト前に新しいMapインスタンスを作成
        map = new Map();
    });
    
    describe('マップデータ読み込みテスト (RED)', () => {
        test('Mapが正しく初期化される', () => {
            expect(map.width).toBe(120);
            expect(map.height).toBe(120);
            expect(map.tileSize).toBe(16);
        });
        
        test('マップレイヤーが正しく初期化される', () => {
            expect(map.layers).toBeDefined();
            expect(map.layers.background).toBeDefined();
            expect(map.layers.collision).toBeDefined();
        });
        
        test('背景レイヤーデータが配列として初期化される', () => {
            expect(Array.isArray(map.layers.background.data)).toBe(true);
            expect(map.layers.background.data.length).toBe(map.width * map.height);
        });
        
        test('コリジョンレイヤーデータが配列として初期化される', () => {
            expect(Array.isArray(map.layers.collision.data)).toBe(true);
            expect(map.layers.collision.data.length).toBe(map.width * map.height);
        });
        
        test('NPCデータが配列として初期化される', () => {
            expect(Array.isArray(map.npcs)).toBe(true);
        });
        
        test('マップデータを外部から読み込める', () => {
            const testMapData = {
                width: 50,
                height: 50,
                tileSize: 32,
                layers: [
                    {
                        name: "background",
                        data: new Array(50 * 50).fill(1)
                    },
                    {
                        name: "collision", 
                        data: new Array(50 * 50).fill(0)
                    }
                ],
                npcs: [
                    {
                        id: "test_npc",
                        x: 10,
                        y: 10,
                        dialog: ["テストメッセージ"]
                    }
                ]
            };
            
            map.loadMapData(testMapData);
            expect(map.width).toBe(50);
            expect(map.height).toBe(50);
            expect(map.tileSize).toBe(32);
            expect(map.npcs.length).toBe(1);
        });
    });
    
    describe('タイルアクセステスト (RED)', () => {
        test('座標からタイルIDを取得できる', () => {
            // テスト用のマップデータを設定
            map.layers.background.data[0] = 5; // (0,0)のタイル
            const tileId = map.getTileAt(0, 0, 'background');
            expect(tileId).toBe(5);
        });
        
        test('無効な座標でnullを返す', () => {
            const tileId = map.getTileAt(-1, -1, 'background');
            expect(tileId).toBeNull();
            
            const tileId2 = map.getTileAt(map.width, map.height, 'background');
            expect(tileId2).toBeNull();
        });
        
        test('座標にタイルIDを設定できる', () => {
            map.setTileAt(5, 5, 'background', 10);
            const tileId = map.getTileAt(5, 5, 'background');
            expect(tileId).toBe(10);
        });
        
        test('存在しないレイヤーでnullを返す', () => {
            const tileId = map.getTileAt(0, 0, 'nonexistent');
            expect(tileId).toBeNull();
        });
        
        test('座標からインデックスを正しく計算する', () => {
            const index = map.getIndexFromCoords(10, 5);
            expect(index).toBe(5 * map.width + 10);
        });
        
        test('インデックスから座標を正しく計算する', () => {
            const coords = map.getCoordsFromIndex(610); // 5 * 120 + 10
            expect(coords.x).toBe(10);
            expect(coords.y).toBe(5);
        });
    });
    
    describe('NPCアクセステスト (RED)', () => {
        beforeEach(() => {
            // テスト用NPCデータを設定
            map.npcs = [
                {
                    id: "king",
                    x: 11,
                    y: 11,
                    dialog: ["勇者よ、竜王を倒してくれ！"]
                },
                {
                    id: "guard",
                    x: 10,
                    y: 12,
                    dialog: ["城を守るのが我々の役目だ"]
                }
            ];
            // 高速検索用Mapを再構築
            map._rebuildNPCMaps();
        });
        
        test('座標からNPCを取得できる', () => {
            const npc = map.getNPCAt(11, 11);
            expect(npc).toBeDefined();
            expect(npc.id).toBe("king");
        });
        
        test('NPCがいない座標でnullを返す', () => {
            const npc = map.getNPCAt(0, 0);
            expect(npc).toBeNull();
        });
        
        test('IDでNPCを取得できる', () => {
            const npc = map.getNPCById("guard");
            expect(npc).toBeDefined();
            expect(npc.x).toBe(10);
            expect(npc.y).toBe(12);
        });
        
        test('存在しないIDでnullを返す', () => {
            const npc = map.getNPCById("nonexistent");
            expect(npc).toBeNull();
        });
        
        test('NPCを追加できる', () => {
            const newNPC = {
                id: "merchant",
                x: 15,
                y: 15,
                dialog: ["いらっしゃいませ！"]
            };
            
            map.addNPC(newNPC);
            const foundNPC = map.getNPCById("merchant");
            expect(foundNPC).toBeDefined();
            expect(foundNPC.x).toBe(15);
        });
        
        test('NPCを削除できる', () => {
            map.removeNPC("king");
            const npc = map.getNPCById("king");
            expect(npc).toBeNull();
        });
    });
});

describe('コリジョン検出システム', () => {
    let map;
    
    beforeEach(() => {
        map = new Map();
        // テスト用のコリジョンデータを設定
        // 0 = 移動可能, 1 = 移動不可
        map.layers.collision.data.fill(0); // 全て移動可能に初期化
        map.layers.collision.data[map.getIndexFromCoords(5, 5)] = 1; // (5,5)を移動不可に
        map.layers.collision.data[map.getIndexFromCoords(5, 6)] = 1; // (5,6)を移動不可に
        map.layers.collision.data[map.getIndexFromCoords(10, 10)] = 1; // (10,10)を移動不可に
    });
    
    describe('移動可能性判定テスト (RED)', () => {
        test('移動可能な座標でtrueを返す', () => {
            expect(map.isWalkable(0, 0)).toBe(true);
            expect(map.isWalkable(1, 1)).toBe(true);
        });
        
        test('移動不可能な座標でfalseを返す', () => {
            expect(map.isWalkable(5, 5)).toBe(false);
            expect(map.isWalkable(10, 10)).toBe(false);
        });
        
        test('マップ境界外でfalseを返す', () => {
            expect(map.isWalkable(-1, 0)).toBe(false);
            expect(map.isWalkable(0, -1)).toBe(false);
            expect(map.isWalkable(map.width, 0)).toBe(false);
            expect(map.isWalkable(0, map.height)).toBe(false);
        });
        
        test('NPCがいる座標でfalseを返す', () => {
            map.npcs = [{
                id: "blocker",
                x: 15,
                y: 15,
                dialog: ["通せんぼ！"]
            }];
            // 高速検索用Mapを再構築
            map._rebuildNPCMaps();
            
            expect(map.isWalkable(15, 15)).toBe(false);
        });
        
        test('移動可能な隣接座標を取得できる', () => {
            const walkableNeighbors = map.getWalkableNeighbors(6, 6);
            expect(walkableNeighbors).toContainEqual({x: 7, y: 6}); // 右
            expect(walkableNeighbors).toContainEqual({x: 6, y: 7}); // 下
            expect(walkableNeighbors).toContainEqual({x: 6, y: 5}); // 上
            expect(walkableNeighbors).not.toContainEqual({x: 5, y: 6}); // 左（移動不可）
        });
        
        test('四方向の移動可能性をチェックできる', () => {
            const directions = map.getWalkableDirections(6, 6);
            expect(directions.up).toBe(true);
            expect(directions.down).toBe(true);
            expect(directions.right).toBe(true);
            expect(directions.left).toBe(false); // (5,6)は移動不可
        });
    });
    
    describe('コリジョン検出ロジックテスト (RED)', () => {
        test('矩形エリアのコリジョンをチェックできる', () => {
            // 2x2のエリアをチェック
            const hasCollision = map.hasCollisionInArea(4, 4, 2, 2);
            expect(hasCollision).toBe(true); // (5,5)が含まれるため
        });
        
        test('コリジョンのない矩形エリアでfalseを返す', () => {
            const hasCollision = map.hasCollisionInArea(0, 0, 3, 3);
            expect(hasCollision).toBe(false);
        });
        
        test('移動パスにコリジョンがあるかチェックできる', () => {
            const path = [{x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5}];
            const hasCollision = map.hasCollisionInPath(path);
            expect(hasCollision).toBe(true); // (5,5)が含まれるため
        });
        
        test('安全な移動パスでfalseを返す', () => {
            const path = [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}];
            const hasCollision = map.hasCollisionInPath(path);
            expect(hasCollision).toBe(false);
        });
        
        test('最短の移動可能パスを計算できる', () => {
            // 簡単なパスファインディング（A*の簡易版）
            const path = map.findPath(0, 0, 3, 3);
            expect(path).toBeDefined();
            expect(path.length).toBeGreaterThan(0);
            expect(path[0]).toEqual({x: 0, y: 0});
            expect(path[path.length - 1]).toEqual({x: 3, y: 3});
        });
        
        test('到達不可能な場合はnullを返す', () => {
            // 全てを壁で囲む
            for (let x = 0; x < map.width; x++) {
                map.layers.collision.data[map.getIndexFromCoords(x, 0)] = 1;
                map.layers.collision.data[map.getIndexFromCoords(x, map.height - 1)] = 1;
            }
            for (let y = 0; y < map.height; y++) {
                map.layers.collision.data[map.getIndexFromCoords(0, y)] = 1;
                map.layers.collision.data[map.getIndexFromCoords(map.width - 1, y)] = 1;
            }
            
            const path = map.findPath(1, 1, map.width - 2, map.height - 2);
            expect(path).toBeNull();
        });
    });
});