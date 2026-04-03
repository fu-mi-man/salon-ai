# 非機能要件

フェーズ1（1サロン・友人向け）時点の非機能要件をまとめる。
スケール・性能要件は利用状況を見てから追記する。


## セキュリティ

### RLS（Row Level Security）

全テーブルにRLSを設定し、サロンIDでデータを分離する。
フェーズ1は認証なしで1サロン固定のため、RLSは将来のマルチテナント対応に備えた設計として最初から入れておく。

```sql
-- review_replies の例
alter table review_replies enable row level security;

create policy "サロンは自分の返信文のみ参照できる"
  on review_replies for select
  using (store_id in (
    select id from stores where salon_id = auth.uid()
  ));
```

### APIキー・シークレットの管理

| キー | 管理場所 |
|---|---|
| Gemini APIキー | GAS: スクリプトプロパティ / Next.js: Vercel環境変数 |
| Supabase Service Role Key | GAS: スクリプトプロパティのみ。Next.jsには渡さない |
| Supabase Anon Key | Next.js: Vercel環境変数 |

**Service Role KeyをNext.jsに渡さない理由**: Service Role KeyはRLSを無視してすべてのデータにアクセスできる。フロントエンドに露出するリスクがあるNext.jsには渡さず、GASのサーバーサイドのみで使用する。Next.jsはAnon Key + RLSで最小権限に留める。

### コードへのシークレット埋め込み禁止

APIキー・パスワード類はコードに直接書かない。`.env.local` はGit管理外とする。


## 可用性

インフラはすべてマネージドサービスに依存する。自前でサーバーを持たない。

| サービス | プラン | SLA |
|---|---|---|
| Vercel | Hobby（無料） | 保証なし → 有償化時にProへ移行 |
| Supabase | Free | 保証なし → 有償化時にProへ移行 |
| GAS | 無料 | Googleのインフラに依存 |
| Gemini API | 従量課金 | Googleのインフラに依存 |

フェーズ1は友人の美容室1店舗での利用のため、SLA保証は不要。


## データ保持

| データ | 保持期間 | 削除方法 |
|---|---|---|
| 返信文（review_replies） | done後30日 | Supabase pg_cronで自動削除 |
| ブログ原稿（blog_posts） | 削除しない（オーナーが任意で削除） | 手動 |
| 画像（Cloudflare R2） | blog_postsと連動 | フェーズ2で設計 |

返信文を30日で削除する理由: 口コミ本文・投稿者情報は保存しないがフェーズ1でも個人情報に関連するリスクを最小化するため。


## 対応環境

### ブラウザ

| ブラウザ | 対応 |
|---|---|
| Chrome（最新版） | ◎ |
| Safari（最新版） | ◎ |
| Firefox（最新版） | ○ |

### デバイス

モバイルファーストで設計する。オーナーがスマホで操作することを前提とする。

- max-width 480px を基準とする
- タッチターゲット 44×44px 以上（Apple HIG準拠）


## パフォーマンス

フェーズ1は1サロン・月数十件の返信文という規模のため、性能要件は定めない。
問題が発生した時点で追記する。


## 監視・ログ

| 対象 | 方法 |
|---|---|
| GASのエラー | GASの実行ログ（console.error）で確認 |
| Next.jsのエラー | Vercelのログで確認 |
| Supabaseのエラー | Supabaseダッシュボードで確認 |

フェーズ1はアラート設定なし。フェーズ1.5以降でSentryやVercel Analyticsの導入を検討する。
