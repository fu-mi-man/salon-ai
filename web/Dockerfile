FROM node:24-slim

# pnpmのパス設定
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_STORE_DIR="/pnpm/store"
ENV npm_config_store_dir="/pnpm/store"

# 作業ディレクトリの設定
WORKDIR /app

# プロジェクトで固定した pnpm をグローバルに入れる。
RUN npm install -g pnpm@10.33.0

# pnpmストアの場所を固定（ビルド時・ランタイム共通）
# BuildKitキャッシュマウントのターゲットと一致させる
RUN pnpm config set store-dir "$PNPM_STORE_DIR" --global

# pnpm設定（ビルド対象パッケージの制御）とlockfileをコピー
# pnpm-workspace.yaml はネイティブビルドの許可/除外設定を含むため必須
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# lockfileに基づきストアへ事前フェッチ（ソースコード不要）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch
# フェッチ済みストアから，オフラインで再現性高くnode_modulesを生成
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --offline

# pnpmディレクトリとアプリディレクトリの所有権をnodeユーザーに変更
# rootでインストールしたnode_modules・pnpmストアをnodeユーザーで操作可能にする
RUN chown -R node:node /pnpm /app

# 非rootユーザー（node）で開発サーバーを動かす
USER node

# `docker compose run` で実行される pnpm は node ユーザー設定を見るため、
# 実行時にも store-dir が必ず一致するようにしておく。
RUN pnpm config set store-dir "$PNPM_STORE_DIR" --location=user

# Next.js 開発サーバーのポートを公開
EXPOSE 3000

# 開発サーバーの起動
CMD ["pnpm", "dev"]
