import { App, PluginSettingTab, SecretComponent, Setting } from "obsidian";
import HatenaPlugin from "./main";

export interface HatenaPluginSettings {
	/**
	 * Name (ID) of the secret in Obsidian's SecretStorage that holds the
	 * Hatena API key. The API key itself is never stored in data.json.
	 */
	apiKeySecret: string;
	rootEndpoint: string;
}

/**
 * Settings format of versions <= 1.1.1, which stored the API key in plain
 * text inside data.json.
 */
export interface LegacyHatenaPluginSettings {
	apiKey?: string;
}

export const DEFAULT_API_KEY_SECRET_ID = "hatena-api-key";

export const DEFAULT_SETTINGS: HatenaPluginSettings = {
	apiKeySecret: "",
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

		containerEl.createEl("h2", { text: "Hatena Blog Publisher Settings" });

		new Setting(containerEl)
			.setName("API Key")
			.setDesc("Hatena user API key.")
			.addComponent((el) =>
				new SecretComponent(this.app, el)
					.setValue(this.plugin.settings.apiKeySecret)
					.onChange(async (value) => {
						this.plugin.settings.apiKeySecret = value ?? "";
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
