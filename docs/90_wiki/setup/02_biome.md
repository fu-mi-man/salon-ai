## Biome

Rust製のリンター + フォーマッター。  
ESLint + Prettierを1ツールで代替する。

> 公式ドキュメント: https://biomejs.dev/guides/getting-started/

### 1. インストール

```bash
docker compose down
docker compose run --rm web pnpm add -D --save-exact @biomejs/biome
docker compose up --build -d
```

`--save-exact` でバージョンを完全固定する（`"^2.0.6"` ではなく `"2.0.6"`）。Biome公式推奨。  
パッケージ管理の詳細は `dev-guide.md` のパッケージ管理セクションを参照。

### 2. 設定ファイルを作成

```bash
docker compose exec web pnpm biome init --jsonc
```

`web/biome.jsonc` が生成される（`--jsonc` でコメント付きJSON形式）。  
`.git` を検知して `.gitignore` 連携（`vcs`）も自動で設定される。

以下の内容に編集する:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.10/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "nursery": {
        "useSortedClasses": "warn"
      }
    }
  },
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on",
        "useSortedAttributes": {
          "level": "on",
          "options": {
            "sortOrder": "natural"
          }
        }
      }
    }
  },
  "overrides": [
    {
      "includes": ["src/components/ui/**"],
      "linter": { "enabled": false },
      "formatter": { "enabled": false },
      "assist": { "enabled": false }
    }
  ]
}
```

| 設定 | 値 | 理由 |
|------|-----|------|
| `vcs.useIgnoreFile` | `true` | `.gitignore` の内容を lint・format 対象外にする |
| `formatter.indentStyle` | `"space"` | Next.jsのデフォルトに合わせる |
| `formatter.lineWidth` | `100` | デフォルト（80）より少し広め |
| `css.tailwindDirectives` | `true` | `@theme` 等のTailwind v4構文を認識させる |
| `javascript.formatter.quoteStyle` | `"double"` | JSXとの統一性を保つ |
| `assist.organizeImports` | `"on"` | import文を自動で並び替え |
| `assist.useSortedAttributes` | `"on"` / `sortOrder: "natural"` | JSX属性をアルファベット順（自然順）に自動ソート。`natural` は数値を考慮した並び（opt1, opt2, opt11）、`lexicographic` は辞書順（opt1, opt11, opt2） |
| `nursery.useSortedClasses` | `"warn"` | TailwindCSSクラス名を公式推奨順（レイアウト → サイズ → 余白 → 装飾 → テキスト）に自動ソート。Prettierの `prettier-plugin-tailwindcss` と同じソート順。ソート順は1種類のみでカスタマイズ不可 |
| `overrides` (ui/) | linter・formatter・assist を無効化 | shadcn/ui CLIで自動生成されるファイルにはチェックを適用しない |

> **nursery について**  
Biomeの実験段階ルールカテゴリ。  
Biomeチームが分類を決め，安定したら `recommended` 等に昇格する。  
バージョンアップで挙動が変わる可能性があるため `"warn"` が無難（`"error"` にすると `pnpm lint` が失敗する，`"off"` で無効化）。  
安定版に昇格したら `"error"` への変更を検討する。  

### 3. package.json にスクリプトを追加

`pnpm add` は `devDependencies` を自動更新するが，`scripts` は自動では追加されない。
手動で追記する。

```jsonc
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --write --unsafe .",
    "format": "biome format --write ."
  }
}
```

| ショートカット | 正規コマンド | ファイル変更 | 用途 |
|---------|---------|:----------:|------|
| `pnpm lint` | `biome check .` | しない | CI・pre-commit |
| `pnpm lint:fix` | `biome check --write --unsafe .` | する | 開発中 |
| `pnpm format` | `biome format --write .` | する | インデント・改行だけ直したいとき |

> **`--unsafe` フラグについて**  
nursery（実験段階）ルールの自動修正には `--unsafe` が必要。  
`lint:fix` に組み込み済みのため，普段は `pnpm lint:fix` だけでクラスソート等も自動修正される。  

### 4. 既存コードを一括整形

```bash
docker compose exec web pnpm lint:fix
```

### 5. 動作確認

```bash
docker compose exec web pnpm lint
```

エラーが出なければ完了。
