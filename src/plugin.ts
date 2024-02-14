import {
	Editor,
	MarkdownView,
	Plugin,
	Notice,
	requestUrl,
	normalizePath,
} from "obsidian";
import {
	HatenaPluginSettings,
	DEFAULT_SETTINGS,
	HatenaSettingTab,
} from "./settings";
import { getWsseHeader } from "./wsse";
import * as he from "he";
import mime from "mime";

const fileNameRegex1 = /!\[\[(.+).((jpe?g|png|gif|svg|bmp|webp))]]/gi;

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

				const token = await getWsseHeader({
					username: userId,
					password: apiKey,
				});

				const file = view.file;
				if (!file) {
					new Notice("File not found");
					return;
				}

				new Notice("Publishing...");

				let text = editor.getValue();

				for (const match of text.matchAll(fileNameRegex1)) {
					const [link, basename, extension] = match;
					const fileName = `${basename}.${extension}`;
					// Base64 encode the file
					const fileBinaly = await view.app.vault.adapter.readBinary(
						normalizePath(fileName),
					);
					const base64File = Buffer.from(fileBinaly).toString("base64");
					const fileMime = mime.getType(extension);

					const postUrl = "https://f.hatena.ne.jp/atom/post";
					const body = `<entry xmlns="http://purl.org/atom/ns#">
					<dc:subject>Hatena Blog</dc:subject>
					<title>${he.escape(fileName)}</title>
					<content mode="base64" type="${fileMime}">${base64File}</content>
					</entry>`;
					const response = await requestUrl({
						url: postUrl,
						method: "POST",
						contentType: "application/xml",
						headers: {
							"X-WSSE": token,
							Accept: "application/x.atom+xml, application/xml, text/xml, */*",
						},
						body,
					});
					if (response.status !== 201 && response.status !== 200) {
						new Notice("Failed to upload image");
						return;
					}
					// Get the image id
					const parser = new DOMParser();
					const xmlDoc = parser.parseFromString(response.text, "text/xml");
					const imageId =
						xmlDoc.getElementsByTagName("hatena:syntax")[0].textContent;
					if (imageId) {
						text = text.replace(link, `[${imageId}]`);
					}
				}

				const position =
					view.app.metadataCache.getFileCache(file)?.frontmatterPosition;
				if (position) {
					const end = position.end.line + 1;
					text = text.split("\n").slice(end).join("\n");
				}

				text = replaceInternalLink(text);
				const title = file.name.replace(/\.md$/, "");

				const body = `<?xml version="1.0" encoding="utf-8"?>
				<entry xmlns="http://www.w3.org/2005/Atom"
					   xmlns:app="http://www.w3.org/2007/app">
				  <title>${he.escape(title)}</title>
				  <content type="text/plain">${he.escape(text)}</content>
				</entry>`;

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

/**
 * [[link]] -> link
 * @param text
 * @returns
 */
const replaceInternalLink = (text: string) =>
	text.replace(/\[\[(.+?)\]\]/g, "$1");
