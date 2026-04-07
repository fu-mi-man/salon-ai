# テスト方針

本ドキュメントは，本プロジェクトのテスト戦略・テストの書き方・運用方針をまとめたものである。

## テスト戦略

### テスト種別と役割

| 種別 | ツール | 対象 | 配置 |
|------|--------|------|------|
| 単体テスト | Vitest | ユーティリティ関数，変換処理，純粋関数 | ソース横 (`*.test.ts`) |
| 統合テスト | Vitest | 複数関数をまたぐロジック，外部I/Oを伴う処理 | 必要に応じて `src/` 配下または `tests/` |
| E2E テスト | Playwright | 画面操作・ページ遷移 | `tests/e2e/` |

### 優先順位

高
- 1. 条件分岐の多い純粋関数
- 2. フォーマット変換や集計ロジック
- 3. バリデーションや境界値判定

低
- 4. UI コンポーネント
- 5. Next.js のルーティングやフレームワーク既定動作

テスト不要
- Next.js の内部動作
- ライブラリ自体が保証する挙動
- 自明な 1 行関数

## テストの書き方

### 基本構造

```ts
import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("日付文字列を YYYY-MM-DD 形式で返す", () => {
    expect(formatDate(new Date("2026-04-07"))).toBe("2026-04-07");
  });
});
```

### テスト説明文の書き方

`it()` の説明文はそのまま仕様として読める文章にする。

```ts
it("タイトルが空のとき，バリデーションエラーになる");
it("売上が 0 のとき，0 を返す");

// 避ける
it("validation");
it("test 1");
```

### `it.each` の使い方

同じパターンで入力だけ違うケースが 3 件以上あるときは `it.each` でまとめる。  
成功ケースと失敗ケースは分ける。

```ts
it.each([
  ["通常日付", "2026-04-07"],
  ["うるう年", "2024-02-29"],
])("%s のとき，成功する", (_, value) => {
  expect(isValidDate(value)).toBe(true);
});

it.each([
  ["スラッシュ区切り", "2026/04/07"],
  ["不正文字列", "abc"],
])("%s のとき，失敗する", (_, value) => {
  expect(isValidDate(value)).toBe(false);
});
```

### 1 テスト 1 関心

`it` の中に複数の関心事を詰め込みすぎない。別の仕様なら分割する。

### Red-Green サイクル

1. 先に失敗するテストを書く
2. 実装してテストを通す
3. リファクタリングする

## ファイル配置

単体テストはソースファイルの横に置くコロケーションを基本とする。

```text
web/
└── src/
    └── app/
        └── dashboard/
            ├── summary.ts
            └── summary.test.ts
```

`vitest.config.ts` の `include` は `src/**/*.test.{ts,tsx}` なので，`src/` 配下のテストは自動検出される。

`tests/` を使うのは次のような場合に限る。

- ソース横に置くと見通しが悪くなる
- 複数モジュールをまたぐ統合テストを書く
- Playwright の E2E テストを分離したい

## コマンド

```bash
docker compose exec web pnpm test --run    # 1 回実行
docker compose exec web pnpm test          # ウォッチモード
```

E2E を導入する場合は Playwright 用のコマンドを別途追加する。

## 参考

- Vitest セットアップ: [setup/03_vitest.md](setup/03_vitest.md)
