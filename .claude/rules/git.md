# Git

- コミット: Conventional Commits 形式（feat:, fix:, docs:, refactor:, chore: 等）
- ブランチ: feat/xxx, fix/xxx, docs/xxx 形式
- PR 作成時は `.github/pull_request_template.md` のテンプレートを使用する

## コミットメッセージの body

複数の変更や意図の説明が必要な場合は，1行目にサマリー，空行を挟んで body を記述する。

body を書く基準: コードを読んでも「なぜそうしたか」が分からない設計判断（意図的なアクセシビリティ対応，意図的に state を使わない等）は body に残す。差分から自明なことは書かない。

## ブランチ戦略

- 独立した作業（機能・ドキュメント・設定変更）は必ず main から切る
- 進行中のブランチに依存する作業のみ、そのブランチから切る

## Worktree

- worktree を作るときは必ず `-b` でブランチ名を指定する（detached HEAD 禁止）
- パス: メインリポジトリと同階層（シブリング）に `<repo>-<branch>` の形式で置く
  ```bash
  git worktree add -b <branch> ../<repo>-<branch-name> main
  # 例: git worktree add -b docs/setup ../shiori-docs-setup main
  ```
- 用途: 作業中のブランチを止めずに別ブランチを同時に扱いたいとき
  - ホットフィックス，PR レビュー，別ブランチへの独立したコミット など
- 作業完了・PR マージ後は必ず削除する
  ```bash
  git worktree remove ../<repo>-<branch-name>
  ```

## main の最新化（rebase）

- push する前に毎回 `git fetch origin` を実行する
- IMPORTANT: fetch 結果の出力を確認し、`origin/main` に新しいコミットがある場合のみ `git rebase origin/main` を実行する。更新がなければ rebase コマンドは実行しない
- push 時、rebase で履歴を書き換えた場合は `--force-with-lease` を付ける。新しいコミットを積んだだけなら通常の `git push`
- merge は使わない（履歴が汚くなるため）

## PR コメントの取得

- IMPORTANT: PR のレビューコメントを取得する際は、以下の3つのエンドポイントを全て確認すること（1つでも省略しない）
  - `repos/{owner}/{repo}/issues/{pr}/comments` — 通常コメント（CodeRabbit サマリ等）
  - `repos/{owner}/{repo}/pulls/{pr}/comments` — インラインレビューコメント（コード行への指摘）
  - `repos/{owner}/{repo}/pulls/{pr}/reviews` — レビューサマリ（Approve/Request changes の本文）
