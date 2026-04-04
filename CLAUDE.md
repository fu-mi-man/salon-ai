# CLAUDE.md

このファイルはClaude Codeがリポジトリで作業する際に自動的に読み込む指示書である。  
開発方針・ディレクトリ構成の詳細は `docs/90_wiki/dev-guide.md` を参照。


## リポジトリ構成

```
salon-ai/
├── web/    # Next.js アプリ
├── gas/    # Google Apps Script（clasp管理）
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

# gas/ での作業はホストで実行する
cd gas && clasp push
```


## コーディング規約

- `components/ui/` はshadcn/ui専用。自作コンポーネントは置かない
- 機能固有のコンポーネント → `components/features/`
- Server Componentをデフォルトとし、`'use client'` は必要な場合のみ明示する
- DBへの直接アクセスはServer Componentで行う
- Client Componentからの更新はServer Actionsを優先する
- バリデーションはZodでサーバーサイド検証する


## 重要な設計判断（変更前に必ず確認）

- **HPBへの自動投稿は実装しない**（利用規約【2】違反のため）
- **口コミ本文・投稿者情報はフェーズ1では保存しない**（個人情報リスク回避）
- **GASからSupabaseへの書き込みはNext.jsを経由しない**（Supabase REST APIを直接叩く）
- **フェーズ1は認証なし**（フェーズ1.5でSupabase Authを追加する）
- **Supabaseクライアントをそのまま使う**（DrizzleやPrismaは導入しない）
