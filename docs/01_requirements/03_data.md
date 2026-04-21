# データモデル

本ドキュメントはSupabase（PostgreSQL）のテーブル設計をまとめた資料である。  
ドメインは `auth`・`review`・`blog` の3つで構成する。  


## 設計方針

### フェーズ1（現在）
口コミの個人情報（口コミ本文・投稿者名・評価等）は保存しない。  
生成した返信文のみ保存する。リーガルチェック不要。  

### フェーズ2以降（SaaS本格展開時）
`blog_posts` / `blog_post_images` テーブルを追加し，ブログ投稿支援機能を実装する。  


## ER図

```
# フェーズ1
salons
  └── stores
        ├── staff
        │     └── staff_tone_examples
        └── review_replies

# フェーズ2以降（追加）
salons
  └── stores
        └── blog_posts
              └── blog_post_images
```


## auth ドメイン

### salons（サロン）

マルチテナントの単位。オーナー1名につき1レコード。  
Supabase Authの `auth.users.id` と `salons.id` を一致させる。メールアドレスは `auth.users` で管理するため `salons` テーブルには持たない。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | Supabase Auth の user_id と同一 |
| name | text | NOT NULL | サロン名 |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

### stores（店舗）

1サロンが複数店舗を持つケースに対応。フェーズ1は1サロン1店舗の想定。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| salon_id | uuid | NOT NULL, FK → salons.id | |
| name | text | NOT NULL | 店舗名 |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |


## review ドメイン

### staff（スタッフ）

返信生成時に担当者を選択するためのテーブル。スタッフはログインしない（データとしてのみ存在する）。  
フェーズ1のMVPではDB直接挿入で初期データを投入する（管理UIはMVP外）。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| store_id | uuid | NOT NULL, FK → stores.id | |
| name | text | NOT NULL | スタッフ名 |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |

### staff_tone_examples（スタッフ返信例文）

Gemini APIのfew-shot用。スタッフが実際に書いた過去の返信文を登録する。  
件数の上限は設けない（精度検証後に運用ルールで管理）。  
ポジティブ・ネガティブ口コミ用の例文を区別せず混在させる。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| staff_id | uuid | NOT NULL, FK → staff.id | |
| body | text | NOT NULL | 返信例文本文 |
| order | smallint | NOT NULL, default 0 | プロンプトへの組み込み順 |
| created_at | timestamptz | NOT NULL, default now() | |

### review_replies（口コミ返信）

AIが生成した返信文のみを保存する。口コミ本文・投稿者情報・評価は保存しない。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| store_id | uuid | NOT NULL, FK → stores.id | |
| staff_id | uuid | NULL, FK → staff.id | スタッフ削除時はNULL |
| staff_name | text | NOT NULL | 生成時のスタッフ名スナップショット |
| body | text | NOT NULL | 生成された返信文 |
| expires_at | timestamptz | | 最終更新から30日後に自動削除 |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL, default now() | |


## blog ドメイン

### blog_posts（ブログ投稿）

AIが生成したブログ原稿を保存する。フェーズ2から使用。

| カラム | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| store_id | uuid | NOT NULL, FK → stores.id | |
| title | text | | ブログタイトル |
| body | text | NOT NULL | 生成されたブログ本文 |
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

- 全テーブルにRLS（Row Level Security）を設定し，`salon_id` または `store_id` でデータを分離する
- フェーズ1はSupabase Authでemail/passwordログイン。1サロン1アカウント（オーナーのみ）。テーブル構造はマルチテナント対応済みのため，スタッフ個別ログイン追加時の変更は最小限
- `expires_at` による自動削除はSupabaseのpg_cronで定期実行する
- `staff_name` は生成時点のスナップショット。スタッフレコード削除後も履歴カードに名前を表示するために保持する
