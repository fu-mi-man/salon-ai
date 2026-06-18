import { Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

/**
 * 履歴カード1件分の表示データ
 * Step 4 で Supabase の review_replies 取得に置き換える前提で，画面表示に必要な項目だけ持つ
 */
export type Reply = {
  id: string;
  staffName: string;
  body: string;
  createdAt: string;
};

/**
 * 生成済み返信文を1件表示する履歴カード
 * Step 0 では見た目のみで，コピー・編集・削除の振る舞いは Step 1 以降で実装する
 *
 * @param reply 表示する返信文1件分のデータ
 */
export function ReplyCard({ reply }: { reply: Reply }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">{reply.staffName}</span>
          <time className="text-muted-foreground text-xs">{formatDateTime(reply.createdAt)}</time>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2">
        <Button className="min-h-11 w-full" size="default" variant="outline">
          <Copy className="size-4" />
          コピー
        </Button>
        <Button className="min-h-11 w-full" size="default" variant="outline">
          <Pencil className="size-4" />
          編集
        </Button>
        <Button className="min-h-11 w-full" size="default" variant="outline">
          <Trash2 className="size-4" />
          削除
        </Button>
      </CardFooter>
    </Card>
  );
}
