import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * パスワード変更画面
 * 初回ログイン時の強制変更と任意変更の2状態を持つ（仕様は 03_change-password.md）
 * 初回は説明文を表示し，現在のパスワード欄とダッシュボードへ戻るリンクを出さない
 * Step 0 では静的UIのみで，保存・未認証リダイレクトは Step 2（#31・#32）で実装する
 */
export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string }>;
}) {
  // Step 0 の確認用に ?first=1 で初回状態へ切り替える。Step 2 で user_metadata の初回フラグ判定に置き換える
  const { first } = await searchParams;
  const isFirstLogin = first === "1";

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <div className="space-y-2 text-center">
        <h1 className="font-semibold text-2xl">パスワードの変更</h1>
        {isFirstLogin ? (
          <p className="text-muted-foreground text-sm">
            初期パスワードから新しいパスワードに変更してください
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        {isFirstLogin ? null : (
          <div className="space-y-2">
            <Label htmlFor="current-password">現在のパスワード</Label>
            <Input
              autoComplete="current-password"
              className="min-h-11"
              id="current-password"
              type="password"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="new-password">新しいパスワード</Label>
          <Input
            autoComplete="new-password"
            className="min-h-11"
            id="new-password"
            type="password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
          <Input
            autoComplete="new-password"
            className="min-h-11"
            id="confirm-password"
            type="password"
          />
        </div>
        {/* 保存の本実装は Step 2（#31）。ここでは見た目のみで押下しても何もしない */}
        <Button className="min-h-11 w-full hover:bg-primary/90" type="button">
          保存
        </Button>
      </div>

      {isFirstLogin ? null : (
        <p className="text-center">
          <Link
            className="text-muted-foreground text-sm underline underline-offset-4 hover:text-foreground"
            href="/dashboard"
          >
            ダッシュボードへ戻る
          </Link>
        </p>
      )}
    </main>
  );
}
