import { Sparkles } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * AIが生成するアクション（返信文を生成・AIで修正）用のボタン
 * primary（テーマ色）・Sparklesアイコン・ホバーをここで統一する
 * shadcnのdefaultバリアントはbutton要素にホバーを持たないため，原本を編集せず利用側で上書きする
 */
export function AiActionButton({ className, children, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button className={cn("min-h-11 hover:bg-primary/90", className)} {...props}>
      <Sparkles className="size-4" />
      {children}
    </Button>
  );
}
