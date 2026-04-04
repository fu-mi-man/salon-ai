# GAS 詳細設計

**配置**: `gas/`  
**管理方法**: clasp（TypeScript）

## 概要

サロンボードからの口コミ通知メールを定期監視し、AIで返信文を生成してSupabaseに保存する。

## ディレクトリ構成

```
gas/
├── src/
│   ├── main.ts          # エントリーポイント・トリガー設定
│   ├── gmail.ts         # Gmail操作（メール取得・パース）
│   ├── gemini.ts        # Gemini API呼び出し
│   ├── supabase.ts      # Supabase REST API操作
│   └── types.ts         # 型定義
├── .clasp.json          # clasp設定（scriptIdを記載）
├── appsscript.json      # GASマニフェスト
├── package.json
└── tsconfig.json
```

## 処理フロー

```
[時間駆動トリガー（5分おき）]
  ↓
main.ts: checkNewReviews()
  ↓
gmail.ts: fetchUnreadReviewMails()
  └ 件名「【HOT PEPPER Beauty】口コミが投稿されました」で未読メールを取得
  ↓
gmail.ts: parseMailBody()
  └ 本文から口コミ情報を抽出
  ↓
gemini.ts: generateReply()
  └ Gemini APIに口コミ情報を渡して返信文を生成
  ↓
supabase.ts: saveReply()
  └ Supabase REST APIに返信文を保存
  ↓
gmail.ts: markAsRead()
  └ 処理済みメールを既読にする
```

## 各モジュールの仕様

### main.ts

```typescript
// エントリーポイント
function checkNewReviews(): void

// トリガー設定（初回セットアップ時に1度だけ実行する）
function setTrigger(): void
```

トリガーは時間主導型・5分おきに設定する。

### gmail.ts

```typescript
// 未読の口コミ通知メールを取得する
function fetchUnreadReviewMails(): GoogleAppsScript.Gmail.GmailMessage[]

// メール本文から口コミ情報を抽出する
function parseMailBody(body: string): ReviewMailData | null

// メールを既読にする
function markAsRead(message: GoogleAppsScript.Gmail.GmailMessage): void
```

#### ReviewMailData（パース結果の型）

```typescript
type ReviewMailData = {
  reviewBody: string        // 口コミ本文
  ratingOverall: number     // 総合評価（1〜5）
  ratingAtmosphere: number  // 雰囲気
  ratingService: number     // 接客サービス
  ratingSkill: number       // 技術・仕上がり
  ratingPrice: number       // メニュー・料金
  couponName: string        // クーポン名
  treatmentMenus: string[]  // 施術メニュー
  reviewedAt: string        // 投稿日（YYYY/MM/DD形式）
}
```

#### メールパースのロジック

件名で口コミ通知メールを識別する。

```
件名: 【HOT PEPPER Beauty】口コミが投稿されました
```

本文のパースは正規表現で行う。

```
■評価
総合：★★★★★（5）  → ratingOverall: 5
雰囲気：4            → ratingAtmosphere: 4
...

■口コミ内容
（ここを抽出）

■予約時のクーポン・メニュー
（クーポン名）
[施術メニュー] カット、カラー  → treatmentMenus: ['カット', 'カラー']
```

### gemini.ts

```typescript
// Gemini APIを呼び出して返信文を生成する
function generateReply(data: ReviewMailData, tonePreset: TonePreset): string
```

プロンプト設計・API仕様は `docs/02_specification/integrations/gemini.md` を参照。

GASからの呼び出しは `UrlFetchApp.fetch` を使用する（Node.js の fetch は使用不可）。

### supabase.ts

```typescript
// review_repliesテーブルに返信文を保存する
function saveReply(params: SaveReplyParams): void
```

#### SaveReplyParams

```typescript
type SaveReplyParams = {
  storeId: string      // 店舗ID（GASのスクリプトプロパティから取得）
  body: string         // 生成した返信文
  tonePreset: string   // 生成時のトーン
  expiresAt: string    // 30日後のISO文字列
}
```

#### Supabase REST API呼び出し

```typescript
const url = `${SUPABASE_URL}/rest/v1/review_replies`
const options = {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  },
  payload: JSON.stringify(params)
}
UrlFetchApp.fetch(url, options)
```

## 環境変数（スクリプトプロパティ）

GASのスクリプトプロパティ（`PropertiesService.getScriptProperties()`）で管理する。
コードに直接書かない。

| キー | 説明 |
|---|---|
| `GEMINI_API_KEY` | Gemini APIキー |
| `SUPABASE_URL` | SupabaseプロジェクトURL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `STORE_ID` | 店舗ID（review_repliesに紐づける） |
| `TONE_PRESET` | デフォルトのトーン（polite / casual / concise） |

## セットアップ手順

### 1. clasp初期設定

```bash
npm install -g @google/clasp
clasp login  # Googleアカウントで認証

cd gas
pnpm install
clasp create --type standalone --title "salon-ai-gas"
```

### 2. スクリプトプロパティの設定

GASのエディタで「プロジェクトの設定」→「スクリプト プロパティ」から上記の環境変数を設定する。

### 3. Gmailの認証

サロンの専用Gmailアカウントで実行するために、GASの実行アカウントをそのGmailアカウントに設定する。初回実行時にOAuth認証が求められる。

### 4. トリガーの設定

GASのエディタから `setTrigger()` を1度だけ実行する。5分おきの時間駆動トリガーが設定される。

### 5. コードのデプロイ

```bash
cd gas
clasp push
```

## エラーハンドリング

- メールのパースに失敗した場合はスキップして次のメールを処理する
- Gemini APIがエラーを返した場合はスキップしてログに記録する
- Supabaseへの保存に失敗した場合はリトライせずログに記録する（次回の5分後に再試行される）
- エラーはGASの実行ログ（`console.error`）に記録する

## 注意事項

- Service Role Keyはすべてのテーブルへのアクセス権を持つ。スクリプトプロパティで厳重に管理する
- GASの実行は1日90分の制限がある。今回のユースケースでは問題ない
- claspでpushするたびにGASのコードが上書きされる。本番環境への反映は慎重に行う
