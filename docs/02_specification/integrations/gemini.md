# Gemini API 設計

**用途**: 口コミ返信文の生成（フェーズ1）・ブログ原稿生成（フェーズ2）
**モデル**: `gemini-2.0-flash`
**呼び出し元**: Next.js Server Action（fetch）


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
## 担当スタッフの返信例文
{toneExamples[0]}
---
{toneExamples[1]}
---
{toneExamples[2]}

## お客様の口コミ
{reviewBody}

上記の例文と同じ口調・文体で返信文を生成してください。
```

`toneExamples` はスタッフに登録された過去の返信文（few-shot）。登録件数が3件未満の場合は存在する分だけ含める。

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
