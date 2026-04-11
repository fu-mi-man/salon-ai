"use client";

import { Check, CheckCircle2, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Status = "pending" | "in_progress" | "done";
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
    body: "この度はご来店いただき，誠にありがとうございます。担当させていただいた田中です。お客様にご満足いただけたとのこと，大変嬉しく思います。ヘアスタイルが気に入っていただけましたら幸いです。またのご来店を心よりお待ちしております。",
    status: "pending",
    tone_preset: "丁寧",
    created_at: "2026-04-10T08:00:00",
  },
  {
    id: "2",
    body: "ありがとうございます！カラーを気に入っていただけてすごく嬉しいです。また遊びに来てくださいね〜！次回もぜひご来店お待ちしてます。",
    status: "in_progress",
    tone_preset: "カジュアル",
    created_at: "2026-04-09T14:30:00",
  },
  {
    id: "3",
    body: "ご来店ありがとうございました。またのご利用をお待ちしております。",
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
    in_progress: "確認中",
    done: "対応済み",
  };
  return labels[status];
}

function statusVariant(status: Status): "default" | "secondary" | "outline" {
  if (status === "pending") return "default";
  if (status === "in_progress") return "secondary";
  return "outline";
}

/**
 * ダッシュボード画面
 * 生成された返信文の一覧を表示し，コピー・対応済み更新・再生成（ドロワー）を行う
 */
export default function DashboardPage() {
  const [tab, setTab] = useState<TabKey>("pending");
  const [replies, setReplies] = useState<Reply[]>(DUMMY_REPLIES);
  const [drawerOpenId, setDrawerOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<TonePreset>("丁寧");

  const drawerReply = replies.find((r) => r.id === drawerOpenId) ?? null;

  const filtered = replies.filter((r) => {
    if (tab === "all") return true;
    if (tab === "pending") return r.status === "pending" || r.status === "in_progress";
    return r.status === "done";
  });

  function handleCopy(id: string, body: string) {
    navigator.clipboard.writeText(body).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    });
  }

  function handleMarkDone(id: string) {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status: "done" } : r)));
  }

  function handleOpenDrawer(id: string) {
    const reply = replies.find((r) => r.id === id);
    if (reply) setSelectedTone(reply.tone_preset);
    setDrawerOpenId(id);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-4">
        <h1 className="font-semibold text-base">salon-ai</h1>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <Tabs onValueChange={(v) => setTab(v as TabKey)} value={tab}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="pending">未対応</TabsTrigger>
            <TabsTrigger value="done">対応済み</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-6">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground text-sm">
              対応が必要な口コミはありません
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((reply) => (
                <Card key={reply.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-xs">
                        {formatDate(reply.created_at)}
                      </span>
                      <Badge variant={statusVariant(reply.status)}>
                        {statusLabel(reply.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{reply.body}</p>
                    <p className="mt-2 text-muted-foreground text-xs">
                      トーン: {reply.tone_preset}
                    </p>
                  </CardContent>
                  <CardFooter className="flex-wrap gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleCopy(reply.id, reply.body)}
                      size="sm"
                      variant="outline"
                    >
                      {copiedId === reply.id ? (
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
                    {reply.status !== "done" && (
                      <Button
                        className="flex-1"
                        onClick={() => handleMarkDone(reply.id)}
                        size="sm"
                        variant="outline"
                      >
                        <CheckCircle2 className="size-4" />
                        対応済みにする
                      </Button>
                    )}
                    <Button onClick={() => handleOpenDrawer(reply.id)} size="sm" variant="ghost">
                      <RefreshCw className="size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Drawer
        onOpenChange={(open) => {
          if (!open) setDrawerOpenId(null);
        }}
        open={drawerOpenId !== null}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>トーンを選択してください</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-3 px-4 py-2">
            {TONES.map((tone) => (
              <label className="flex cursor-pointer items-center gap-3" key={tone}>
                <input
                  checked={selectedTone === tone}
                  className="size-4 accent-primary"
                  name="tone"
                  onChange={() => setSelectedTone(tone)}
                  type="radio"
                  value={tone}
                />
                <span className="text-sm">
                  {tone}
                  {drawerReply?.tone_preset === tone && (
                    <span className="ml-2 text-muted-foreground text-xs">（現在の設定）</span>
                  )}
                </span>
              </label>
            ))}
          </div>
          <DrawerFooter>
            <Button onClick={() => setDrawerOpenId(null)}>再生成する</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
