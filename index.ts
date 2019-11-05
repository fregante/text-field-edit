/** Replace selection with text, with Firefox support */
export default function insertText(textarea: HTMLTextAreaElement | HTMLInputElement, text: string): void {
	const document = textarea.ownerDocument!;
	textarea.focus(); // The passed `textarea` may not be focused

	if (document.execCommand('insertText', false, text)) {
		return;
	}

	// Found on https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html 🎈
	textarea.setRangeText(
		text,
		textarea.selectionStart || 0,
		textarea.selectionEnd || 0,
		'end' // Without this, the cursor is either at the beginning or `text` remains selected
	);

	textarea.dispatchEvent(new InputEvent('input', {
		data: text,
		inputType: 'insertText',
		isComposing: false // TODO: fix @types/jsdom, this shouldn't be required
	}));
}
