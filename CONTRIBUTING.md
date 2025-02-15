# How to contribute to Obsidian Hatena Blog Publisher

## Quick starting guide for devs

- Clone this repo to a local development folder. For convenience, you can place this folder in your `.obsidian/plugins` folder.
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile the plugin.
- Reload Obsidian to load the new version of the plugin.
- Enable plugin in settings window.
- For updates to the Obsidian API run `npm update` in the command line under your repo folder.

## Releasing new releases

- `npm version patch|minor|major` to bump the version number.
- `git push && git push --tags` to push the new version to GitHub.
- Check the draft release on GitHub to make sure it looks good and publish it.
