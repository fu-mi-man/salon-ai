# パッケージ管理

パッケージを追加・更新するときは以下の手順で実行する。
`docker compose exec` でコンテナに入って `pnpm add` するのは禁止。

```bash
docker compose down
docker compose build web                                   # 最新の Dockerfile / pnpm 設定を反映
docker compose run --rm web pnpm add <package>             # 依存追加
docker compose run --rm web pnpm add -D <package>          # 開発依存追加
docker compose up --build -d
```

`docker volume prune` は常用手順ではない。`ERR_PNPM_UNEXPECTED_STORE` や壊れた `node_modules` volume が残っているときだけ実行する。

詳細は `docs/90_wiki/dev-guide.md` のパッケージ管理セクションを参照。

## shadcn/ui コンポーネント追加

コンポーネントを追加するときはコンテナ内で実行する。

```bash
docker compose exec web pnpm dlx shadcn@latest add <component>
```
