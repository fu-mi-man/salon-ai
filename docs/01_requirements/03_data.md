# データモデル

本ドキュメントはSupabase（PostgreSQL）のテーブル設計をまとめた資料である。  
ドメインは `auth`・`review`・`blog` の3つで構成する。  


## 設計方針

### フェーズ1（現在）
口コミの個人情報（口コミ本文・投稿者名・評価等）は保存しない。  
生成した返信文のみ保存する。リーガルチェック不要。  

### フェーズ2以降（SaaS本格展開時）
`reviews` テーブルを追加し、口コミ情報を保存する設計に拡張する。  
このタイミングでリーガルチェックを入れ、プライバシーポリシーを整備する。  


## ER図

```
# フェーズ1
salons
  └── stores
        └── review_replies

# フェーズ2以降（追加）
salons
  └── stores
        └── reviews
              └── review_replies（review_idを追加）
        └── blog_posts
              └── blog_post_images
```


## auth ドメイン

### salons（サロン）

マルチテナントの単位。オーナー1名につき1レコード。  

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| name | text | NOT NULL | サロン名 |
| email | text | NOT NULL, UNIQUE | ログイン用メールアドレス |
| gmail_address | text | | GAS連携用の専用Gmailアドレス |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

### stores（店舗）

1サロンが複数店舗を持つケースに対応。フェーズ1は1サロン1店舗の想定。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| salon_id | uuid | NOT NULL, FK → salons.id | |
| name | text | NOT NULL | 店舗名 |
| tone_preset | text | NOT NULL, default 'polite' | polite / casual / concise |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |


## review ドメイン

### review_replies（口コミ返信）

AIが生成した返信文のみを保存する。口コミ本文・投稿者情報は保存しない。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| store_id | uuid | NOT NULL, FK → stores.id | |
| review_id | uuid | NULL, FK → reviews.id | フェーズ2以降に使用。フェーズ1はNULL |
| body | text | NOT NULL | 生成された返信文 |
| tone_preset | text | NOT NULL | 生成時のトーン: polite / casual / concise |
| status | text | NOT NULL, default 'pending' | pending / in_progress / done |
| status_changed_at | timestamptz | | ステータス変更日時 |
| expires_at | timestamptz | | done後30日で自動削除 |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

**status の定義**

| 値 | 意味 |
|---|---|
| pending | 未対応（生成直後の初期状態） |
| in_progress | 確認中（将来のスタイリスト対応を見越した状態） |
| done | 対応済み（オーナーが手動で切り替え） |

### reviews（口コミ）※ フェーズ2以降に追加

口コミ本文・投稿者情報を保存する。SaaS本格展開時にリーガルチェックの上で追加する。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| store_id | uuid | NOT NULL, FK → stores.id | |
| body | text | NOT NULL | 口コミ本文 |
| reviewer_name | text | | 投稿者名（例: あいかわさん） |
| reviewer_gender | text | | 性別 |
| reviewer_age_group | text | | 年代（例: 40代） |
| rating_overall | smallint | | 総合評価 1〜5 |
| rating_atmosphere | smallint | | 雰囲気 |
| rating_service | smallint | | 接客サービス |
| rating_skill | smallint | | 技術・仕上がり |
| rating_price | smallint | | メニュー・料金 |
| coupon_name | text | | 予約時のクーポン名 |
| treatment_menus | text[] | | 施術メニュー（複数対応） |
| reviewed_at | date | | 投稿日 |
| notified_at | timestamptz | NOT NULL | メール通知の受信日時 |
| created_at | timestamptz | NOT NULL, default now() | |
| expires_at | timestamptz | | 30日で自動削除 |


## blog ドメイン

### blog_posts（ブログ投稿）

AIが生成したブログ原稿を保存する。フェーズ2から使用。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| store_id | uuid | NOT NULL, FK → stores.id | |
| title | text | | ブログタイトル |
| body | text | NOT NULL | 生成されたブログ本文 |
| status | text | NOT NULL, default 'pending' | pending / in_progress / done |
| status_changed_at | timestamptz | | ステータス変更日時 |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

### blog_post_images（ブログ投稿画像）

アップロードされた画像のCloudflare R2上のURLを保存する。1投稿に複数枚対応。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| blog_post_id | uuid | NOT NULL, FK → blog_posts.id | |
| r2_url | text | NOT NULL | Cloudflare R2上のURL |
| order | smallint | NOT NULL, default 0 | 表示順 |
| created_at | timestamptz | NOT NULL, default now() | |


## 設計上の注意事項

- 全テーブルにRLS（Row Level Security）を設定し、`salon_id` または `store_id` でデータを分離する
- フェーズ1は認証なし・1サロン固定で動かすが、テーブル構造はマルチテナント対応済みのため認証追加時の変更は最小限
- `expires_at` による自動削除はSupabaseのpg_cronで定期実行する
- `tone_preset` はアプリ側でenum管理し、DBはtextで持つ
- `reviews` テーブルはフェーズ2追加時にリーガルチェックを必ず実施する
