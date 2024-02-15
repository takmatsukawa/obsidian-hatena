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

const fileNameRegex1 = /(jpe?g|png|gif|svg|bmp|webp)$/i;

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

				const domParser = new DOMParser();
				let text = editor.getValue();

				const meta = view.app.metadataCache.getFileCache(file);

				if (meta?.embeds) {
					for (const embed of meta.embeds) {
						const { original, link } = embed;
						if (!fileNameRegex1.test(link)) {
							continue;
						}
						const source = view.app.metadataCache.getFirstLinkpathDest(
							link,
							file.path,
						);
						if (!source) {
							continue;
						}

						// Base64 encode the file
						const fileBinaly = await view.app.vault.adapter.readBinary(
							normalizePath(source.path),
						);
						const base64File = Buffer.from(fileBinaly).toString("base64");
						const fileMime = mime.getType(source.extension);

						const postUrl = "https://f.hatena.ne.jp/atom/post";
						const body = `<entry xmlns="http://purl.org/atom/ns#">
						<dc:subject>Hatena Blog</dc:subject>
						<title>${he.escape(source.basename)}</title>
						<content mode="base64" type="${fileMime}">${base64File}</content>
						</entry>`;
						const response = await requestUrl({
							url: postUrl,
							method: "POST",
							contentType: "application/xml",
							headers: {
								"X-WSSE": token,
								Accept:
									"application/x.atom+xml, application/xml, text/xml, */*",
							},
							body,
						}).catch((e) => {
							console.error(e);
							return e;
						});
						if (response.status !== 201 && response.status !== 200) {
							new Notice("Failed to upload image");
							return;
						}
						// Get the image id
						const xmlDoc = domParser.parseFromString(response.text, "text/xml");
						const imageId =
							xmlDoc.getElementsByTagName("hatena:syntax")[0].textContent;
						if (imageId) {
							const re = new RegExp(escapeRegExp(original), "g");
							text = text.replace(re, `[${imageId}]`);
						}
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

				const savedMemberUri =
					view.app.metadataCache.getFileCache(file)?.frontmatter?.[
						"hatena-member-uri"
					];
				const { url, method } = savedMemberUri
					? {
							url: savedMemberUri,
							method: "PUT",
					  }
					: {
							url: `${rootEndpoint}/entry`,
							method: "POST",
					  };

				let response = await requestUrl({
					url,
					method,
					contentType: "application/xml",
					headers: {
						"X-WSSE": token,
					},
					body,
				}).catch((e) => {
					console.error(e);
					return e;
				});

				if (savedMemberUri && response.status === 404) {
					// The member uri is not found. It may be deleted.
					// So, create a new entry.
					response = await requestUrl({
						url: `${rootEndpoint}/entry`,
						method: "POST",
						contentType: "application/xml",
						headers: {
							"X-WSSE": token,
						},
						body,
					}).catch((e) => {
						console.error(e);
						return e;
					});
				}
				
				if (response.status !== 201 && response.status !== 200) {
					new Notice("Failed to publish");
					return;
				}

				const memberUri = response.headers.location;

				const xmlDoc = domParser.parseFromString(response.text, "text/xml");
				const alternateLink = xmlDoc.querySelector('link[rel="alternate"]');
				const hatenaUrl = alternateLink?.getAttribute("href");

				view.app.fileManager.processFrontMatter(file, (fm) => {
					if (memberUri) {
						fm["hatena-member-uri"] = memberUri;
					}
					if (hatenaUrl) {
						fm["hatena-url"] = hatenaUrl;
					}
				});

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

const escapeRegExp = (string: string) =>
	string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
