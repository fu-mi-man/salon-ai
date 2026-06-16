import { redirect } from "next/navigation";

/**
 * ルート（/）へのアクセスをダッシュボードへ転送する
 * フェーズ1では公開ランディングを持たず，認証後のダッシュボードを起点にする
 */
export default function Home() {
  redirect("/dashboard");
}
