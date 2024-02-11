import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, request } from 'obsidian';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	apiKey: string;
	rootEndpoint: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	apiKey: '',
	rootEndpoint: '',
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		// const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
		// 	// Called when the user clicks the icon.
		// 	new Notice('This is a notice!!!!!!');
		// });
		// Perform additional things with the ribbon
		// ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'publish',
			name: 'Publish this note',
			editorCallback: async (editor: Editor, view: MarkdownView) => {

				const apiKey = this.settings.apiKey;
				const rootEndpoint = this.settings.rootEndpoint;
				const userId =
					rootEndpoint.split('/')[3];

				console.log({ apiKey, rootEndpoint, userId })

				const response = await request({
					url: `${rootEndpoint}/entry`,
					method: 'GET',
					contentType: 'application/xml',
					headers: {
						Authorization: `Basic ${btoa(`${userId}:${apiKey}`)}`,
					},
				})

				console.log(response);
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('API Key')
			.setDesc('Hatena user API key.')
			.addText(text => text
				.setValue(this.plugin.settings.apiKey)
				.onChange(async (value) => {
					this.plugin.settings.apiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Root Endpoint')
			.setDesc('Hatena blog\'s AtomPub root endpoint.')
			.addText(text => text
				.setValue(this.plugin.settings.rootEndpoint)
				.onChange(async (value) => {
					this.plugin.settings.rootEndpoint = value;
					await this.plugin.saveSettings();
				}));
	}
}
