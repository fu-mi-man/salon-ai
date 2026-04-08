# TypeScript

## JSDoc

エクスポートされた関数・クラス・型には必ず JSDoc を付ける。

```ts
/**
 * Server Component / Server Actions 用の Supabase クライアントを生成する。
 */
export async function createClient() { ... }
```

- 説明は日本語で書く
- `@param` / `@returns` は型から自明でない場合のみ付ける（型で分かる場合は不要）
- エクスポートされていない内部関数は不要（ただし非自明なロジックがある場合は付ける）
- 自動生成ファイル（`database.types.ts` 等）は編集しない
