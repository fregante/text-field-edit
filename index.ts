declare global {
	// Wait for https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33903
	interface InputEventInit {
		inputType: string;
	}

	interface Window {
		InputEvent: typeof InputEvent;
	}
}

// Replace selection with text, with Firefox support
function insertText(textarea: HTMLTextAreaElement, text: string): void {
	const document = textarea.ownerDocument!;
	const {InputEvent} = document.defaultView!;
	const initialFocus = document.activeElement;
	if (initialFocus !== textarea) {
		textarea.focus();
	}

	if (document.execCommand('insertText', false, text)) {
		return;
	}

	// Found on https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html 🎈
	textarea.setRangeText(
		text,
		textarea.selectionStart,
		textarea.selectionEnd,
		'end' // Without this, the cursor is either at the beginning or `text` remains selected
	);

	textarea.dispatchEvent(new InputEvent('input', {
		data: text,
		inputType: 'insertText',
		isComposing: false // TODO: fix @types/jsdom, this shouldn't be required
	}));

	if (initialFocus !== textarea && initialFocus.focus) {
		initialFocus.focus();
	}
}

export = insertText;
