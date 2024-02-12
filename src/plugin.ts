import { Editor, MarkdownView, Plugin, Notice, requestUrl } from "obsidian";
import {
	HatenaPluginSettings,
	DEFAULT_SETTINGS,
	HatenaSettingTab,
} from "./settings";
import { getWsseHeader } from "./wsse";
import * as he from "he";

export default class HatenaPlugin extends Plugin {
	settings: HatenaPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "publish",
			name: "Publish this note",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const apiKey = this.settings.apiKey;
				const rootEndpoint = this.settings.rootEndpoint;
				if (!apiKey.length || !rootEndpoint.length) {
					new Notice("API Key or Root Endpoint is not set");
					return;
				}
				// rootEndpoint is like: https://blog.hatena.ne.jp/userId/userId.hatenablog.com/atom
				const userId = rootEndpoint.split("/")[3];
				if (!userId) {
					new Notice("Invalid Root Endpoint");
					return;
				}

				const file = view.file;
				if (!file) {
					new Notice("File not found");
					return;
				}

				const hatenaUri =
					view.app.metadataCache.getFileCache(file)?.frontmatter?.[
						"hatena-uri"
					];
				const { url, method } = hatenaUri
					? {
							url: hatenaUri,
							method: "PUT",
					  }
					: {
							url: `${rootEndpoint}/entry`,
							method: "POST",
					  };

				const title = file.name.replace(/\.md$/, "");
				let text = editor.getDoc().getValue();
				const position =
					view.app.metadataCache.getFileCache(file)?.frontmatterPosition;
				if (position) {
					const end = position.end.line + 1;
					text = text.split("\n").slice(end).join("\n");
				}

				// Replace internal link: [[text]] -> text
				text = text.replace(/\[\[(.+?)\]\]/g, "$1");

				const body = `<?xml version="1.0" encoding="utf-8"?>
				<entry xmlns="http://www.w3.org/2005/Atom"
					   xmlns:app="http://www.w3.org/2007/app">
				  <title>${he.escape(title)}</title>
				  <content type="text/plain">${he.escape(text)}</content>
				</entry>`;

				const token = await getWsseHeader({
					username: userId,
					password: apiKey,
				});

				const response = await requestUrl({
					url,
					method,
					contentType: "application/xml",
					headers: {
						"X-WSSE": token,
					},
					body,
				});

				if (response.status !== 201 && response.status !== 200) {
					new Notice("Failed to publish");
					return;
				}

				const memberUri = response.headers.location;
				if (memberUri) {
					view.app.fileManager.processFrontMatter(file, (fm) => {
						fm["hatena-uri"] = memberUri;
					});
				}

				new Notice("Published successfully!");
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
}
