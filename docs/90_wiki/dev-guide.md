# 開発ガイド

本ドキュメントはプロジェクトの開発方針・ディレクトリ構成・各ファイルの立ち位置をまとめた資料である。


## ドキュメント管理方針

- **詳細仕様はコードのコメントに書く。** ソースを修正したときに仕様書もズレるコストを避けるため
- `docs/` には「コードだけでは伝わらない設計判断の理由」と「要件・調査内容」を書く
- ソースコードが正であり、ドキュメントはその補足である


## ディレクトリ構成

```
docs/
├── 01_requirements/            # 要件定義
│   ├── 01_overview.md          # プロダクト概要（What/Why/Who/How/ビジネスモデル）
│   ├── 03_data.md              # データモデル・テーブル設計
│   ├── 04_non-functional.md    # 非機能要件（性能・セキュリティ等）
│   └── 99_backlog.md           # バックログ（MVP以降の機能候補）
│
├── 02_specification/           # 設計判断の理由・実装上の注意
│   ├── screens/                # 画面ごとの実装上の注意
│   │   └── 01_dashboard.md     # ダッシュボード画面仕様
│   └── integrations/           # 外部連携の仕様
│       ├── gas.md              # GASスクリプト仕様
│       └── gemini.md           # プロンプト設計
│
├── 90_wiki/                    # 開発者向けガイド・セットアップ手順
│   ├── dev-guide.md            # 本ドキュメント
│   ├── testing.md              # テスト戦略・書き方・運用方針
│   └── setup/                  # 環境構築手順
│       ├── 00_claude-code.md   # Claude Codeのプラグイン・スキル・MCP設定
│       ├── 01_initial.md       # プロジェクト初期構築手順
│       └── 02_biome.md         # Biome（リンター・フォーマッター）導入手順
│
└── 99_research/                # 調査・リサーチ
    ├── technology/             # 技術調査
    │   ├── stack.md            # 技術構成と選定理由
    │   ├── architecture.md     # システム構成図・シーケンス図
    │   └── hpb-constraints.md  # HPBの制約・自動化検討
    └── business/               # ビジネス調査
        └── competitors.md      # 競合調査
```


## 各ディレクトリの立ち位置

### `01_requirements/`

**何を作るかを定義する場所。**

`01_overview.md` はプロダクトの全体像を把握するための入口。新しいメンバーが加わったときや、「そもそもこのシステムは何のためにあるのか」を確認したいときはここを読む。

`03_data.md` はテーブル設計の唯一の正。スキーマを変更する際は必ずここも更新する。

`99_backlog.md` はMVP以降の機能候補を置く場所。番号を99にしているのは常に末尾に位置させるため。

### `02_specification/`

**どう作るかの設計判断を書く場所。**

詳細な実装仕様はコードのコメントに書く方針のため、ここには「なぜこの設計にしたか」という判断理由を書く。実装が固まっていない段階では空でいい。

`integrations/` は外部サービスとの連携仕様。特にGASはNext.jsと切り離されているため、実装前に仕様を決めておく必要がある。

### `99_research/`

**調査内容を残す場所。**

技術選定の根拠・競合調査・HPBの制約調査など、意思決定の背景となった情報を保存する。後から「なぜこの技術を選んだのか」を確認できるようにする。


## パッケージ管理

### パッケージの追加・更新手順

```bash
docker compose down                                          # コンテナ削除（古い anonymous volume は孤立状態になる）
docker compose build web                                    # 最新の Dockerfile / pnpm 設定を反映
docker compose run --rm web pnpm add <package>             # 依存追加
docker compose run --rm web pnpm add -D <package>          # 開発依存追加
docker compose up --build -d                               # イメージ再ビルド＋起動（新しい anonymous volume が生成される）
```

`docker volume prune` は常用手順ではない。`ERR_PNPM_UNEXPECTED_STORE` や壊れた `node_modules` volume が残っているときだけ実行する。

**なぜこの手順が必要か？**

- `docker compose exec` でコンテナに入って `pnpm add` すると、dev サーバーが `package.json` の変更を検知してクラッシュする。`docker compose run` は CMD（dev サーバー）を実行せずに指定コマンドだけ実行するため安全
- `docker compose run` の前に `docker compose build web` を入れることで、Dockerfile の pnpm 設定変更を実行用コンテナにも反映できる
- `run` で更新された `node_modules` は一時コンテナ内のみ。実行中コンテナの anonymous volume には反映されないため、`--build` でイメージを再構築し、新しい anonymous volume に初期化し直す必要がある
- pnpm はシンボリンクベースの `node_modules` 構造を採用しているため named volume との相性が悪く、anonymous volume を使う必要がある（[pnpm/pnpm#2720](https://github.com/pnpm/pnpm/issues/2720)）
- pnpm は `store` と `node_modules` を組み合わせて使う。`node_modules` がどの `store` を参照して作られたかがズレると `ERR_PNPM_UNEXPECTED_STORE` が発生する

**node_modules が壊れた場合（クラッシュ後など）**

dev サーバーのクラッシュ時に anonymous volume 内の `node_modules` が破損した状態で残ることがある。再起動しても復旧しない場合は volume を手動で削除する。

```bash
docker inspect salon-ai-web -f '{{range .Mounts}}{{.Name}} {{end}}'  # 紐づく anonymous volume ID を確認
docker compose down                                                   # コンテナ削除
docker volume rm <上で確認したID>                                      # 破損した volume を削除
docker compose up --build -d                                          # 再ビルド＋起動
```

孤立した anonymous volume が残り続ける場合は `docker volume prune` で削除できるが、`ERR_PNPM_UNEXPECTED_STORE` や壊れた `node_modules` volume が残っているときだけ実行すること（常用しない）。


## 開発の進め方

### フェーズ1（友人の美容室・1サロン）

認証なし・1サロン固定でシンプルに動くものを作ることを最優先にする。設計の綺麗さより動くことを優先する。

### コードとドキュメントの関係

- テーブル設計を変更したら `03_data.md` を更新する
- 技術スタックを変更したら `stack.md` を更新する
- 実装の詳細はコードのコメントに書き、ここには書かない
