import { App, PluginSettingTab, Setting } from "obsidian";
import HatenaPlugin from "./main";

export interface HatenaPluginSettings {
	apiKey: string;
	rootEndpoint: string;
}

export const DEFAULT_SETTINGS: HatenaPluginSettings = {
	apiKey: "",
	rootEndpoint: "",
};

export class HatenaSettingTab extends PluginSettingTab {
	plugin: HatenaPlugin;

	constructor(app: App, plugin: HatenaPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("API Key")
			.setDesc("Hatena user API key.")
			.addText((text) =>
				text.setValue(this.plugin.settings.apiKey).onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}),
			);

		new Setting(containerEl)
			.setName("Root Endpoint")
			.setDesc("Hatena blog's AtomPub root endpoint.")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.rootEndpoint)
					.onChange(async (value) => {
						this.plugin.settings.rootEndpoint = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
