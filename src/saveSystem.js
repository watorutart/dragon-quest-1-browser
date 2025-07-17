/**
 * SaveSystem クラス - ゲームの保存・読み込み機能を管理
 */
class SaveSystem {
    constructor() {
        this.storageKey = 'dragonquest1_save';
        this.version = '1.0.0';
    }

    /**
     * ゲームデータを保存する
     * @param {Object} gameData - 保存するゲームデータ
     * @returns {Object} 保存結果 {success: boolean, error?: string}
     */
    save(gameData) {
        try {
            // データの検証
            const validationResult = this._validateGameData(gameData);
            if (!validationResult.valid) {
                return {
                    success: false,
                    error: validationResult.error
                };
            }

            // 保存用データの作成
            const saveData = {
                version: this.version,
                timestamp: new Date().toISOString(),
                gameData: this._serializeGameData(gameData)
            };

            // ローカルストレージに保存
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            } else {
                // Node.js環境での保存（テスト用）
                this._saveToFile(saveData);
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * ゲームデータを読み込む
     * @returns {Object} 読み込み結果 {success: boolean, data?: Object, error?: string}
     */
    load() {
        try {
            let rawData;

            // ローカルストレージから読み込み
            if (typeof localStorage !== 'undefined') {
                rawData = localStorage.getItem(this.storageKey);
                if (!rawData) {
                    // ローカルストレージにないがファイルにあるかもしれない
                    rawData = this._loadFromFile();
                }
            } else {
                // Node.js環境での読み込み（テスト用）
                rawData = this._loadFromFile();
            }

            if (!rawData) {
                return {
                    success: false,
                    error: 'No save data found'
                };
            }

            const saveData = JSON.parse(rawData);

            // バージョン互換性チェック
            if (saveData.version !== this.version) {
                return {
                    success: false,
                    error: `Save data version mismatch. Expected: ${this.version}, Found: ${saveData.version}`
                };
            }

            // データの復元
            const gameData = this._deserializeGameData(saveData.gameData);

            return {
                success: true,
                data: gameData,
                timestamp: saveData.timestamp
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 保存データが存在するかチェック
     * @returns {boolean} 保存データが存在する場合true
     */
    hasSaveData() {
        try {
            if (typeof localStorage !== 'undefined' && localStorage.getItem(this.storageKey) !== null) {
                return true;
            } else {
                return this._fileExists();
            }
        } catch (error) {
            return false;
        }
    }

    /**
     * 保存データを削除する
     * @returns {Object} 削除結果 {success: boolean, error?: string}
     */
    deleteSave() {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.storageKey);
            } else {
                this._deleteFile();
            }

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * ゲームデータを検証する
     * @private
     * @param {Object} gameData - 検証するゲームデータ
     * @returns {Object} 検証結果 {valid: boolean, error?: string}
     */
    _validateGameData(gameData) {
        if (!gameData || typeof gameData !== 'object') {
            return {
                valid: false,
                error: 'Invalid game data: must be an object'
            };
        }

        const requiredFields = ['player', 'gameState'];
        for (const field of requiredFields) {
            if (!gameData[field]) {
                return {
                    valid: false,
                    error: `Missing required field: ${field}`
                };
            }
        }

        // プレイヤーデータの検証
        const player = gameData.player;
        const playerRequiredFields = ['name', 'level', 'hp', 'experience', 'gold'];
        for (const field of playerRequiredFields) {
            if (player[field] === undefined) {
                return {
                    valid: false,
                    error: `Missing required player field: ${field}`
                };
            }
        }

        return { valid: true };
    }

    /**
     * ゲームデータをシリアライズする
     * @private
     * @param {Object} gameData - シリアライズするゲームデータ
     * @returns {Object} シリアライズされたデータ
     */
    _serializeGameData(gameData) {
        return {
            player: {
                name: gameData.player.name,
                level: gameData.player.level,
                hp: gameData.player.hp,
                maxHp: gameData.player.maxHp,
                mp: gameData.player.mp,
                maxMp: gameData.player.maxMp,
                attack: gameData.player.attack,
                defense: gameData.player.defense,
                experience: gameData.player.experience,
                gold: gameData.player.gold,
                x: gameData.player.x,
                y: gameData.player.y,
                weapon: gameData.player.weapon,
                armor: gameData.player.armor
            },
            gameState: {
                currentState: gameData.gameState.currentState || 'field',
                mapData: gameData.gameState.mapData || null,
                flags: gameData.gameState.flags || {},
                statistics: gameData.gameState.statistics || {}
            }
        };
    }

    /**
     * ゲームデータをデシリアライズする
     * @private
     * @param {Object} serializedData - デシリアライズするデータ
     * @returns {Object} デシリアライズされたゲームデータ
     */
    _deserializeGameData(serializedData) {
        return {
            player: serializedData.player,
            gameState: serializedData.gameState
        };
    }

    /**
     * ファイルに保存する（Node.js環境用）
     * @private
     * @param {Object} saveData - 保存するデータ
     */
    _saveToFile(saveData) {
        // テスト環境では実際のファイル操作は行わない
        if (!SaveSystem._globalMemoryStorage) {
            SaveSystem._globalMemoryStorage = {};
        }
        SaveSystem._globalMemoryStorage[this.storageKey] = JSON.stringify(saveData);
    }

    /**
     * ファイルから読み込む（Node.js環境用）
     * @private
     * @returns {string} 読み込んだデータ
     */
    _loadFromFile() {
        if (!SaveSystem._globalMemoryStorage) {
            return null;
        }
        return SaveSystem._globalMemoryStorage[this.storageKey] || null;
    }

    /**
     * ファイルが存在するかチェック（Node.js環境用）
     * @private
     * @returns {boolean} ファイルが存在する場合true
     */
    _fileExists() {
        return SaveSystem._globalMemoryStorage && SaveSystem._globalMemoryStorage[this.storageKey] !== undefined;
    }

    /**
     * ファイルを削除する（Node.js環境用）
     * @private
     */
    _deleteFile() {
        if (SaveSystem._globalMemoryStorage) {
            delete SaveSystem._globalMemoryStorage[this.storageKey];
        }
    }

    /**
     * 自動保存を実行する
     * @param {Object} gameData - 保存するゲームデータ
     * @param {number} interval - 自動保存間隔（ミリ秒）
     */
    startAutoSave(gameData, interval = 60000) {
        this.stopAutoSave();
        
        this.autoSaveInterval = setInterval(() => {
            this.save(gameData);
        }, interval);
    }

    /**
     * 自動保存を停止する
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }
}

// Node.js環境でのエクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SaveSystem;
}

// ブラウザ環境でのグローバル定義
if (typeof window !== 'undefined') {
    window.SaveSystem = SaveSystem;
}