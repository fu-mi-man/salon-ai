---
paths:
  - "web/src/db/**"
  - "web/src/app/**/actions.ts"
  - "web/src/app/**/page.tsx"
---

# Server Components / データアクセス

- DB への直接アクセスは Server Component で行う
- Client Component からの更新は Server Actions（`useActionState`）を優先する
- Server Actions で対応できない場合のみ API Routes を使う
