# salon-ai

ホットペッパービューティー（HPB）の口コミ返信・ブログ投稿をAIで支援するWebアプリ。

## 概要

- **口コミ返信生成**（フェーズ1）: サロンボードの口コミ通知メールをGASが自動検知し、AIが返信文を生成。オーナーが確認・編集してコピペするだけで投稿できる
- **ブログ投稿支援**（フェーズ2）: ヘアスタイル写真をアップロードするとAIがブログ原稿を生成

詳細は `docs/01_requirements/01_overview.md` を参照。

## 技術スタック

| | |
|---|---|
| フロントエンド | Next.js（App Router）/ Vercel |
| DB・認証 | Supabase |
| AI | Gemini API（Gemini 2.0 Flash） |
| メール監視 | Google Apps Script（clasp） |
| ストレージ | Cloudflare R2（フェーズ2〜） |

## リポジトリ構成

```
salon-ai/
├── web/          # Next.js アプリ
│   ├── src/
│   │   ├── app/          # App Router
│   │   ├── components/
│   │   │   ├── features/ # 機能固有コンポーネント
│   │   │   └── ui/       # shadcn/ui
│   │   └── lib/
│   └── ...
├── gas/          # Google Apps Script
│   ├── src/
│   │   └── main.ts       # メール監視・AI生成・DB保存
│   ├── .clasp.json
│   └── appsscript.json
├── docs/         # ドキュメント
└── CLAUDE.md     # Claude Code指示書
```

## セットアップ

### 必要なもの

- mise
- Node.js 24
- pnpm 10.33.0
- Docker
- Google アカウント（GAS用）
- Supabase アカウント
- Google AI Studio APIキー（Gemini）

### 開発ツールのセットアップ

プロジェクトルートで `mise.toml` に定義されたツールをインストールする。

```bash
mise install
```

### web/ のセットアップ

```bash
cd web
cp .env.example .env.local
# .env.local に各種APIキーを設定

docker compose up --build
```

### gas/ のセットアップ

```bash
cd gas
pnpm install
pnpm exec clasp login
pnpm exec clasp create --type standalone --title "salon-ai-gas"
# .clasp.json が生成される

pnpm exec clasp push
```

詳細は `docs/90_wiki/setup/` を参照。

## ドキュメント

| ドキュメント | 内容 |
|---|---|
| `docs/01_requirements/01_overview.md` | プロダクト概要 |
| `docs/01_requirements/03_data.md` | テーブル設計 |
| `docs/99_research/technology/stack.md` | 技術構成と選定理由 |
| `docs/99_research/technology/hpb-constraints.md` | HPBの制約・規約 |
| `docs/90_wiki/dev-guide.md` | 開発ガイド |
| `docs/02_specification/integrations/gas.md` | GAS詳細設計 |
