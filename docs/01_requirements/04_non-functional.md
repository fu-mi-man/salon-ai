# 非機能要件

フェーズ1（1サロン・友人向け）時点の非機能要件をまとめる。  
スケール・性能要件は利用状況を見てから追記する。


## セキュリティ

### 認証

Supabase Authのemail/password認証を使用する。

- 1サロン1アカウント（オーナーのみ）
- パスワードリセットはSupabase標準機能（メール送信）で対応。自前実装不要
- セッション管理はSupabaseが担当

### RLS（Row Level Security）

全テーブルにRLSを設定し、サロンIDでデータを分離する。  
フェーズ1からSupabase Authを導入するため、RLSポリシーもフェーズ1から有効化する。

```sql
-- review_replies の例
alter table review_replies enable row level security;

create policy "サロンは自分の返信文のみ参照できる"
  on review_replies for select
  using (store_id in (
    select id from stores where salon_id = auth.uid()
  ));
```

INSERT / UPDATE / DELETE についても同様のポリシーが必要。

フェーズ2以降のマルチテナント化では、ポリシーを追加してサロン間のデータ分離を強化する。

### APIキー・シークレットの管理

| キー | 管理場所 |
|---|---|
| Gemini APIキー | Next.js: Vercel環境変数 |
| Supabase Anon Key | Next.js: Vercel環境変数 |

### コードへのシークレット埋め込み禁止

APIキー・パスワード類はコードに直接書かない。`.env.local` はGit管理外とする。


## 可用性

インフラはすべてマネージドサービスに依存する。自前でサーバーを持たない。

| サービス | プラン | SLA |
|---|---|---|
| Vercel | Hobby（無料） | 保証なし → 有償化時にProへ移行 |
| Supabase | Free | 保証なし → 有償化時にProへ移行 |
| Gemini API | 従量課金 | Googleのインフラに依存 |

フェーズ1は友人の美容室1店舗での利用のため、SLA保証は不要。


## データ保持

| データ | 保持期間 | 削除方法 |
|---|---|---|
| 返信文（review_replies） | 最終更新から30日 | Supabase pg_cronで自動削除 |
| ブログ原稿（blog_posts） | 削除しない（オーナーが任意で削除） | 手動 |
| 画像（Cloudflare R2） | blog_postsと連動 | フェーズ3で設計 |

返信文を30日で削除する理由: 不要なデータを残さない方針のため。生成文に投稿者名等が含まれる可能性もあることから，定期的に削除することでリスクを最小化する。


## 対応環境

### ブラウザ

| ブラウザ | 対応 |
|---|---|
| Chrome（最新版） | ◎ |
| Safari（最新版） | ◎ |
| Firefox（最新版） | ○ |

### デバイス

モバイルファーストで設計する。スマホでの操作を主軸としつつ、タブレットでの利用も考慮する。

| デバイス | 基準 |
|---|---|
| モバイル | max-width 480px |
| タブレット | 768px〜（2カラムレイアウトに切り替え） |

- タッチターゲット 44×44px 以上（Apple HIG準拠）


## パフォーマンス

フェーズ1は1サロン・月数十件の返信文という規模のため、性能要件は定めない。  
問題が発生した時点で追記する。


## 監視・ログ

| 対象 | 方法 |
|---|---|
| Next.jsのエラー | Vercelのログで確認 |
| Supabaseのエラー | Supabaseダッシュボードで確認 |

フェーズ1はアラート設定なし。フェーズ2以降でSentryやVercel Analyticsの導入を検討する。
