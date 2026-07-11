"use client";

import { Check, Copy, Pencil, Sparkles, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

// カード内で同時に開く操作UIは1種類だけなので，モードを単一の state で管理する
type CardMode = "view" | "confirmDelete" | "edit";

/**
 * 生成済み返信文を1件表示する履歴カード
 * Step 0 の簡易プロトタイプとして手触りの確認に必要な範囲だけ動かす
 * （コピーは実コピー＋フィードバック，削除は確認のみ，編集はモード切替のみ。保存・削除実行・AI修正は後続 Step で実装する）
 *
 * @param reply 表示する返信文1件分のデータ
 */
export function ReplyCard({ reply }: { reply: Reply }) {
  const [mode, setMode] = useState<CardMode>("view");
  const [copied, setCopied] = useState(false);
  const [draftBody, setDraftBody] = useState(reply.body);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  /**
   * 返信文をクリップボードにコピーし，2秒間だけ完了フィードバックを出す
   */
  function handleCopy() {
    navigator.clipboard.writeText(reply.body).then(() => {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    });
  }

  /**
   * 編集モードに切り替え，現在の本文を下書きへ複製する
   */
  function handleStartEdit() {
    setDraftBody(reply.body);
    setMode("edit");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">{reply.staffName}</span>
          <time className="text-muted-foreground text-xs">{formatDateTime(reply.createdAt)}</time>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {mode === "edit" ? (
          <>
            <Textarea
              className="min-h-32"
              onChange={(e) => setDraftBody(e.target.value)}
              value={draftBody}
            />
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs">AIに修正指示</p>
              <div className="flex gap-2">
                <Input className="min-h-11" placeholder="例: もう少し短くして" />
                {/* AI修正の本実装は Step 6。ここでは見た目のみで押下しても何もしない */}
                {/* AIが生成するアクションは primary（ロゼ）で統一する */}
                <Button className="min-h-11 shrink-0 hover:bg-primary/90" type="button">
                  <Sparkles className="size-4" />
                  AIで修正
                </Button>
              </div>
            </div>
          </>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
        )}
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-2">
        {mode === "edit" ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="min-h-11 w-full"
              onClick={() => setMode("view")}
              type="button"
              variant="outline"
            >
              <X className="size-4" />
              キャンセル
            </Button>
            {/* 保存の本実装は Step 4。ここでは見た目のみ */}
            <Button className="min-h-11 w-full" type="button" variant="outline">
              保存
            </Button>
          </div>
        ) : mode === "confirmDelete" ? (
          <>
            <p className="text-center text-muted-foreground text-sm">本当に削除しますか？</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="min-h-11 w-full"
                onClick={() => setMode("view")}
                type="button"
                variant="outline"
              >
                キャンセル
              </Button>
              {/* 削除の本実装は Step 4。ここでは見た目のみで押下しても何もしない */}
              <Button className="min-h-11 w-full" type="button" variant="destructive">
                <Trash2 className="size-4" />
                削除する
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Button
              className="min-h-11 w-full"
              onClick={handleCopy}
              type="button"
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  コピーしました
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  コピー
                </>
              )}
            </Button>
            <Button
              className="min-h-11 w-full"
              onClick={handleStartEdit}
              type="button"
              variant="outline"
            >
              <Pencil className="size-4" />
              編集
            </Button>
            <Button
              className="min-h-11 w-full"
              onClick={() => setMode("confirmDelete")}
              type="button"
              variant="outline"
            >
              <Trash2 className="size-4" />
              削除
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
