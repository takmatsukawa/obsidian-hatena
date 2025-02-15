import { type Editor, type MarkdownView, Plugin } from "obsidian";
import {
	type HatenaPluginSettings,
	DEFAULT_SETTINGS,
	HatenaSettingTab,
} from "./settings";
import { insertTocCommand } from "./commands/insertTocCommand";
import { postCommand } from "./commands/postCommand";
import {
	deleteCommand,
	isDeleteCommandPossible,
} from "./commands/deleteCommand";
import { getWsseHeader } from "./utils/wsse";

export default class HatenaPlugin extends Plugin {
	settings: HatenaPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "publish",
			name: "Publish this note",
			editorCallback: (editor: Editor, view: MarkdownView) =>
				postCommand(this, editor, view),
		});

		this.addCommand({
			id: "draft",
			name: "Post this note as a draft",
			editorCallback: (editor: Editor, view: MarkdownView) =>
				postCommand(this, editor, view, true),
		});

		this.addCommand({
			id: "insert-toc",
			name: "Insert table of contents",
			editorCallback: insertTocCommand,
		});

		this.addCommand({
			id: "delete",
			name: "Delete the article of this note",
			editorCheckCallback: (
				checking: boolean,
				editor: Editor,
				view: MarkdownView,
			) => {
				if (checking) {
					return isDeleteCommandPossible(view);
				}

				deleteCommand(this, view);

				return true;
			},
		});

		this.addSettingTab(new HatenaSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async generateToken() {
		const apiKey = this.settings.apiKey;
		const rootEndpoint = this.settings.rootEndpoint;
		if (!apiKey.length || !rootEndpoint.length) {
			return null;
		}
		// rootEndpoint is like: https://blog.hatena.ne.jp/userId/userId.hatenablog.com/atom
		const userId = rootEndpoint.split("/")[3];
		if (!userId) {
			return null;
		}

		return getWsseHeader({
			username: userId,
			password: apiKey,
		});
	}
}
