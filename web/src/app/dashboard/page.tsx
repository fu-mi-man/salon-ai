"use client";

import { Check, CheckCircle2, Copy, Pencil, RefreshCw, Save, X } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "pending" | "done";
type TonePreset = "丁寧" | "カジュアル" | "簡潔";
type TabKey = "all" | "pending" | "done";

type Reply = {
  id: string;
  body: string;
  status: Status;
  tone_preset: TonePreset;
  created_at: string;
};

/**
 * フェーズ1用のダミーデータ
 * Step 2 で Supabase 取得に置き換える前提で、画面確認に必要な最低限の項目だけ持つ
 *
 * @returns なし。ダッシュボード初期表示用の固定データ
 */
const DUMMY_REPLIES: Reply[] = [
  {
    id: "1",
    body: `この度はご来店いただき，誠にありがとうございます。
担当させていただいた田中です。

お客様にご満足いただけたとのこと，大変嬉しく思います。
ヘアスタイルが気に入っていただけましたら幸いです。


またのご来店を心よりお待ちしております。`,
    status: "pending",
    tone_preset: "丁寧",
    created_at: "2026-04-10T08:00:00",
  },
  {
    id: "2",
    body: `ありがとうございます！
カラーを気に入っていただけてすごく嬉しいです。

また遊びに来てくださいね〜！


次回もぜひご来店お待ちしてます。`,
    status: "pending",
    tone_preset: "カジュアル",
    created_at: "2026-04-09T14:30:00",
  },
  {
    id: "3",
    body: `ご来店ありがとうございました。

またのご利用をお待ちしております。`,
    status: "done",
    tone_preset: "簡潔",
    created_at: "2026-04-08T10:00:00",
  },
];

const TONES: TonePreset[] = ["丁寧", "カジュアル", "簡潔"];

/**
 * ISO文字列をダッシュボード表示用の日付文字列に整形する
 *
 * @param dateStr ISO形式の日付文字列
 * @returns 画面表示用に整形した日時文字列
 */
function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

/**
 * ステータス値をユーザー向けラベルに変換する
 *
 * @param status 内部で保持しているステータス値
 * @returns バッジ表示に使う日本語ラベル
 */
function statusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    pending: "未対応",
    done: "対応済み",
  };
  return labels[status];
}

/**
 * ステータスバッジの色を返す
 * 未対応は注意喚起しつつ強すぎないアンバー、対応済みは完了を示すグリーンに寄せる
 *
 * @param status 内部で保持しているステータス値
 * @returns Badge に適用する Tailwind クラス文字列
 */
