import { Editor, MarkdownView, Plugin } from "obsidian";
import {
	HatenaPluginSettings,
	DEFAULT_SETTINGS,
	HatenaSettingTab,
} from "./settings";
import { postCommand } from "./commands";

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

		this.addSettingTab(new HatenaSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
