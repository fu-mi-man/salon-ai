import { KeyRound, LogOut } from "lucide-react";
import Link from "next/link";
import { GenerateForm } from "@/components/features/generate-form";
import { type Reply, ReplyCard } from "@/components/features/reply-card";
import { SiteHeader } from "@/components/features/site-header";
import { Button } from "@/components/ui/button";

/**
 * 画面確認用のダミースタッフ一覧
 * Step 3 で staff テーブルからの取得に置き換える
 */
const DUMMY_STAFF = ["田中 美咲", "佐藤 健", "鈴木 あや"];

/**
 * 画面確認用のダミー履歴データ
 * Step 4 で review_replies テーブルからの取得に置き換える。空状態を確認したいときは空配列にする
 */
const DUMMY_REPLIES: Reply[] = [
  {
    id: "1",
    staffName: "田中 美咲",
    body: `この度はご来店いただき，誠にありがとうございます。
担当させていただいた田中です。

お客様にご満足いただけたとのこと，大変嬉しく思います。
ヘアスタイルが気に入っていただけましたら幸いです。

またのご来店を心よりお待ちしております。`,
    createdAt: "2026-04-10T08:00:00",
  },
  {
    id: "2",
    staffName: "佐藤 健",
    body: `ありがとうございます！
カラーを気に入っていただけてすごく嬉しいです。

また遊びに来てくださいね〜！
次回もぜひご来店お待ちしてます。`,
    createdAt: "2026-04-09T14:30:00",
  },
  {
    id: "3",
    staffName: "鈴木 あや",
    body: `ご来店ありがとうございました。

またのご利用をお待ちしております。`,
    createdAt: "2026-04-08T10:00:00",
  },
];

/**
 * ダッシュボード画面
 * 口コミを貼り付けて返信文を生成し，生成履歴を一覧表示する
 * Step 0 では静的UI（見た目のみ）で，生成・コピー・編集・削除の振る舞いは後続 Step で実装する
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        actions={
          <>
            <Button asChild className="min-h-11" variant="ghost">
              <Link href="/change-password">
                <KeyRound className="size-4" />
                パスワード変更
              </Link>
            </Button>
            {/* サインアウトの本実装は Step 2（#33）。ここでは /login への遷移のみ */}
            <Button asChild className="min-h-11" variant="ghost">
              <Link href="/login">
                <LogOut className="size-4" />
                ログアウト
              </Link>
            </Button>
          </>
        }
      />

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-6 md:grid-cols-2">
        {/* 生成エリア（SPは上，タブレット以降は左カラム） */}
        <section aria-labelledby="generate-heading" className="space-y-4">
          <h2 className="font-semibold text-lg" id="generate-heading">
            返信文を生成
          </h2>
          <GenerateForm staffNames={DUMMY_STAFF} />
        </section>

        {/* 生成履歴（SPは下，タブレット以降は右カラム） */}
        <section aria-labelledby="history-heading" className="space-y-4">
          <h2 className="font-semibold text-lg" id="history-heading">
            生成履歴
          </h2>
          {DUMMY_REPLIES.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground text-sm">
              まだ生成した返信文はありません
            </p>
          ) : (
            <div className="space-y-4">
              {DUMMY_REPLIES.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
