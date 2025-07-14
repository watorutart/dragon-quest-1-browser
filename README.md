# Dragon Quest 1 - Browser Game

ドラゴンクエスト1のブラウザ版実装プロジェクトです。HTML5 CanvasとJavaScriptを使用してクラシックなJRPGを再現します。

## 🎮 プロジェクト概要

このプロジェクトは、1986年にエニックスから発売されたドラゴンクエスト1の核となるゲームプレイ要素をブラウザ上で再現することを目的としています。

### 主な機能

- ✅ **Player クラス** - キャラクターの基本ステータス管理
  - HP、攻撃力、防御力、経験値、ゴールドの管理
  - 位置管理機能（マップ上での移動）
  - レベルアップシステム（経験値による成長）

- 🚧 **予定機能**
  - マップシステム（フィールド探索）
  - 戦闘システム（ターンベースバトル）
  - NPCとの対話システム
  - アイテム・ショップシステム
  - 最終ボス戦とエンディング

## 🛠️ 技術スタック

- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **描画**: HTML5 Canvas API
- **テスト**: Jest
- **開発手法**: TDD (Test-Driven Development)

## 📁 プロジェクト構造

```
dragon-quest-1/
├── src/
│   ├── main.js          # メインゲームエンジン
│   └── player.js        # プレイヤークラス
├── tests/
│   ├── gameEngine.test.js
│   └── player.test.js
├── styles/
│   └── main.css
├── .kiro/
│   └── specs/           # 仕様書・設計書
└── index.html
```

## 🚀 セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd dragon-quest-1
```

2. 依存関係をインストール
```bash
npm install
```

3. テストを実行
```bash
npm test
```

4. ブラウザでゲームを起動
```bash
# index.htmlをブラウザで開く
open index.html
```

## 🧪 テスト

このプロジェクトはTDD（テスト駆動開発）で開発されています。

```bash
# 全テストを実行
npm test

# 特定のテストファイルを実行
npm test tests/player.test.js

# テストカバレッジを確認
npm run test:coverage
```

## 📋 開発進捗

- [x] プロジェクト基盤とテスト環境のセットアップ
- [x] Player クラスの TDD 実装
  - [x] 基本ステータス管理
  - [x] 位置管理機能
  - [x] レベルアップ機能
- [ ] Map システムの実装
- [ ] 移動システムの実装
- [ ] 戦闘システムの実装
- [ ] その他のゲーム機能

## 🎯 ゲーム仕様

詳細な仕様書は `.kiro/specs/dragon-quest-1/` ディレクトリに格納されています：

- `requirements.md` - 要件定義書
- `design.md` - 設計書
- `tasks.md` - 実装タスク一覧

## 🤝 コントリビューション

このプロジェクトは学習目的で作成されています。バグ報告や改善提案は歓迎します。

## 📄 ライセンス

このプロジェクトは学習・研究目的で作成されており、オリジナルのドラゴンクエストの著作権はスクウェア・エニックスに帰属します。