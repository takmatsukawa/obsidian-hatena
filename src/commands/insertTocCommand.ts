import {
	Editor,
} from "obsidian";

export async function insertTocCommand(
	editor: Editor,
) {
	const cursor = editor.getCursor();
	const toc = "[:contents]";

	editor.replaceRange(
		toc,
		cursor,
	  );
	  editor.setCursor(cursor.line, cursor.ch + toc.length);
}
