import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// variable prop で CSS カスタムプロパティ（--font-geist-sans）を生成する
// Tailwind の font-sans クラスからこの変数を参照して適用される
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "salon-ai",
  description: "ホットペッパービューティー向けの AI 運用支援アプリ",
};

/**
 * アプリ全体を囲むルートレイアウト
 * フォント，グローバルスタイルを適用する
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // h-full: html を画面全体の高さに広げる（body の min-h-full と組み合わせて全画面レイアウトを実現）
    // antialiased: フォントのアンチエイリアスを有効化してテキストを滑らかに描画する
    <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} lang="en">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
