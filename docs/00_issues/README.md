# フェーズ1 MVP 実行計画（依存フローと方針）

フェーズ1 MVP（口コミ返信管理）の **Step 間の依存関係** と **なぜこの構成にしたか（方針メモ）** を残す。GitHub では表現しにくいこの2点が本ファイルの役割である。

## 実行の正本は GitHub

issue 一覧・受け入れ基準・進捗状態は GitHub に置く。本ファイルでは再掲しない。

- **受け入れ基準・前提**は各 GitHub issue の本文に記載する。
- **状態（Todo / In Progress / Done）**は GitHub Project [salon-ai](https://github.com/users/fu-mi-man/projects/3) のボードで管理する。issue のクローズに自動連動するため、状態を二重管理しない。
- **Step 0〜7 のグルーピング**は GitHub の Milestone で行う（`gh issue list --milestone "Step N"`）。
- **戦略・全体像（なぜ・フェーズ・spine）**は `docs/90_wiki/roadmap.md` を見る。

## 全体の依存フロー

```text
Step0 全画面UIプロトタイプ（静的・本物ルート・インフラ不要）
   └→ Step1 ダッシュボードの操作（ダミー状態）
          └→ Step2 認証 + 全スキーマ一括 + 早期デプロイ + E2E基盤
                 ├→ Step3 スタッフ・例文（DB投入＋連携）
                 └→ Step4 履歴の永続化
                        └→ Step5 Gemini生成（要 Step3 例文 / Step4 保存先）→【E2E②】
                               └→ Step6 AI修正（Step1のダミーUIを本実装に差し替え）
                                      └→ Step7 運用開始準備
```

スキーマは **Step2（2-2）で `docs/01_requirements/03_data.md` 通りに全テーブルを1回で作成する**。
このため「Step3/Step4 でのテーブル追加・FK後付け・型再生成」は本計画には存在しない（→ 後述「方針メモ」参照）。

## 方針メモ（なぜこの構成か）

旧 `docs/00_issues/stepN_*.md` ドラフトは方針見直し前に書かれていた。本計画はそれらを統合し、以下を反映している。

1. **スキーマは Step2（2-2）で一括作成**：旧ドラフトはテーブル作成を Step2/3/4 に分散し、`salon_users.staff_id` を「NULL で作って後で FK 追加」していた。本計画では一括作成＋FK＋RLS とし、段取り依存の事故を排除した。
2. **デプロイ前倒し（2-8）**：旧ドラフトは Step7 で初めてデプロイ。本計画では認証スケルトン完成時に早期デプロイし、以降は継続デリバリ。Step7 は初期アカウント発行・本番確認に縮小。
3. **前提issueの追加**：`/` テンプレ掃除（0-1）・Supabase CLI 導入（2-1）・初期 seed（2-3）・Playwright 基盤（2-9）を新設（旧ドラフトは存在しない基盤を前提にしていた）。
4. **E2E は2点に集約**：①認証フロー（2-10）と ②生成happy path（5-5）。旧ドラフトのように各 Step には置かない。
5. **正本の一本化**：旧 `stepN_*.md`（7本）は本ファイルに統合済み。実行詳細（issue一覧・受け入れ基準・状態）は GitHub を参照する。
6. **Step0 を新設（全画面UIプロトタイプ）**：本物のルート（`/dashboard`・`/login`・`/change-password`）に shadcn/Tailwind で静的UIを先に作り、以降の Step が振る舞い・ロジックを乗せる。捨てUIにしないため本番除外は不要。旧 Step1（UI一括）は Step0（静的）＋Step1（操作）に分割した。コンポーネントは中庸（shadcnプリミティブ＋返信カードのみ抽出）。
7. **owner 単一運用に絞る（staff 個別ログインは後続）**：フェーズ1は owner ログインのみ実装。RLS の role 権限差・staff ロールのUI出し分け・staff 発行手順は作らない。スタッフ・例文は管理UIを作らず DB 直接投入する（`03_data.md` の方針通り）。これにより Step3 はスタッフCRUD UI を廃し「seed 投入＋選択連携」に縮小。Step2 に初期 seed（2-3）を追加し、デプロイ後・生成系の検証を可能にした。RLS は `salon_users.user_id = auth.uid()` 起点（`04_non-functional.md` の旧例の誤りを修正）。
