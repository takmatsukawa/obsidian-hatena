import { App, Modal } from "obsidian";

interface Params {
	app: App;
	title: string;
	text?: string;
	cta: string;
	onAccept: () => void;
}

export class ConfirmModal extends Modal {
	private title: string;
	private text?: string;
	private cta: string;
	private onAccept: Params["onAccept"];

	constructor({ app, title, text, cta, onAccept }: Params) {
		super(app);
		this.title = title;
		this.text = text;
		this.cta = cta;
		this.onAccept = onAccept;
	}

	onOpen() {
		const { contentEl, title, text, cta } = this;

		contentEl.createEl("h2", { text: title });

		if (text) {
			contentEl.createEl("p", { text });
		}

		const container = contentEl.createDiv("modal-button-container");
		container
			.createEl("button", { text: "Never mind" })
			.addEventListener("click", () => {
				this.close();
			});
		container
			.createEl("button", { text: cta, cls: "mod-cta" })
			.addEventListener("click", () => {
				this.close();
				this.onAccept();
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
