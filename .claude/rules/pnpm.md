# パッケージ管理

パッケージを追加・更新するときは以下の手順で実行する。
`docker compose exec` でコンテナに入って `pnpm add` するのは禁止。

```bash
docker compose down
docker volume prune                                        # 孤立した anonymous volume を削除（store 競合を防ぐ）
docker compose run --rm web pnpm add <package>             # 依存追加
docker compose run --rm web pnpm add -D <package>          # 開発依存追加
docker compose up --build -d
```

詳細は `docs/90_wiki/dev-guide.md` のパッケージ管理セクションを参照。

## shadcn/ui コンポーネント追加

コンポーネントを追加するときはコンテナ内で実行する。

```bash
docker compose exec web pnpm dlx shadcn@latest add <component>
```
