---
paths:
  - "web/src/**/*.ts"
  - "web/src/**/*.tsx"
  - "web/src/app/globals.css"
---

# Code style

- `components/ui/` は shadcn/ui 専用。自作コンポーネントを置かない
- 機能固有のコンポーネント → `components/features/`
- IMPORTANT: UIコンポーネントは shadcn/ui を優先して使用する。入力系（`<button>`→`<Button>`、`<input>`→`<Input>`）だけでなく、表示系（`<div>` でカード→`<Card>`）も含む。該当コンポーネントがない場合のみ素のHTML要素を使う
- IMPORTANT: 新しいUIコンポーネント利用時は shadcn スキルで存在確認，ライブラリの設定変更・新規導入時は context7 で公式ドキュメントを確認すること
- IMPORTANT: Tailwind v4 を使用。`tailwind.config.js` と `postcss.config.js` は作らない。`web/src/app/globals.css` の先頭は `@import "tailwindcss";`。shadcn/ui 導入後は `@import "tw-animate-css"` と `@import "shadcn/tailwind.css"` も追加される（これらは必要なので削除しない）
- モバイルファースト: max-width 480px，タッチターゲット 44×44px 以上（Apple HIG 準拠）。ただしトップページ（`/`）はランディングページのためこの限りではない
- スペーシング・サイズは 4px グリッドに沿う（Tailwind のデフォルトスケールは 4px 基準のため，`w-11`（44px）・`h-11`（44px）・`p-3`（12px）のような値を使う。中間的な値（`w-10.5` 等）は避ける）
