# AGENT.md

このファイルは、このリポジトリで作業するAIエージェント向けの最小ガイドである。  
目的は、初回読込時の迷いを減らし、正本と参照順序を固定すること。

## 先に読むもの

作業開始時は以下の順で確認する。

1. `AGENT.md`
2. `CLAUDE.md`
3. `docs/90_wiki/dev-guide.md`
4. 変更対象に対応する仕様・セットアップ文書

例:

- 環境構築: `docs/90_wiki/setup/`
- 外部連携: `docs/02_specification/integrations/`
- 要件確認: `docs/01_requirements/`

## 正本

- 開発用ツールのバージョン正本は `mise.toml`
- 詳細な環境構築手順の正本は `docs/90_wiki/setup/`
- 日常的な開発ルールの正本は `CLAUDE.md` と `docs/90_wiki/dev-guide.md`
- README は概要と入口を担う。詳細手順を肥大化させない

`README.md` と `docs/90_wiki/setup/` の記述が衝突した場合、セットアップ手順は `docs/90_wiki/setup/` と `mise.toml` を優先する。

## このプロジェクトの前提

- `web/` は Next.js アプリ
- `web/` の開発・検証は Docker コンテナ内で行う
- パッケージマネージャーは `pnpm`

## セットアップ文書の扱い

- 新しいセットアップ手順は、まず `docs/90_wiki/setup/` に追加する
- README には要点だけを書く
- Node.js や `pnpm` の導入方法を更新する場合、まず `mise.toml` と整合しているか確認する
- バージョン番号を文章に直接書く場合は `mise.toml` と一致させる

## 外部公式ドキュメントの優先順位

外部ツールの仕様や推奨手順が絡む場合、以下の公式ドキュメントを優先する。

- `mise`: https://mise.jdx.dev/
- `pnpm`: https://pnpm.io/
- `Next.js`: https://nextjs.org/docs
- `Supabase CLI`: https://supabase.com/docs/reference/cli

補足:

- `mise use` はツールのインストールと `mise.toml` への追記を同時に行う
- `mise install` は `mise.toml` に書かれたツールをインストールする

## 作業時の判断ルール

- 既存ドキュメントが複数ある場合、まず正本を特定してから編集する
- セットアップ変更は、コード変更より先にドキュメント配置の責務を確認する
- 仕様不明点は推測で README を膨らませず、該当 wiki/仕様書に寄せる
- 外部ツールの最新仕様が怪しい場合は、公式ドキュメントで確認する

## 変更前チェック

以下の設計判断は `CLAUDE.md` を確認すること。

- HPBへの自動投稿は実装しない
- 口コミ本文・投稿者情報はフェーズ1では保存しない
- フェーズ1からSupabase Authを導入する（email/password・1サロン1アカウント）
- Supabaseクライアントをそのまま使う
