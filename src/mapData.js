/**
 * MapData - ドラゴンクエスト1のマップデータ定義
 */

/**
 * テストワールドのマップデータを作成
 * @returns {Object} マップデータ
 */
function createTestWorldMapData() {
    const width = 30;
    const height = 30;
    const totalTiles = width * height;
    
    // 背景レイヤー（地形）
    const backgroundData = new Array(totalTiles).fill(1); // デフォルト草地
    
    // コリジョンレイヤー（移動可能性）
    const collisionData = new Array(totalTiles).fill(0); // デフォルト移動可能
    
    // 特定エリアに異なるタイルを配置
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            
            // 外周を山岳で囲む
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                backgroundData[index] = 3; // 山岳タイル
                collisionData[index] = 1;  // 移動不可
            }
            
            // 中央に小さな湖を作成
            const centerX = Math.floor(width / 2);
            const centerY = Math.floor(height / 2);
            const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            if (distanceFromCenter <= 3) {
                backgroundData[index] = 2; // 水域タイル
                collisionData[index] = 1;  // 移動不可
            }
            
            // 小さな森エリア
            if (x >= 5 && x <= 10 && y >= 5 && y <= 8) {
                backgroundData[index] = 5; // 森タイル
                collisionData[index] = 0;  // 移動可能
            }
            
            // 砂漠エリア（右上）
            if (x >= 20 && x <= 25 && y >= 5 && y <= 10) {
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
                dialogue: ['こんにちは、勇者様！', 'この世界は危険なモンスターがいるので気をつけて！']
            },
            {
                id: 'merchant_01',
                name: '商人',
                x: 8,
                y: 12,
                sprite: 'merchant',
                dialogue: ['武器や防具はいかがですか？', '冒険には装備が必要ですよ！']
            },
            {
                id: 'sage_01',
                name: '賢者',
                x: 15,
                y: 8,
                sprite: 'sage',
                dialogue: ['竜王は遠い城にいるという...', '強くなってから挑むのじゃ。']
            }
        ],
        tileDefinitions: {
            0: { name: '空', walkable: true, sprite: 'empty', color: '#000000' },
            1: { name: '草地', walkable: true, sprite: 'grass', color: '#228B22' },
            2: { name: '水域', walkable: false, sprite: 'water', color: '#1E90FF' },
            3: { name: '山岳', walkable: false, sprite: 'mountain', color: '#8B4513' },
            4: { name: '砂漠', walkable: true, sprite: 'desert', color: '#F4A460' },
            5: { name: '森', walkable: true, sprite: 'forest', color: '#006400' }
        },
        playerStartPosition: {
            x: 10,
            y: 10
        },
        worldName: 'テストワールド',
        description: 'ドラゴンクエスト1の基本的なテストワールド'
    };
}

/**
 * ドラゴンクエスト1の本格的なワールドマップデータ
 * @returns {Object} マップデータ
 */
function createAlefgardMapData() {
    const width = 120;
    const height = 120;
    const totalTiles = width * height;
    
    // 基本地形を草地で初期化
    const backgroundData = new Array(totalTiles).fill(1);
    const collisionData = new Array(totalTiles).fill(0);
    
    // 大陸の形状を作成（簡易版）
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            
            // 海域を外周と一部内陸に配置
            if (x < 5 || x >= width - 5 || y < 5 || y >= height - 5) {
                backgroundData[index] = 2; // 水域
                collisionData[index] = 1;  // 移動不可
            }
            
            // 山脈の配置
            if ((x >= 30 && x <= 35 && y >= 20 && y <= 80) ||
                (x >= 70 && x <= 75 && y >= 30 && y <= 70)) {
                backgroundData[index] = 3; // 山岳
                collisionData[index] = 1;  // 移動不可
            }
            
            // 砂漠地域
            if (x >= 50 && x <= 90 && y >= 80 && y <= 110) {
                backgroundData[index] = 4; // 砂漠
                collisionData[index] = 0;  // 移動可能
            }
            
            // 森林地域
            if (x >= 15 && x <= 25 && y >= 40 && y <= 60) {
                backgroundData[index] = 5; // 森
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
                id: 'king',
                name: 'ラルス王',
                x: 60,
                y: 60,
                sprite: 'king',
                dialogue: ['勇者よ、よくぞ来た！', '竜王を倒し、世界を救ってくれ！']
            },
            {
                id: 'princess',
                name: 'ローラ姫',
                x: 80,
                y: 40,
                sprite: 'princess',
                dialogue: ['勇者様...', '私を助けてくれるのですね？']
            }
        ],
        tileDefinitions: {
            0: { name: '空', walkable: true, sprite: 'empty', color: '#000000' },
            1: { name: '草地', walkable: true, sprite: 'grass', color: '#228B22' },
            2: { name: '水域', walkable: false, sprite: 'water', color: '#1E90FF' },
            3: { name: '山岳', walkable: false, sprite: 'mountain', color: '#8B4513' },
            4: { name: '砂漠', walkable: true, sprite: 'desert', color: '#F4A460' },
            5: { name: '森', walkable: true, sprite: 'forest', color: '#006400' }
        },
        playerStartPosition: {
            x: 60,
            y: 65
        },
        worldName: 'アレフガルド',
        description: 'ドラゴンクエスト1の世界・アレフガルド'
    };
}

// ブラウザ環境ではグローバルスコープで利用可能
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        createTestWorldMapData,
        createAlefgardMapData
    };
}

// ブラウザ環境での利用
if (typeof window !== 'undefined') {
    window.MapData = {
        createTestWorldMapData,
        createAlefgardMapData
    };
}