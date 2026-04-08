## Supabase クライアント（Next.js）

Next.js App Router から Supabase にアクセスするためのサーバークライアントを設定する。  
Server Component・Server Actions からのDB操作に使用する。

> 公式ドキュメント: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

### 1. インストール

```bash
docker compose down
docker compose build web
docker compose run --rm web pnpm add @supabase/supabase-js @supabase/ssr
docker compose up --build -d
```

| パッケージ | 用途 |
|-----------|------|
| `@supabase/supabase-js` | Supabase クライアント本体 |
| `@supabase/ssr` | Next.js App Router 向けの SSR ユーティリティ |

### 2. 環境変数を確認

`web/.env.local` の `NEXT_PUBLIC_SUPABASE_URL` はコンテナ内から接続するため `host.docker.internal` を使う。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://host.docker.internal:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```

> `127.0.0.1` はコンテナ自身を指すため、ホストで動く Supabase には繋がらない。

### 3. サーバークライアントを作成

`src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {}
        },
      },
    },
  );
}
```

| 実装の選択 | 理由 |
|-----------|------|
| `createServerClient` のみ（`createBrowserClient` なし） | DBへの直接アクセスは Server Component のみ。フェーズ1は認証なしのため Client Component からのDB操作は不要 |
| `setAll` を `try/catch` で囲む | Server Component からは Cookie を書き込めないが、Server Actions からは書き込める。フェーズ1.5で認証を追加する際にそのまま使えるよう標準パターンに従っておく |
| `cookies()` を `await` する | Next.js 15 以降、`cookies()` は非同期 API |
| `!` の代わりに `as string` | Biome の `noNonNullAssertion` ルールに従う |
| `forEach` をブロック構文にする | Biome の `useIterableCallbackReturn` ルールに従う（コールバックが値を返してはいけない） |

### 4. 型生成

Supabase のスキーマから TypeScript 型を自動生成する。  
マイグレーションを実行した後に都度実行する。

```bash
supabase gen types typescript --local > web/src/lib/supabase/database.types.ts
```

> テーブル定義を変更したら再実行する。`database.types.ts` は自動生成ファイルのため手動編集しない。

### 5. 動作確認

Server Component から呼び出して疎通を確認する。

```ts
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("salons").select("*");
  console.log(data, error);
  return <div>確認完了</div>;
}
```

コンテナログに `[] null` が出ていれば成功。確認後はこのコードを削除する。
