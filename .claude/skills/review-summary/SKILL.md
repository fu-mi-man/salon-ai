---
name: review-summary
description: PRに付いたレビューコメントを漏れなく収集し、指摘内容と対応方針を整理するスキル。「CodeRabbitの指摘まとめて」「レビュー結果を確認したい」「指摘事項と対応方針を出して」「レビューどうだった？」「PRのコメント全部見て」「レビューに返信して」など、レビュー結果の確認・整理・返信を求められたら必ずこのスキルを使う。GitHub のコメントは通常コメント・インラインレビュー・レビューサマリの3箇所に分散しており、1箇所だけ見ると取りこぼしが起きる。このスキルは3箇所全てを確認することで漏れを防ぐ。
---

# review-summary

PR に付いた全てのレビューコメントを漏れなく収集し、指摘内容と対応方針を整理して報告する。

## Step 1: 対象 PR の特定

PR 番号が指定されていればそれを使う。指定がなければ現在のブランチから特定する:

```bash
gh pr view --json number,baseRepository
```

`number`（PR 番号）と `baseRepository.nameWithOwner`（`owner/repo` 形式）を取得する。

## Step 2: 全コメントの取得

以下の3エンドポイントを必ず全て叩く。1つでも省略しない。

```bash
# 1. 通常コメント（会話コメント・CodeRabbit サマリはここ）
gh api repos/{owner}/{repo}/issues/{number}/comments

# 2. インラインレビューコメント（コード行への指摘・修正提案はここ）
gh api repos/{owner}/{repo}/pulls/{number}/comments

# 3. レビューサマリ（Approve / Request changes の本文はここ）
gh api repos/{owner}/{repo}/pulls/{number}/reviews
```

レスポンスが大きい場合は `--jq` でフィールドを絞る:

```bash
gh api repos/{owner}/{repo}/pulls/{number}/comments \
  --jq '[.[] | {id, path, line: .original_line, body, user: .user.login}]'
```

## Step 3: 指摘事項の整理

3エンドポイント全てがコメント0件の場合は、レビューがまだ付いていない可能性がある。その旨をユーザーに伝えて終了する。

コメントがある場合、以下を除外してから整理する:

**除外するもの**
- bot による自動コメント（walkthrough、sequence diagram、pre-merge checks など）
- `✅ Addressed` と記されている解決済みの指摘

**整理の形式**

レビュアーごと（CodeRabbit、人間のレビュアー名など）にグループ化し、各指摘を列挙する:

- 対象ファイル・行（インラインコメントの場合）
- 指摘内容の要約
- 種別：バグ／セキュリティ／設計／パフォーマンス／スタイル

## Step 4: 対応方針の提案

全ての未解決指摘に対して以下を示す:

| 優先度 | 対応要否 | 修正方針 |
|--------|----------|----------|
| 高（バグ・セキュリティ） / 中（設計・パフォーマンス） / 低（スタイル） | 対応すべき or 対応不要（理由付き） | 対応する場合の具体的な方法 |

最後に「対応が必要な指摘」と「スキップ可能な指摘」に分けてサマリを出す。
