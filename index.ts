function insertTextFirefox(textarea: HTMLTextAreaElement | HTMLInputElement, text: string): void {
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

/** Replace selection with text, with Firefox support */
export function insert(textarea: HTMLTextAreaElement | HTMLInputElement, text: string): void {
	const document = textarea.ownerDocument!;
	const initialFocus = document.activeElement;
	if (initialFocus !== textarea) {
		textarea.focus();
	}

	if (!document.execCommand('insertText', false, text)) {
		insertTextFirefox(textarea, text);
	}

	if (initialFocus === document.body) {
		textarea.blur();
	} else if (initialFocus instanceof HTMLElement && initialFocus !== textarea) {
		initialFocus.focus();
	}
}

export function set(field: HTMLTextAreaElement | HTMLInputElement, text: string): void {
	field.select();
	insert(field, text);
}

export function getSelection(field: HTMLTextAreaElement | HTMLInputElement): string {
	return field.value.slice(field.selectionStart!, field.selectionEnd!);
}

export function wrapSelection(field: HTMLTextAreaElement | HTMLInputElement, wrap: string, wrapEnd?: string): void {
	const {selectionStart, selectionEnd} = field;
	const selection = getSelection(field);
	insert(field, wrap + selection + (wrapEnd ?? wrap));

	// Restore the selection around the previously-selected text
	field.selectionStart = selectionStart! + wrap.length;
	field.selectionEnd = selectionEnd! + wrap.length;
}

export default {
	insert,
	set,
	wrapSelection,
	getSelection
};
