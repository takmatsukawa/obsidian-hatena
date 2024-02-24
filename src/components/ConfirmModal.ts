import { App, Modal, Setting } from "obsidian";

interface Params {
	app: App;
	title: string;
	onSubmit: (result: boolean) => void;
}

export class ConfirmModal extends Modal {
	private title: string;
	private onSubmit: Params["onSubmit"];

	constructor({ app, title, onSubmit }: Params) {
		super(app);
		this.title = title;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl, title } = this;

		contentEl.createEl("h2", { text: title });

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText("Cancel").onClick(() => {
					this.close();
				}),
			)
			.addButton((btn) =>
				btn
					.setButtonText("Delete")
					.setWarning()
					.onClick(() => {
						this.close();
						this.onSubmit(true);
					}),
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
