# Design Document

## Overview

ドラゴンクエスト1は、HTML5 CanvasとJavaScriptを使用したブラウザベースの2D RPGゲームとして実装します。ゲームは複数の状態（フィールド探索、戦闘、メニュー、対話）を持つ状態機械として設計し、各状態で異なるゲームロジックを実行します。

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Game Engine   │    │  State Manager  │    │  Render Engine  │
│                 │◄──►│                 │◄──►│                 │
│ - Game Loop     │    │ - Field State   │    │ - Canvas        │
│ - Input Handler │    │ - Battle State  │    │ - Sprite Render │
│ - Asset Loader  │    │ - Menu State    │    │ - UI Render     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Data Manager   │    │  Game Systems   │    │  Audio Manager  │
│                 │    │                 │    │                 │
│ - Player Data   │    │ - Combat System │    │ - Sound Effects │
│ - Map Data      │    │ - Level System  │    │ - Background    │
│ - Monster Data  │    │ - Shop System   │    │   Music         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

1. **GameEngine**: メインゲームループとシステム統合
2. **StateManager**: ゲーム状態の管理と遷移
3. **RenderEngine**: 画面描画とUI表示
4. **DataManager**: ゲームデータの管理と永続化
5. **GameSystems**: 戦闘、レベルアップ、ショップなどのロジック

## Components and Interfaces

### GameEngine Interface
```javascript
class GameEngine {
  constructor(canvasId)
  init()
  start()
  update(deltaTime)
  render()
  handleInput(inputEvent)
}
```

### StateManager Interface
```javascript
class StateManager {
  constructor()
  setState(newState)
  getCurrentState()
  update(deltaTime)
  render(renderer)
  handleInput(inputEvent)
}

// Game States
class FieldState extends GameState
class BattleState extends GameState  
class MenuState extends GameState
class DialogState extends GameState
```

### Player Interface
```javascript
class Player {
  constructor()
  // Stats
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  experience: number
  gold: number
  
  // Position
  x: number
  y: number
  
  // Equipment
  weapon: Item
  armor: Item
  
  // Methods
  move(direction)
  takeDamage(amount)
  gainExperience(amount)
  levelUp()
  equipItem(item)
}
```

### Combat System Interface
```javascript
class CombatSystem {
  constructor(player, monster)
  startBattle()
  playerAttack()
  monsterAttack()
  calculateDamage(attacker, defender)
  checkBattleEnd()
  endBattle(result)
}
```

## Data Models

### Player Data Model
```javascript
const PlayerData = {
  level: 1,
  hp: 15,
  maxHp: 15,
  attack: 4,
  defense: 2,
  experience: 0,
  gold: 120,
  x: 10,
  y: 10,
  weapon: null,
  armor: null
}
```

### Monster Data Model
```javascript
const MonsterData = {
  name: "スライム",
  hp: 3,
  maxHp: 3,
  attack: 2,
  defense: 1,
  experience: 1,
  gold: 2,
  sprite: "slime.png"
}
```

### Map Data Model
```javascript
const MapData = {
  width: 120,
  height: 120,
  tileSize: 16,
  layers: [
    {
      name: "background",
      data: [...] // Tile IDs
    },
    {
      name: "collision",
      data: [...] // Collision flags
    }
  ],
  npcs: [
    {
      id: "king",
      x: 11,
      y: 11,
      dialog: ["勇者よ、竜王を倒してくれ！"]
    }
  ]
}
```

### Item Data Model
```javascript
const ItemData = {
  id: "copper_sword",
  name: "どうのつるぎ",
  type: "weapon",
  attack: 2,
  defense: 0,
  price: 180,
  description: "銅でできた剣"
}
```

## Error Handling

### Input Validation
- プレイヤーの移動は境界チェックとコリジョン検出を実行
- 戦闘コマンドは有効な選択肢のみ受け付け
- アイテム購入は所持金チェックを実行

### Game State Errors
- 無効な状態遷移を防ぐためのガード条件
- セーブデータの破損に対する復旧機能
- 予期しないエラーに対するゲーム継続機能

### Resource Loading Errors
- 画像やオーディオファイルの読み込み失敗時の代替処理
- ネットワークエラー時のローカルキャッシュ利用
- 必須リソースの読み込み完了確認

## Testing Strategy

### Unit Testing
- **Player Class**: ステータス計算、レベルアップロジック、装備効果
- **Combat System**: ダメージ計算、戦闘結果判定、経験値計算
- **Map System**: コリジョン検出、移動可能性判定、NPCとの相互作用
- **Item System**: アイテム効果、購入ロジック、装備変更

### Integration Testing
- **State Transitions**: フィールド↔戦闘↔メニュー間の状態遷移
- **Save/Load System**: ゲームデータの保存と復元
- **Event System**: NPCとの対話、ショップでの購入、レベルアップ

### End-to-End Testing
- **Complete Gameplay Flow**: ゲーム開始から竜王撃破まで
- **Edge Cases**: レベル1での最強装備、ゴールド0での購入試行
- **Performance Testing**: 長時間プレイでのメモリリーク検証

### Manual Testing
- **User Experience**: 操作性、UI/UXの直感性
- **Balance Testing**: 戦闘難易度、経験値バランス
- **Browser Compatibility**: 主要ブラウザでの動作確認