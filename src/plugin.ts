import { Editor, MarkdownView, Plugin, Notice, requestUrl } from "obsidian";
import {
	HatenaPluginSettings,
	DEFAULT_SETTINGS,
	HatenaSettingTab,
} from "./settings";

export default class HatenaPlugin extends Plugin {
	settings: HatenaPluginSettings;

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
			id: "publish",
			name: "Publish this note",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const apiKey = this.settings.apiKey;
				const rootEndpoint = this.settings.rootEndpoint;
				// rootEndpoint is like: https://blog.hatena.ne.jp/userId/userId.hatenablog.com/atom
				const userId = rootEndpoint.split("/")[3];

				const file = view.file;
				if (!file) {
					return;
				}

				let url = `${rootEndpoint}/entry`;
				let method = "POST";
				const hatenaUri = view.app.metadataCache.getFileCache(file)?.frontmatter?.["hatena-uri"];
				if (hatenaUri) {
					url = hatenaUri;
					method = "PUT";
				}

				const title = file.name.replace(/\.md$/, "");
				let text = editor.getDoc().getValue()
				const position = view.app.metadataCache.getFileCache(file)?.frontmatterPosition;
				if (position) {
					const end = position.end.line + 1;
					text = text.split("\n").slice(end).join("\n")
				}
				const body = `<?xml version="1.0" encoding="utf-8"?>
				<entry xmlns="http://www.w3.org/2005/Atom"
					   xmlns:app="http://www.w3.org/2007/app">
				  <title>${title}</title>
				  <content type="text/plain">${text}</content>
				</entry>`;

				const response = await requestUrl({
					url,
					method,
					contentType: "application/xml",
					headers: {
						Authorization: `Basic ${btoa(`${userId}:${apiKey}`)}`,
					},
					body,
				});

				if (response.status !== 201 && response.status !== 200) {
					new Notice("Failed to publish!");
					return;
				}

				const memberUri = response.headers.location;
				if (memberUri) {
					view.app.fileManager.processFrontMatter(file, (fm) => {
						fm["hatena-uri"] = memberUri;
					})
				}

				new Notice("Published successfully!");
				
			},
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
		this.addSettingTab(new HatenaSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
