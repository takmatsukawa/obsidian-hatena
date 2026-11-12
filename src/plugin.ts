import { type Editor, type MarkdownView, Plugin } from "obsidian";
import {
	type HatenaPluginSettings,
	type LegacyHatenaPluginSettings,
	DEFAULT_API_KEY_SECRET_ID,
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
		const data:
			| (Partial<HatenaPluginSettings> & LegacyHatenaPluginSettings)
			| null = await this.loadData();
		const { apiKey: legacyApiKey, ...rest } = data ?? {};
		this.settings = Object.assign({}, DEFAULT_SETTINGS, rest);

		if (legacyApiKey !== undefined) {
			await this.migrateLegacyApiKey(legacyApiKey);
		}
	}

	/**
	 * Moves the API key that older versions stored in plain text in data.json
	 * into Obsidian's SecretStorage, and removes it from data.json.
	 */
	private async migrateLegacyApiKey(legacyApiKey: string) {
		if (legacyApiKey.length && !this.settings.apiKeySecret) {
			const secretStorage = this.app.secretStorage;
			const existingIds = secretStorage.listSecrets();
			let id = DEFAULT_API_KEY_SECRET_ID;
			for (
				let i = 2;
				existingIds.includes(id) &&
				secretStorage.getSecret(id) !== legacyApiKey;
				i++
			) {
				id = `${DEFAULT_API_KEY_SECRET_ID}-${i}`;
			}
			secretStorage.setSecret(id, legacyApiKey);
			this.settings.apiKeySecret = id;
		}
		// Rewrite data.json without the plain-text apiKey field.
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getApiKey(): string | null {
		const apiKey = this.settings.apiKeySecret
			? this.app.secretStorage.getSecret(this.settings.apiKeySecret)
			: null;
		return apiKey?.length ? apiKey : null;
	}

	async generateToken() {
		const apiKey = this.getApiKey();
		const rootEndpoint = this.settings.rootEndpoint;
		if (!apiKey?.length || !rootEndpoint.length) {
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
