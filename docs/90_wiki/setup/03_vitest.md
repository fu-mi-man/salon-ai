## Vitest

Vite系の高速なテストランナー。  
TypeScript・ESModulesとの相性が良く，Jestより設定がシンプル。

> 公式ドキュメント: https://vitest.dev/guide/

### 1. インストール

`docker compose run` を使う理由は `../dev-guide.md` のパッケージ管理を参照。

```bash
docker compose down
docker compose build web
docker compose run --rm web pnpm add -D vitest
docker compose up --build -d
```

> `ERR_PNPM_UNEXPECTED_STORE` が出る場合だけ `docker volume prune` または `/app/node_modules` の anonymous volume 削除を行う。常用はしない。

| パッケージ | 用途 |
|-----------|------|
| `vitest` | テストランナー本体 |

> このプロジェクトは Next.js ベースなので，初期セットアップでは `@vitejs/plugin-react` は不要。  
Testing Library（`@testing-library/react`, `@testing-library/jest-dom`, `jsdom`）はコンポーネントテストの段階で追加する。

### 2. vitest.config.ts を作成

`web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
```

| 設定 | 値 | 理由 |
|------|-----|------|
| `resolve.alias` | `@ → src/` | `tsconfig.json` の `@/*` と揃える |
| `test.include` | `src/` 配下 | App Router 配下も含めてコロケーション前提に寄せる |
| `test.environment` | `"node"` | ユニット・統合テストのデフォルト。コンポーネントテスト時はファイル先頭に `// @vitest-environment jsdom` を指定 |

### 3. package.json にスクリプトを追加

```jsonc
{
  "scripts": {
    "test": "vitest",
    "typecheck": "tsc --noEmit"
  }
}
```

| コマンド | 実行内容 | 用途 |
|---------|---------|------|
| `pnpm test` | ウォッチモードでテスト実行 | 開発中 |
| `pnpm exec vitest run` | テストを1回実行して終了 | CI・pre-commit |
| `pnpm typecheck` | TypeScriptの型チェック | CI・pre-commit |

### 4. 動作確認

動作確認用のテストファイルを `src/` 内の任意の場所に作成して実行する。確認後は削除してよい。

`src/app/sample.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("sample", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });
});
```

```bash
docker compose exec web pnpm test --run
```

テストがパスすれば完了。確認後にファイルを削除する。

テスト配置方針やテストの書き方は [../testing.md](/Users/fumi/dev/salon-ai/docs/90_wiki/testing.md) を参照。
