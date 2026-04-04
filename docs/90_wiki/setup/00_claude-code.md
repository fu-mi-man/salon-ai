# Claude Code セットアップ

プラグイン・スキル・MCPサーバーの導入手順。  
いずれもプロジェクトスコープで管理し、Git経由でチームに共有される。  
cloneした時点で使用可能な状態になる。  

前提: Claude Codeがインストール済みであること。

## 1. プラグイン

リアルタイム型チェック・セキュリティ検出・コードレビューなどの機能を追加する。  
インストールするとプロジェクトの `.claude/settings.json` に記録されGit管理される。  

Claude Code上で以下を実行する。  

```
/plugin install context7 --scope project
/plugin install security-guidance --scope project
/plugin install typescript-lsp --scope project
/plugin install code-review --scope project
```

| プラグイン | 用途 |
|---|---|
| `context7` | Next.js・Tailwind CSS・Supabase等の最新ドキュメントを参照 |
| `security-guidance` | XSS・SQLインジェクション等の脆弱性をコード編集時に自動検出 |
| `typescript-lsp` | リアルタイム型チェック。型エラーをコード編集直後に検出 |
| `code-review` | PRの自動コードレビュー。複数エージェントが並列でレビュー |

## 2. スキル

Claude Codeにベストプラクティスを教えるスキルファイル。
`.claude/skills/` にインストールされGit管理される。
ホスト（プロジェクトルート）で実行する。

```bash
pnpm dlx skills add vercel-labs/agent-skills -a claude-code
pnpm dlx skills add vercel-labs/next-skills -a claude-code
pnpm dlx skills add anthropics/skills --skill frontend-design --skill skill-creator -a claude-code
```

インストール時の対話プロンプトでは以下を選択する。

| 項目 | 選択 |
|---|---|
| Installation scope | Project |
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
ls .claude/skills/
```

各スキルのディレクトリが表示されれば完了。

スキルのアップデートはホストで実行する。

```bash
pnpm dlx skills update
```

## 3. MCPサーバー

```bash
claude mcp add playwright -s project -- pnpm dlx @playwright/mcp@latest
```

`-s project` でプロジェクトスコープに登録される。`.mcp.json` に記録されGit管理される。  
既に `.mcp.json` が存在する場合（clone時など）は実行不要。
