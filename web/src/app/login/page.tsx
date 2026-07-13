import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * ログイン画面
 * owner が発行済みのログインIDとパスワードでログインする（メールアドレスは扱わない）
 * Step 0 では静的UIのみで，認証・バリデーション・初回の /change-password 遷移は Step 2（#30・#32）で実装する
 */
export default function LoginPage() {
  return (
    // body が flex コンテナのため mx-auto だけだと内容幅に縮む。w-full で max-w-sm まで広げる
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-8 px-4 py-12">
      <div className="space-y-2 text-center">
        <p className="font-semibold text-sm">salon-ai</p>
        <h1 className="font-semibold text-2xl">ログイン</h1>
        <p className="text-muted-foreground text-sm">発行済みアカウントでログインしてください</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login-id">ログインID</Label>
          <Input autoComplete="username" className="min-h-11" id="login-id" type="text" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <Input
            autoComplete="current-password"
            className="min-h-11"
            id="password"
            type="password"
          />
        </div>
        {/* 認証の本実装は Step 2（#30）。Step 0 は /dashboard への遷移のみつなぐ（a要素なので shadcn 標準の [a]:hover が効く） */}
        <Button asChild className="min-h-11 w-full">
          <Link href="/dashboard">ログイン</Link>
        </Button>
      </div>

      {/* メールを保存しないためセルフサービスの再設定は無い。運用は 02_login.md 備考参照 */}
      <p className="text-center text-muted-foreground text-sm">
        パスワードを忘れた場合は管理者にお問い合わせください
      </p>
    </main>
  );
}
