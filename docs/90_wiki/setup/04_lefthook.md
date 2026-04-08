
## lefthook

Go製のGit hooks管理ツール。  
`git commit` 時にlint・型チェックを自動実行し，エラーがあればコミットを中断する。

> 公式ドキュメント: https://lefthook.dev

### 1. lefthook 本体のインストール

git はホストで動くため，lefthook はホストにインストールする。

**macOS:**

```bash
brew install lefthook
```

**WSL2 / Ubuntu / Debian:**

```bash
curl -1sLf 'https://dl.cloudsmith.io/public/evilmartians/lefthook/setup.deb.sh' | sudo -E bash
sudo apt install lefthook
```

### 2. lefthook.yml を作成

`lefthook.yml`（プロジェクトルート）:

```yaml
pre-commit:
  piped: true
  commands:
    typecheck:
      priority: 1
      run: docker compose exec -T web pnpm typecheck
    lint:
      priority: 2
      run: docker compose exec -T web pnpm lint
```

| 設定 | 値 | 理由 |
| --- | --- | --- |
| `pre-commit` | - | `git commit` 実行時に発火するフック |
| `piped` | `true` | 順次実行。前のコマンドが失敗したら後続をスキップ |
| `priority` | `1`, `2` | lefthook はデフォルトでコマンド名をアルファベット順に実行するため，明示的に順序を指定 |
| `-T` | `docker compose exec` のオプション | 非対話モード（TTYなし）。Git hooks はターミナルを持たないため必須 |
| `typecheck` → `lint` の順 | - | 型エラーを先に検出する方が原因特定しやすい |

> pnpm コマンドはコンテナ内で実行する。  
git はホストで動くため，`docker compose exec` 経由で呼び出す。

### 3. lefthook install して Git hooks を有効化

プロジェクトルート（`.git` と `lefthook.yml` があるディレクトリ）で実行する。

```bash
lefthook install
```

`.git/hooks/pre-commit` が生成されれば完了。

### 4. 動作確認

```bash
git add .
git commit -m "test"
```

typecheck → lint の順で実行され，エラーがなければコミットが完了する。

### 5. チームへの共有

`lefthook.yml` はgit管理されるため，clone した時点で設定は共有済み。  
各自が[1. lefthook 本体のインストール](#1-lefthook-本体のインストール)と[3. lefthook install して Git hooks を有効化](#3-lefthook-install-して-git-hooks-を有効化)を実行するだけで有効になる。
