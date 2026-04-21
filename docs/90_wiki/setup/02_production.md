# 本番環境セットアップ

## 1. 対象範囲

ローカル開発が安定した後に、本番の Supabase / Vercel を用意する際の手順をまとめる。

## 2. Supabase本番プロジェクトの作成

1. https://supabase.com でプロジェクトを作成する
2. 本番のURL・Publishable keyを取得する

## 3. Supabase CLIの接続設定

```bash
supabase link --project-ref xxx
```

## 4. 本番DBへのマイグレーション適用

```bash
supabase db push
```

## 5. Vercel環境変数の設定

本番のURL・Publishable keyをVercelの環境変数に設定する。`.env.local` には書かない。

## 6. 本番確認

## 7. 注意事項
