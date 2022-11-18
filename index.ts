// https://github.com/fregante/text-field-edit/issues/16
function safeTextInsert(text: string): boolean {
	if (text === '') {
		return document.execCommand('delete');
	}

	return document.execCommand('insertText', false, text);
}

function insertTextFirefox(
	field: HTMLTextAreaElement | HTMLInputElement,
	text: string,
): void {
	// Found on https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html 🎈
	field.setRangeText(
		text,
		field.selectionStart || 0,
		field.selectionEnd || 0,
		'end', // Without this, the cursor is either at the beginning or `text` remains selected
	);

	field.dispatchEvent(
		new InputEvent('input', {
			data: text,
			inputType: 'insertText',
		}),
	);
}

/** Inserts `text` at the cursor’s position, replacing any selection, with **undo** support and by firing the `input` event. */
export function insert(
	field: HTMLTextAreaElement | HTMLInputElement,
	text: string,
): void {
	const document = field.ownerDocument!;
	const initialFocus = document.activeElement;
	if (initialFocus !== field) {
		field.focus();
	}

	if (!safeTextInsert(text)) {
		insertTextFirefox(field, text);
	}

	if (initialFocus === document.body) {
		field.blur();
	} else if (initialFocus instanceof HTMLElement && initialFocus !== field) {
		initialFocus.focus();
	}
}

/** Replaces the entire content, equivalent to `field.value = text` but with **undo** support and by firing the `input` event. */
export function set(
	field: HTMLTextAreaElement | HTMLInputElement,
	text: string,
): void {
	field.select();
	insert(field, text);
}

/** Get the selected text in a field or an empty string if nothing is selected. */
export function getSelection(
	field: HTMLTextAreaElement | HTMLInputElement,
): string {
	return field.value.slice(field.selectionStart!, field.selectionEnd!);
}

/** Adds the `wrappingText` before and after field’s selection (or cursor). If `endWrappingText` is provided, it will be used instead of `wrappingText` at on the right. */
export function wrapSelection(
	field: HTMLTextAreaElement | HTMLInputElement,
	wrap: string,
	wrapEnd?: string,
): void {
	const {selectionStart, selectionEnd} = field;
	const selection = getSelection(field);
	insert(field, wrap + selection + (wrapEnd ?? wrap));

	// Restore the selection around the previously-selected text
	field.selectionStart = selectionStart! + wrap.length;
	field.selectionEnd = selectionEnd! + wrap.length;
}

type ReplacerCallback = (substring: string, ...args: any[]) => string;

/** Finds and replaces strings and regex in the field’s value, like `field.value = field.value.replace()` but better */
export function replace(
	field: HTMLTextAreaElement | HTMLInputElement,
	searchValue: string | RegExp,
	replacer: string | ReplacerCallback,
	cursor: 'select' | 'after-replacement' = 'select',
): void {
	/** Remembers how much each match offset should be adjusted */
	let drift = 0;

	field.value.replace(searchValue, (...args): string => {
		// Select current match to replace it later
		const matchStart = drift + (args[args.length - 2] as number);
		const matchLength = args[0].length;
		field.selectionStart = matchStart;
		field.selectionEnd = matchStart + matchLength;

		const replacement = typeof replacer === 'string' ? replacer : replacer(...args);
		insert(field, replacement);

		if (cursor === 'select') {
			// Select replacement. Without this, the cursor would be after the replacement
			field.selectionStart = matchStart;
		}

		drift += replacement.length - matchLength;
		return replacement;
	});
}
