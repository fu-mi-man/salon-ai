import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Server Component，Server Actions 用の Supabase クライアントを生成する
 * Cookie ストアを介してセッション管理を行う
 */
export async function createClient() {
  // Next.js の Cookie ストアを取得（将来の認証用）
  const cookieStore = await cookies();

  // Supabase の REST API クライアントを生成
  return createServerClient<Database>(
    // as string は Biome の noNonNullAssertion ルール対応（! の代わり）
    // NEXT_PUBLIC_* はビルド時に Next.js が埋め込むため，実行時に undefined にはならない
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
    {
      cookies: {
        // クライアントが Cookie を読む際に呼ばれる
        getAll() {
          return cookieStore.getAll();
        },
        // クライアントが Cookie を書く際に呼ばれる
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component からは Cookie を書き込めないが，Server Actions からは書ける
            // 両方の文脈で動くよう，エラーを握りつぶす（Supabase 公式推奨パターン）
          }
        },
      },
    },
  );
}
