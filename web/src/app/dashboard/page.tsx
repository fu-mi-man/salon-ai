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

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function statusLabel(status: Status): string {
  const labels: Record<Status, string> = {
    pending: "未対応",
    done: "対応済み",
  };
  return labels[status];
}

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
 */
export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const [replies, setReplies] = useState<Reply[]>(DUMMY_REPLIES);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [confirmDoneId, setConfirmDoneId] = useState<string | null>(null);
  const [tonePickerId, setTonePickerId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function resizeTextarea(element: HTMLTextAreaElement) {
    element.style.height = "0px";
    element.style.height = `${element.scrollHeight}px`;
  }

  function handleCopy(id: string, body: string) {
    navigator.clipboard.writeText(body).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    });
  }

  function handleMarkDone(id: string) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status: "done" } : r)));
    setConfirmDoneId(null);
    setTonePickerId(null);
  }

  function handleOpenTonePicker(id: string) {
    setTonePickerId(id);
    setConfirmDoneId(null);
    setEditingId(null);
    setDraftBody("");
  }

  function handleCancelTonePicker() {
    setTonePickerId(null);
  }

  function handleRegenerate(id: string, tone: TonePreset) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, tone_preset: tone } : r)));
    setTonePickerId(null);
  }

  function handleStartEdit(id: string, body: string) {
    setEditingId(id);
    setDraftBody(body);
    setConfirmDoneId(null);
    setTonePickerId(null);
    requestAnimationFrame(() => {
      if (textareaRef.current) resizeTextarea(textareaRef.current);
    });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setDraftBody("");
  }

  function handleSaveEdit(id: string) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, body: draftBody } : r)));
    setEditingId(null);
    setDraftBody("");
  }

  function handleAskDone(id: string) {
    setConfirmDoneId(id);
  }

  function handleCancelDone() {
    setConfirmDoneId(null);
  }

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
