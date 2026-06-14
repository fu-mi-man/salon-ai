# AGENTS.md

このファイルはCodexがリポジトリで作業する際に自動的に読み込むプロジェクト指示書である。  
Claude Code向けの自動読込ファイルは `CLAUDE.md` とする。共通ルールは2ファイルで矛盾させない。

## 先に読むもの

作業開始時は以下の順で確認する。

1. `AGENTS.md`
2. `docs/90_wiki/dev-guide.md`
3. 変更対象に対応する仕様・セットアップ文書
4. 進捗確認やTODO整理が目的の場合は `docs/90_wiki/roadmap.md`（戦略）と `docs/00_issues/README.md`（実行トラッカー）

## 作業再開時のプロトコル

IMPORTANT: フェーズ1の実装に着手する前は、毎回まず `docs/00_issues/README.md` 冒頭の「再開時 同期チェック」を実行する。トラッカーと現実（roadmap・仕様・GitHub・コード）にズレがあれば、トラッカーまたは該当ドキュメントを先に直してから実装に入る。

- 実装1件（1 issue）が完了するたびに、`docs/00_issues/README.md` の「状態」列を更新し、対応する GitHub issue を閉じる。
- このプロジェクトは数ヶ月空くことがある。ズレ前提でチェックしてから動く。

例:

- 画面実装: `docs/02_specification/screens/`
- 外部連携: `docs/02_specification/integrations/`
- データモデル: `docs/01_requirements/03_data.md`
- 環境構築: `docs/90_wiki/setup/`

## 正本

- 開発用ツールのバージョン正本は `mise.toml`
- 詳細な環境構築手順の正本は `docs/90_wiki/setup/`
- 日常的な開発ルールの正本は `AGENTS.md` と `docs/90_wiki/dev-guide.md`
- 進捗管理の正本は，戦略が `docs/90_wiki/roadmap.md`，実行詳細（issue一覧・受け入れ基準・進捗）が `docs/00_issues/README.md`
- README は概要と入口を担う。詳細手順を肥大化させない

`README.md` と `docs/90_wiki/setup/` の記述が衝突した場合、セットアップ手順は `docs/90_wiki/setup/` と `mise.toml` を優先する。

## リポジトリ構成

```text
salon-ai/
├── web/    # Next.js アプリ
└── docs/   # ドキュメント
```

## コマンド

```bash
# web/ での作業はDockerコンテナ内で実行する
docker compose up
docker compose exec web pnpm dev

# 検証（コード変更後は必ず実行する）
docker compose exec web pnpm typecheck
docker compose exec web pnpm lint
docker compose exec web pnpm test
```

## コーディング規約

- `components/ui/` はshadcn/ui専用。自作コンポーネントは置かない
- 機能固有のコンポーネントは `components/features/` に置く
- Server Componentをデフォルトとし、`'use client'` は必要な場合のみ明示する
- DBへの直接アクセスはServer Componentで行う
- Client Componentからの更新はServer Actionsを優先する
- バリデーションはZodでサーバーサイド検証する
- 実装詳細はコードコメント、設計判断の理由は `docs/` に残す

## 作業時の判断ルール

- 既存ドキュメントが複数ある場合、まず正本を特定してから編集する
- セットアップ変更は、コード変更より先にドキュメント配置の責務を確認する
- 仕様不明点は推測でREADMEを膨らませず、該当wiki/仕様書に寄せる
- 外部ツールの最新仕様が怪しい場合は、公式ドキュメントを優先して確認する
- コード変更後は `typecheck`、`lint`、`test` を実行する

## 重要な設計判断（変更前に必ず確認）

- **HPBへの自動投稿は実装しない**（利用規約【2】違反のため）
- **口コミ本文・投稿者情報はフェーズ1では保存しない**（個人情報リスク回避）
- **フェーズ1からSupabase Authを導入する**（email/password・owner / staff の個別ログイン・1サロン内に複数アカウント可）
- **Supabaseクライアントをそのまま使う**（DrizzleやPrismaは導入しない）
