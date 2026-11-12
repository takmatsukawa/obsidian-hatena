# Obsidian Hatena Blog Publisher

[English](https://github.com/takmatsukawa/obsidian-hatena/blob/master/README.md) | 日本語

[Obsidian](https://obsidian.md/)のノートを[はてなブログ](https://hatenablog.com/)に直接投稿できます。

## 初期設定

あらかじめ、はてなブログの[編集モード](https://help.hatenablog.com/entry/editing-mode)を「Markdownモード」に設定してください。
[基本設定](http://blog.hatena.ne.jp/my/config)画面の「編集モード」か、各ブログの設定画面の「編集モード」で設定できます。

このプラグインを動作させるには、はてなブログのRoot endpointとAPI Keyを設定する必要があります。

このプラグインにはObsidian 1.11.4以降が必要です。

**設定:**

- `API Key`: はてなのアカウント設定画面から取得できます。API KeyはObsidianのKeychain（シークレットストレージ）に保存され、プラグインの設定ファイル（`data.json`）には書き込まれません。
- `Root Endpoint`: はてなブログの設定画面から取得できます： 詳細設定 > AtomPub

**API Keyの設定方法:**

1. 設定 > Hatena Blog Publisher を開き、`API Key` の `Link...` をクリックします。
2. `ID` にシークレットの名前（小文字・数字・ハイフンのみ。例: `hatena-api-key`）を、`Secret` にAPI Keyを入力して `Save` をクリックします。

あとでAPI Keyを変更する場合（はてな側で再発行したときなど）は、プラグインの設定画面でAPI Key欄の `×` をクリックして現在のキーを外し、表示される `Link...` から同じ手順で新しいAPI Keyを登録してください。

## 使い方

**コマンド:**

- `Publish this note`: 現在アクティブなノートをはてなブログに投稿する
- `Post this note as a draft`: 現在アクティブなノートをはてなブログに下書きとして投稿する
- `Delete the article of this note`: 現在アクティブなノートの記事をはてなブログから削除する
- `Insert table of contents`: 目次を挿入する。はてなブログ画面でのみ目次として表示される

## Tips

### コメント

ノート中のテキストを `%%` で囲むとコメントを追加できます。コメントはObsidian編集画面でのみ表示され、はてなブログには公開されません。

```markdown
これは%%インライン%%コメントです。

%%
これはブロックコメントです。

ブロックコメントは複数行にまたがることができます。

コメント中でも他のノートに[[リンク]]することができます。
%%
```

## フィードバック

何か問題が発生した場合、または新しい機能をリクエストしたい場合は、[こちら](https://github.com/takmatsukawa/obsidian-hatena/issues/new)から登録するか[作者](https://twitter.com/takmatsukawa)に連絡ください。
