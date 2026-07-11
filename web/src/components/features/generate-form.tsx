"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * 口コミ本文の入力と返信文生成ボタンをまとめた生成フォーム
 * Step 0 では入力に応じたボタンの活性・非活性までで，生成の本実装は Step 5
 *
 * @param staffNames 選択肢として表示するスタッフ名の一覧
 */
export function GenerateForm({ staffNames }: { staffNames: string[] }) {
  const [reviewText, setReviewText] = useState("");

  return (
    <>
      <Textarea
        className="min-h-32"
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="サロンボードからコピーした口コミ本文を貼り付けてください"
        value={reviewText}
      />
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select>
          <SelectTrigger className="min-h-11 w-full sm:w-56">
            <SelectValue placeholder="担当スタッフを選択" />
          </SelectTrigger>
          <SelectContent>
            {staffNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* 空白のみの入力では活性化しない。生成の本実装は Step 5 */}
        <Button
          className="min-h-11 w-full hover:bg-primary/90 sm:w-auto"
          disabled={reviewText.trim() === ""}
        >
          <Sparkles className="size-4" />
          返信文を生成
        </Button>
      </div>
    </>
  );
}
