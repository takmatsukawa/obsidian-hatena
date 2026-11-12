# Obsidian Hatena Blog Publisher

English | [日本語](https://github.com/takmatsukawa/obsidian-hatena/blob/master/README-JP.md)

Post directly to your [Hatena Blog](https://hatenablog.com/) from [Obsidian](https://obsidian.md/).

## Initial setup

Please set the [editing mode](https://help.hatenablog.com/entry/editing-mode) of Hatena Blog to "Markdown mode" in advance.
You can set it in the "Editing Mode" of the [Basic Settings page](http://blog.hatena.ne.jp/my/config) or in the "Editing Mode" of each blog's settings page.

For this plugin to work, you will need to provide your Hatena blog's root endpoint and API key.

This plugin requires Obsidian 1.11.4 or later.

**Settings:**

- `API Key`: You can obtain the API key from Hatena account settings page. The API key is stored in Obsidian's Keychain (secret storage), not in the plugin's settings file (`data.json`).
- `Root Endpoint`: You can obtain the root endpoint from Hatena Blog settings page: Advanced > AtomPub.

**Setting the API key:**

1. Open Settings > Hatena Blog Publisher and click `Link...` next to `API Key`.
2. Enter an `ID` for the secret (lowercase letters, numbers and dashes only, e.g. `hatena-api-key`) and paste your API key into `Secret`, then click `Save`.

To change the API key later (for example, after regenerating it on Hatena), click `Link...` again, delete the old secret, and add a new one with the new API key in the same way.

## How to Use

**Commands:**

- `Publish this note`: Posts the current active note to Hatena Blog.
- `Post this note as a draft`: Posts the current active note to Hatena Blog as a draft.
- `Delete the article of this note`: Deletes the article of the current active note from Hatena Blog.
- `Insert table of contents`: Insert a table of contents. It will only appear as a table of contents on the Hatena Blog screen.

## Tips

### Comments

You can add comments by wrapping text with `%%` in the note. Comments are only visible in Obsidian's Editing view and will not be published to Hatena Blog.

```markdown
This is an %%inline%% comment.

%%
This is a block comment.

Block comments can span multiple lines.

You can [[link]] to other notes in the comment.
%%
```

## Feedback

If you encounter any issues or would like to request a new feature, please submit them [here](https://github.com/takmatsukawa/obsidian-hatena/issues/new) or notice [me](https://twitter.com/takmatsukawa).
