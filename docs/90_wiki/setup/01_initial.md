# 初期構築

**プロジェクト作成時に一度だけ実行する。通常の開発では参照不要。**

前提: Docker Desktop・miseがインストール済みであること。

## 1. miseのセットアップ

プロジェクトルートで実行する。

```bash
cd ~/dev/salon-ai

mise use node@24
mise use pnpm@10.30.3
mise use supabase@2.84.6
```

`salon-ai/mise.toml` が生成される。バージョンが固定されていることを確認する。

```bash
mise list
# node     24.x.x  ~/dev/salon-ai/mise.toml  24
# pnpm     10.30.3 ~/dev/salon-ai/mise.toml  10.30.3
# supabase 2.84.6  ~/dev/salon-ai/mise.toml  2.84.6
```

## 2. Next.jsプロジェクトを作成

`web/` は `create-next-app` が空ディレクトリを要求するため、一時Dockerfileを使って作成する。

### 2-1. 一時Dockerfileを作成

プロジェクトルートに作成する。

```dockerfile
FROM node:24-slim
RUN npm install -g pnpm@10.30.3
WORKDIR /app
```

### 2-2. 一時イメージをビルド

```bash
docker build -t salon-ai-init .
```

### 2-3. Next.jsプロジェクトを作成

```bash
mkdir web
docker run --rm -it -v $(pwd)/web:/app salon-ai-init pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --no-eslint \
  --app \
  --src-dir \
  --import-alias='@/*'
```

対話プロンプトが出たらすべてEnterでデフォルトを選択する。

### 2-4. 一時イメージ・Dockerfileを削除

```bash
docker rmi salon-ai-init
rm Dockerfile
```

## 3. web/Dockerfileを作成

`web/Dockerfile` を作成する。
CorepackはNode.js 25以降で削除されるため、npmで直接pnpmをインストールする方針をとる。

```dockerfile
FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN npm install -g pnpm@10.30.3

RUN pnpm config set store-dir /pnpm/store --global

COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

RUN chown -R node:node /pnpm /app
USER node

EXPOSE 3000
CMD ["pnpm", "dev"]
```

## 4. compose.yamlを作成

プロジェクトルートに `compose.yaml` を作成する。
SupabaseはCLIで管理するためDBコンテナは不要。

```yaml
services:
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: salon-ai-web
    environment:
      - NODE_ENV=development
    env_file:
      - ./web/.env.local
    ports:
      - "3000:3000"
    volumes:
      - ./web:/app
      - /app/node_modules
    stdin_open: true
    tty: true
```

## 5. 環境変数ファイルを作成

```bash
cp web/.env.example web/.env.local
```

`.env.local` に以下を記載する。値はSupabase起動後（手順7）に取得する。

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=（supabase startで表示されるanon key）
```

**Service Role Keyはここに書かない。** GASのスクリプトプロパティのみで管理する。

## 6. gasディレクトリをセットアップ

```bash
mkdir -p gas/src
cd gas
pnpm init
pnpm add -D @types/google-apps-script typescript @google/clasp
```

`gas/tsconfig.json` を作成する。

```json
{
  "compilerOptions": {
    "target": "ES2019",
    "lib": ["ES2019"],
    "module": "CommonJS",
    "strict": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
```

claspでGASプロジェクトを作成する（Googleアカウントでのログインが必要）。

```bash
clasp login
clasp create --type standalone --title "salon-ai-gas"
```

`.clasp.json` が生成されることを確認する。

```bash
cd ..  # プロジェクトルートに戻る
```

## 7. Supabaseをセットアップ

```bash
supabase init
```

`supabase/` ディレクトリが生成される。

```bash
supabase start
```

初回は必要なDockerイメージをpullするため数分かかる。
完了するとローカルの接続情報が表示される。

```
API URL: http://127.0.0.1:54321
anon key: eyJ...
service_role key: eyJ...
Studio URL: http://127.0.0.1:54323
```

`web/.env.local` のURLとanon keyをこの値に書き換える。

## 8. テーブルを作成

```bash
supabase migration new create_initial_tables
```

`supabase/migrations/` にSQLファイルが生成される。
テーブル定義は `docs/01_requirements/03_data.md` を参照してSQLを記述する。

```bash
supabase db reset
```

http://127.0.0.1:54323 でStudioが開く。テーブルが作成されていることを確認する。

## 9. Next.jsを起動

```bash
docker compose up --build
```

http://localhost:3000 にアクセスできれば完了。

## 10. 本番Supabaseの設定

ローカル開発が安定したら本番環境を用意する。

1. https://supabase.com でプロジェクトを作成する
2. 本番のURL・anon keyを取得する
3. Vercelの環境変数に設定する（`.env.local` には書かない）
4. マイグレーションを本番に適用する

```bash
supabase link --project-ref xxx
supabase db push
```

## 日常の開発フロー

セットアップ完了後の通常起動手順。

```bash
# Supabase起動（ターミナル1）
supabase start

# Next.js起動（ターミナル2）
docker compose up

# 停止
docker compose down
supabase stop
```
