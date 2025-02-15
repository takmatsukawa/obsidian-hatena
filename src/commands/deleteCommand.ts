import { type MarkdownView, Notice, requestUrl } from "obsidian";
import { ConfirmModal } from "src/components/ConfirmModal";
import type HatenaPlugin from "src/plugin";

export const isDeleteCommandPossible = (view: MarkdownView) => {
	const file = view.file;
	if (!file) {
		return false;
	}
	const savedMemberUri =
		view.app.metadataCache.getFileCache(file)?.frontmatter?.[
			"hatena-member-uri"
		];
	return !!savedMemberUri;
};

export const deleteCommand = async (
	plugin: HatenaPlugin,
	view: MarkdownView,
) => {
	new ConfirmModal({
		app: plugin.app,
		title: "Delete the Hatena Blog's article of this note?",
		text: "This action cannot be undone.",
		cta: "Delete",
		onAccept: async () => {
			const file = view.file;
			if (!file) {
				return;
			}

			const memberUri =
				view.app.metadataCache.getFileCache(file)?.frontmatter?.[
					"hatena-member-uri"
				];
			if (!memberUri) {
				return;
			}

			const token = await plugin.generateToken();
			if (!token) {
				new Notice(
					"There was something wrong with the API Key or Root Endpoint",
				);
				return;
			}

			new Notice("Deleting...");

			try {
				await requestUrl({
					url: memberUri,
					method: "DELETE",
					headers: {
						"X-WSSE": token,
					},
				});

				view.app.fileManager.processFrontMatter(file, (fm) => {
					fm["hatena-member-uri"] = undefined;
					fm["hatena-url"] = undefined;
				});

				new Notice("The article has been deleted");
			} catch (e) {
				console.error(e);
				new Notice("Failed to delete the article");
			}
		},
	}).open();
};
