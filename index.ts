function insertTextFirefox(field: HTMLTextAreaElement | HTMLInputElement, text: string): void {
	// Found on https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html 🎈
	field.setRangeText(
		text,
		field.selectionStart || 0,
		field.selectionEnd || 0,
		'end' // Without this, the cursor is either at the beginning or `text` remains selected
	);

	field.dispatchEvent(new InputEvent('input', {
		data: text,
		inputType: 'insertText',
		isComposing: false // TODO: fix @types/jsdom, this shouldn't be required
	}));
}

/** Inserts `text` at the cursor’s position, replacing any selection, with **undo** support and by firing the `input` event. */
export function insert(field: HTMLTextAreaElement | HTMLInputElement, text: string): void {
	const document = field.ownerDocument!;
	const initialFocus = document.activeElement;
	if (initialFocus !== field) {
		field.focus();
	}

	if (!document.execCommand('insertText', false, text)) {
		insertTextFirefox(field, text);
	}

	if (initialFocus === document.body) {
		field.blur();
	} else if (initialFocus instanceof HTMLElement && initialFocus !== field) {
		initialFocus.focus();
	}
}

/** Replaces the entire content, equivalent to `field.value = text` but with **undo** support and by firing the `input` event. */
export function set(field: HTMLTextAreaElement | HTMLInputElement, text: string): void {
	field.select();
	insert(field, text);
}

/** Get the selected text in a field or an empty string if nothing is selected. */
export function getSelection(field: HTMLTextAreaElement | HTMLInputElement): string {
	return field.value.slice(field.selectionStart!, field.selectionEnd!);
}

/** Adds the `wrappingText` before and after field’s selection (or cursor). If `endWrappingText` is provided, it will be used instead of `wrappingText` at on the right. */
export function wrapSelection(field: HTMLTextAreaElement | HTMLInputElement, wrap: string, wrapEnd?: string): void {
	const {selectionStart, selectionEnd} = field;
	const selection = getSelection(field);
	insert(field, wrap + selection + (wrapEnd ?? wrap));

	// Restore the selection around the previously-selected text
	field.selectionStart = selectionStart! + wrap.length;
	field.selectionEnd = selectionEnd! + wrap.length;
}
