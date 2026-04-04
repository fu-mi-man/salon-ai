# Gemini API 設計

**用途**: 口コミ返信文の生成（フェーズ1）・ブログ原稿生成（フェーズ2）
**モデル**: `gemini-2.0-flash`
**呼び出し元**: GAS（UrlFetchApp）・Next.js Server Action（fetch）


## 口コミ返信生成

### エンドポイント

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}
```

### System Prompt

```
あなたはホットペッパービューティーに掲載している美容室のスタッフです。
お客様からいただいた口コミに対して、温かみのある返信文を生成してください。

## 条件
- 200文字前後
- 来店・口コミへのお礼を含める
- 施術内容（口コミ内容・メニュー）に具体的に言及する
- 再来店を促す一言を添える
- 文末は「スタッフ一同」で締める
- ネガティブな内容の場合は謝罪・改善姿勢を含める
- 返信文のみを出力し、説明や前置きは一切不要
```

### User Prompt

```
【トーン】{toneLabel}
【口コミ内容】{reviewBody}
【施術メニュー】{treatmentMenus}
【評価】総合{ratingOverall}・雰囲気{ratingAtmosphere}・接客{ratingService}・技術{ratingSkill}・メニュー{ratingPrice}
```

### TonePreset

| 値 | toneLabel |
|---|---|
| `polite` | 丁寧でフォーマルなトーンで |
| `casual` | 親しみやすくカジュアルなトーンで |
| `concise` | 簡潔にまとめて |

### リクエスト構造

```json
{
  "system_instruction": {
    "parts": [{ "text": "{SYSTEM_PROMPT}" }]
  },
  "contents": [
    {
      "parts": [{ "text": "{USER_PROMPT}" }]
    }
  ],
  "generationConfig": {
    "temperature": 0.8,
    "maxOutputTokens": 512
  }
}
```

### レスポンスの取り出し方

```typescript
const result = JSON.parse(response.getContentText())
const replyText = result.candidates[0].content.parts[0].text
```


## 呼び出し元別の実装

### GAS（UrlFetchApp）

```typescript
const response = UrlFetchApp.fetch(url, {
  method: 'post',
  contentType: 'application/json',
  payload: JSON.stringify(requestBody),
  muteHttpExceptions: true
})

if (response.getResponseCode() !== 200) {
  console.error('Gemini API error:', response.getContentText())
  throw new Error('Gemini API failed')
}
```

### Next.js Server Action（fetch）

```typescript
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestBody),
})

if (!response.ok) {
  throw new Error('Gemini API failed')
}
```


## プロンプト設計の判断理由

**System Promptに「返信文のみを出力」を明示する理由**
指定しないと「以下が返信文です。」などの前置きが付くことがある。コピペで即使えることが重要なので除外する。

**temperatureを0.8にする理由**
0.2〜0.4（低温）だと毎回同じような文章になりやすい。口コミ返信は口コミごとに異なる表現が望ましいため中〜高温に設定する。ただし1.0以上にすると文章が不自然になるリスクがある。

**ネガティブ口コミの判定をAIに任せる理由**
評価点数でネガティブを判定する方法もあるが、「総合5点だが文章はクレームに近い」ケースがある。AIに口コミ内容を読ませて判断させる方が精度が高い。


## フェーズ2: ブログ原稿生成（Vision）

※フェーズ2実装時に追記する

画像（ヘアスタイル写真）を入力してブログ原稿を生成する。
Gemini Vision APIを使用し、画像はbase64エンコードしてリクエストに含める。