function statusClassName(status: Status): string {
  if (status === "pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "done") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

/**
 * ダッシュボード画面
 * 生成された返信文の一覧を表示し，コピー・対応済み更新・再生成（ドロワー）を行う
 *
 * @returns ダッシュボード画面の JSX
 */
export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const [replies, setReplies] = useState<Reply[]>(DUMMY_REPLIES);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // 編集・対応済み確認・トーン選択は同時に開かない前提で、カードID単位でUI状態を持つ。
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [confirmDoneId, setConfirmDoneId] = useState<string | null>(null);
  const [tonePickerId, setTonePickerId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /**
   * textarea の高さを入力内容に合わせて再計算する
   * 編集開始時と入力時に都度呼んで、スクロールではなく自然な伸縮に寄せる
   *
   * @param element 高さを再計算する textarea 要素
   * @returns なし。textarea の style.height を更新する
   */
  function resizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }

  /**
   * 返信文をクリップボードにコピーし、対象カードだけ2秒間フィードバックを出す
   *
   * @param id コピー対象のカードID
   * @param body クリップボードへ入れる返信文本文
   * @returns なし。コピー完了後に copiedId を一時更新する
   */
  function handleCopy(id: string, body: string) {
    navigator.clipboard.writeText(body).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    });
  }

  /**
   * 対象カードを対応済みに更新する
   * 完了後は確認UIやトーン選択UIも閉じて、カード状態を通常表示に戻す
   *
   * @param id 対応済みに更新するカードID
   * @returns なし。対象カードの status と関連UI状態を更新する
   */
  function handleMarkDone(id: string) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status: "done" } : r)));
    setConfirmDoneId(null);
    setTonePickerId(null);
  }

  /**
   * 再生成時のトーン選択UIを開く
   * 同時に他のカード操作UIは閉じて、1カードだけ操作できる状態に揃える
   *
   * @param id トーン選択UIを開くカードID
   * @returns なし。tonePickerId と他のUI状態を更新する
   */
  function handleOpenTonePicker(id: string) {
    setTonePickerId(id);
    setConfirmDoneId(null);
    setEditingId(null);
    setDraftBody("");
  }

  /**
   * 開いているトーン選択UIを閉じる
   *
   * @returns なし。tonePickerId を null に戻す
   */
  function handleCancelTonePicker() {
    setTonePickerId(null);
  }

  /**
   * 選択されたトーンをカードに反映する
   * フェーズ1ではダミー実装として tone_preset の更新のみ行い、
   * Step 6 で Gemini 再生成処理に差し替える
   *
   * @param id 更新対象のカードID
   * @param tone 適用するトーンプリセット
   * @returns なし。対象カードの tone_preset を更新する
   */
  function handleRegenerate(id: string, tone: TonePreset) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, tone_preset: tone } : r)));
    setTonePickerId(null);
  }

  /**
   * 対象カードを編集モードに切り替え、現在の本文を下書きへコピーする
   *
   * @param id 編集対象のカードID
   * @param body 編集開始時点の返信文本文
   * @returns なし。editingId と draftBody を更新する
   */
  function handleStartEdit(id: string, body: string) {
    setEditingId(id);
    setDraftBody(body);
    setConfirmDoneId(null);
    setTonePickerId(null);
    requestAnimationFrame(() => {
      if (textareaRef.current) resizeTextarea(textareaRef.current);
    });
  }

  /**
   * 編集内容を破棄して通常表示へ戻す
   *
   * @returns なし。editingId と draftBody を初期化する
   */
  function handleCancelEdit() {
    setEditingId(null);
    setDraftBody("");
  }

  /**
   * 編集中の本文を対象カードへ反映する
   * Step 2 では Server Action 経由の保存に置き換える想定
   *
   * @param id 保存対象のカードID
   * @returns なし。対象カードの body を更新する
   */
  function handleSaveEdit(id: string) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, body: draftBody } : r)));
    setEditingId(null);
    setDraftBody("");
  }

  /**
   * 対応済み確認UIを開く
   *
   * @param id 確認UIを開くカードID
   * @returns なし。confirmDoneId を更新する
   */
  function handleAskDone(id: string) {
    setConfirmDoneId(id);
  }

  /**
   * 対応済み確認UIを閉じる
   *
   * @returns なし。confirmDoneId を null に戻す
   */
  function handleCancelDone() {
    setConfirmDoneId(null);
  }

  /**
   * 指定された返信一覧をカードグリッドとして描画する
   * タブごとの差分は一覧の中身だけに寄せ、カードUI自体は共通化する
   *
   * @param items 現在のタブで表示対象になる返信一覧
   * @returns カード一覧、または空状態メッセージの JSX
   */
  function renderReplies(items: Reply[]) {
    if (items.length === 0) {
      return (
        <p className="py-16 text-center text-muted-foreground text-sm">
          対応が必要な口コミはありません
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((reply) => (
          <Card className="bg-white ring-zinc-200" key={reply.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">
                  {formatDate(reply.created_at)}
                </span>
                <Badge className={statusClassName(reply.status)} variant="outline">
                  {statusLabel(reply.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* 編集中だけ textarea に切り替え、通常時は整形済み本文をそのまま表示する。 */}
              {editingId === reply.id ? (
                <textarea
                  className="w-full overflow-hidden rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  onChange={(e) => {
                    setDraftBody(e.target.value);
                    resizeTextarea(e.target);
                  }}
                  ref={textareaRef}
                  value={draftBody}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{reply.body}</p>
              )}
              <p className="mt-2 text-muted-foreground text-xs">トーン: {reply.tone_preset}</p>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 border-zinc-200 bg-zinc-50">
              {/* 1カード内で出す操作UIは常に1種類だけに絞る。 */}
              {editingId === reply.id ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    onClick={handleCancelEdit}
                    size="default"
                    variant="outline"
                  >
                    <X className="size-4 text-rose-500" />
                    キャンセル
                  </Button>
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    onClick={() => handleSaveEdit(reply.id)}
                    size="default"
                    variant="outline"
                  >
                    <Save className="size-4 text-emerald-300" />
                    保存する
                  </Button>
                </div>
              ) : tonePickerId === reply.id ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    onClick={handleCancelTonePicker}
                    size="default"
                    variant="outline"
                  >
                    <X className="size-4 text-rose-500" />
                    キャンセル
                  </Button>
                  {TONES.map((tone) => (
                    <Button
                      className="min-h-10 w-full cursor-pointer bg-white"
                      key={tone}
                      onClick={() => handleRegenerate(reply.id, tone)}
                      size="default"
                      variant="outline"
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              ) : confirmDoneId === reply.id ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    onClick={handleCancelDone}
                    size="default"
                    variant="outline"
                  >
                    <X className="size-4 text-rose-500" />
                    キャンセル
                  </Button>
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    onClick={() => handleMarkDone(reply.id)}
                    size="default"
                    variant="outline"
                  >
                    <CheckCircle2 className="size-4 text-emerald-300" />
                    対応済み
                  </Button>
                </div>
              ) : (
                // 通常時は主要4操作を 2 x 2 で固定し、スマホでも押し間違えにくい形にする。
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    onClick={() => handleCopy(reply.id, reply.body)}
                    size="default"
                    variant="outline"
                  >
                    {copiedId === reply.id ? (
                      <>
                        <Check className="size-4 text-emerald-600" />
                        コピーしました
                      </>
                    ) : (
                      <>
                        <Copy className="size-4 text-sky-600" />
                        コピー
                      </>
                    )}
                  </Button>
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    disabled={reply.status === "done"}
                    onClick={() => handleStartEdit(reply.id, reply.body)}
                    size="default"
                    variant="outline"
                  >
                    <Pencil className="size-4 text-amber-500" />
                    編集する
                  </Button>
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    disabled={reply.status === "done"}
                    onClick={() => handleAskDone(reply.id)}
                    size="default"
                    variant="outline"
                  >
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    {reply.status === "done" ? "対応済み" : "対応済みにする"}
                  </Button>
                  <Button
                    className="min-h-10 w-full cursor-pointer bg-white"
                    disabled={reply.status === "done"}
                    onClick={() => handleOpenTonePicker(reply.id)}
                    size="default"
                    variant="outline"
                  >
                    <RefreshCw className="size-4 text-violet-500" />
                    再生成する
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-foreground">
      <header className="border-zinc-200 border-b bg-white px-4 py-3">
        <h1 className="font-semibold text-base">salon-ai</h1>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5">
        <Tabs className="w-full" onValueChange={(v) => setTab(v as TabKey)} value={tab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="cursor-pointer" value="pending">
              未対応
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="done">
              対応済み
            </TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="all">
              すべて
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-6" value="pending">
            {renderReplies(replies.filter((r) => r.status === "pending"))}
          </TabsContent>
          <TabsContent className="mt-6" value="done">
            {renderReplies(replies.filter((r) => r.status === "done"))}
          </TabsContent>
          <TabsContent className="mt-6" value="all">
            {renderReplies(replies)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
