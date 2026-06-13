# Claude Code セットアップ

プラグイン・スキル・MCPサーバーの導入手順。
権限・プラグインは各開発者のグローバル設定（`~/.claude/`）に置き、全プロジェクトで共有する。
スキルと MCP は用途に応じて User（グローバル）か Project（`.mcp.json` などリポジトリに Git 共有）を選ぶ。

前提: Claude Codeがインストール済みであること。

## 1. プラグイン

リアルタイム型チェック・セキュリティ検出・コードレビューなどの機能を追加する。
グローバル（ユーザースコープ）にインストールすると `~/.claude/settings.json` に記録され、全プロジェクトで有効になる。

Claude Code上で以下を実行する。

```bash
/plugin install context7 --scope user
/plugin install security-guidance --scope user
/plugin install typescript-lsp --scope user
/plugin install code-review --scope user
```

| プラグイン | 用途 |
|---|---|
| `context7` | Next.js・Tailwind CSS・Supabase等の最新ドキュメントを参照 |
| `security-guidance` | XSS・SQLインジェクション等の脆弱性をコード編集時に自動検出 |
| `typescript-lsp` | リアルタイム型チェック。型エラーをコード編集直後に検出 |
| `code-review` | PRの自動コードレビュー。複数エージェントが並列でレビュー |

## 2. スキル

Claude Codeにベストプラクティスを教えるスキルファイル。
インストール時にスコープを選ぶ。全プロジェクトで使うなら User（`~/.claude/skills/`）、そのプロジェクト限定なら Project（`.claude/skills/`）。
ホスト（任意のディレクトリ）で実行する。

```bash
pnpm dlx skills add vercel-labs/agent-skills -a claude-code
pnpm dlx skills add vercel-labs/next-skills -a claude-code
pnpm dlx skills add anthropics/skills --skill frontend-design --skill skill-creator -a claude-code
```

インストール時の対話プロンプトでは以下を選択する。

| 項目 | 選択 |
|---|---|
| Installation scope | 用途に応じて User / Project |
| find-skills | Yes |

各コレクションで選択するスキル：

**vercel-labs/agent-skills**（4つを選択、`vercel-cli-with-tokens` / `vercel-react-native-skills` / `vercel-react-view-transitions` は除外）

| スキル | 用途 |
|---|---|
| `deploy-to-vercel` | Vercel へのデプロイ手順 |
| `vercel-composition-patterns` | Server/Client Component の構成パターン |
| `vercel-react-best-practices` | React ベストプラクティス |
| `web-design-guidelines` | Web デザインガイドライン |

**vercel-labs/next-skills**（2つを選択、`next-upgrade` は除外）

| スキル | 用途 |
|---|---|
| `next-best-practices` | RSC 境界・ファイル規約等の Next.js ベストプラクティス |
| `next-cache-components` | PPR・`use cache` 等の Next.js 15+ キャッシュ戦略 |

**anthropics/skills**（自動選択）

| スキル | 用途 |
|---|---|
| `frontend-design` | 高品質 UI デザイン生成 |
| `skill-creator` | スキル作成支援 |

動作確認する。

```bash
ls ~/.claude/skills/
```

各スキルのディレクトリが表示されれば完了。

Codex からも同じスキルを使えるよう、`~/.agents/skills` を `~/.claude/skills` への symlink にする。

```bash
mkdir -p ~/.agents
ln -s ../.claude/skills ~/.agents/skills
```

スキルのアップデートはホストで実行する。インストール時に選んだスコープに合わせる（グローバルに入れたなら `-g` を付ける）。

```bash
pnpm dlx skills update      # プロジェクトスコープのスキル
pnpm dlx skills update -g   # グローバル（User スコープ）のスキル
```

## 3. MCPサーバー

全プロジェクトで使う汎用MCP（ブラウザ操作の playwright など）はグローバル（ユーザースコープ）に登録する。

```bash
claude mcp add playwright -s user -- pnpm dlx @playwright/mcp@latest
```

特定プロジェクトでだけ使う場合や、「このプロジェクトでこのMCPを使う」という意図を残したい場合は、プロジェクトスコープで登録する。`.mcp.json` に記録されGit管理される。

```bash
claude mcp add playwright -s project -- pnpm dlx @playwright/mcp@latest
```

このリポジトリでは playwright をグローバルに常備しつつ、意図表明として `.mcp.json`（プロジェクトスコープ）も残している。
