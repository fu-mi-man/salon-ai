import type { ReactNode } from "react";

/**
 * 画面上部に表示するサービス共通ヘッダー
 * ヘッダーを持つ画面（ダッシュボード等）が個別に配置する。認証前の画面（/login・/reset-password）では使わない
 *
 * @param actions ヘッダー右側に表示する操作要素（ログアウトボタン等）。省略時は何も表示しない
 */
export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="flex items-center justify-between border-border border-b bg-background px-4 py-3">
      <h1 className="font-semibold text-base">salon-ai</h1>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
