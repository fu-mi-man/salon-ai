import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Intl.DateTimeFormat の生成は重いため，モジュールロード時に1度だけ作って使い回す
const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * ISO文字列を画面表示用の日時文字列（例: 2026/04/03 08:00）に整形する
 *
 * @param dateStr ISO形式の日付文字列
 */
export function formatDateTime(dateStr: string): string {
  return dateTimeFormatter.format(new Date(dateStr));
}
