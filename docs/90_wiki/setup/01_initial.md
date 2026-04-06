# 初期構築

**プロジェクト作成時に一度だけ実行する。通常の開発では参照不要。**

前提: Docker Desktop・miseがインストール済みであること。

## 1. miseのセットアップ

プロジェクトルートで実行する。

```bash
cd ~/dev/salon-ai

mise use node@24
mise use pnpm@10.33.0
mise use supabase@2.84.2
```

既存の `mise.toml` を clone してきた環境でツールだけ揃えたい場合は `mise install` を実行する。

`salon-ai/mise.toml` が生成される。バージョンが固定されていることを確認する。

```bash
mise list
# node     24.x.x  ~/dev/salon-ai/mise.toml  24
# pnpm     10.33.0 ~/dev/salon-ai/mise.toml  10.33.0
# supabase 2.84.2  ~/dev/salon-ai/mise.toml  2.84.2
```

## 2. Next.jsプロジェクトを作成

`web/` は `create-next-app` が空ディレクトリを要求するため、一時Dockerfileを使って作成する。  
`create-next-app` の最近の版は、引数を渡していれば対話プロンプトを出さずにデフォルトで進むことがある。

### 2-1. 一時Dockerfileを作成

プロジェクトルートに作成する。

```dockerfile
FROM node:24-slim
RUN npm install -g pnpm@10.33.0
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

必要なオプションは引数で渡しているため、対話なしで完了して問題ない。

### 2-4. `web/Dockerfile` を作成してから一時ファイルを削除

`web/` 作成直後に、一時 `Dockerfile` をベースに `web/Dockerfile` を作成する。  
人間が後から書き直すより、この時点で転記しておく方が確実。

```bash
cp Dockerfile web/Dockerfile
docker rmi salon-ai-init
rm Dockerfile
```

### 2-5. `web/.gitignore` に pnpm ストアを追記

`create-next-app` 実行時に `web/.pnpm-store/` が作成されることがあるため、`web/.gitignore` に追記しておく。

```gitignore
/.pnpm-store
```

## 3. web/Dockerfileを更新

手順2-4で作成した `web/Dockerfile` を、開発用の内容に更新する。  
CorepackはNode.js 25以降で削除されるため、npmで直接pnpmをインストールする方針をとる。

```dockerfile
FROM node:24-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN npm install -g pnpm@10.33.0

RUN pnpm config set store-dir /pnpm/store --global

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
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

`env_file` は `web/.env.local` の内容をコンテナの環境変数として読み込むための設定。  
Next.js 側で `NEXT_PUBLIC_*` を参照できるようにしている。

ホスト側の `3000` ポートが既に使用中で起動できない場合は、`ports` の左側だけを `3001:3000` のように変更して回避する。

## 5. Supabaseをセットアップ

```bash
supabase init
```

`supabase/` ディレクトリが生成される。

```bash
supabase start
```

初回は必要なDockerイメージをpullするため数分かかる。  
`WARN: no files matched pattern: supabase/seed.sql` は seed ファイル未作成の初期状態では問題ない。  
完了するとローカルの接続情報が表示される。

```text
Studio: http://127.0.0.1:54323
Project URL: http://127.0.0.1:54321
Publishable key: sb_publishable_...
Secret key: sb_secret_...
```

## 6. 環境変数ファイルを作成

まず `web/.env.example` に共有する環境変数のキーだけを記載する。

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

ローカル用の `web/.env.local` はこれをコピーして作成し、手順5で取得した Publishable key を反映する。

```bash
cp web/.env.example web/.env.local
```

**Secret keyはここに書かない。** GASのスクリプトプロパティのみで管理する。

## 7. テーブルを作成

```bash
supabase migration new create_initial_tables
```

`supabase/migrations/` にSQLファイルが生成される。  
テーブル定義は `docs/01_requirements/03_data.md` を参照してSQLを記述する。

```bash
supabase db reset
```

ブラウザで http://127.0.0.1:54323 を開き、テーブルが作成されていることを確認する。

## 8. Next.jsを起動

```bash
docker compose up --build
```

http://localhost:3000 にアクセスできれば完了。

`3000` が埋まっていて `3001:3000` に変更した場合は、`http://localhost:3001` にアクセスする。

## 9. gasディレクトリをセットアップ

```bash
mkdir -p gas/src
cd gas
pnpm init
pnpm add -D @types/google-apps-script typescript @google/clasp
```

プロジェクトルートの `.gitignore` に、GAS の依存関係と生成物を追記する。

```gitignore
gas/node_modules/
gas/dist/
gas/.clasp.json
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
pnpm exec clasp login
pnpm exec clasp create --type standalone --title "salon-ai-gas"
```

`.clasp.json` が生成されることを確認する。

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
