/** Inserts `text` at the cursor’s position, replacing any selection, with **undo** support and by firing the `input` event. */
export function insertTextIntoField(
	field: HTMLTextAreaElement | HTMLInputElement,
	text: string,
): void {
	const document = field.ownerDocument!;
	const initialFocus = document.activeElement;
	if (initialFocus !== field) {
		field.focus();
	}

	if (text === '') {
		// https://github.com/fregante/text-field-edit/issues/16
		document.execCommand('delete');
	} else {
		document.execCommand('insertText', false, text);
	}

	if (initialFocus === document.body) {
		field.blur();
	} else if (initialFocus instanceof HTMLElement && initialFocus !== field) {
		initialFocus.focus();
	}
}

/** Replaces the entire content, equivalent to `field.value = text` but with **undo** support and by firing the `input` event. */
export function setFieldText(
	field: HTMLTextAreaElement | HTMLInputElement,
	text: string,
): void {
	field.select();
	insertTextIntoField(field, text);
}

/** Get the selected text in a field or an empty string if nothing is selected. */
export function getFieldSelection(
	field: HTMLTextAreaElement | HTMLInputElement,
): string {
	return field.value.slice(field.selectionStart!, field.selectionEnd!);
}

/** Adds the `wrappingText` before and after field’s selection (or cursor). If `endWrappingText` is provided, it will be used instead of `wrappingText` at on the right. */
export function wrapFieldSelection(
	field: HTMLTextAreaElement | HTMLInputElement,
	wrap: string,
	wrapEnd?: string,
): void {
	const {selectionStart, selectionEnd} = field;
	const selection = getFieldSelection(field);
	insertTextIntoField(field, wrap + selection + (wrapEnd ?? wrap));

	// Restore the selection around the previously-selected text
	field.selectionStart = selectionStart! + wrap.length;
	field.selectionEnd = selectionEnd! + wrap.length;
}

type ReplacerCallback = (substring: string, ...arguments_: any[]) => string;

/** Finds and replaces strings and regex in the field’s value, like `field.value = field.value.replace()` but better */
export function replaceFieldText(
	field: HTMLTextAreaElement | HTMLInputElement,
	searchValue: string | RegExp,
	replacer: string | ReplacerCallback,
	cursor: 'select' | 'after-replacement' = 'select',
): void {
	/** Keeps track of how much each match offset should be adjusted */
	let drift = 0;

	field.value.replace(searchValue, (...arguments_): string => {
		// Select current match to replace it later
		const matchStart = drift + (arguments_.at(-2) as number);
		const matchLength = arguments_[0].length;
		field.selectionStart = matchStart;
		field.selectionEnd = matchStart + matchLength;

		const replacement = typeof replacer === 'string' ? replacer : replacer(...arguments_);
		insertTextIntoField(field, replacement);

		if (cursor === 'select') {
			// Select replacement. Without this, the cursor would be after the replacement
			field.selectionStart = matchStart;
		}

		drift += replacement.length - matchLength;
		return replacement;
	});
}

/** @deprecated Import `insertTextIntoField` instead */
export const insert = insertTextIntoField;

/** @deprecated Import `setFieldText` instead */
export const set = setFieldText;

/** @deprecated Import `replaceFieldText` instead */
export const replace = replaceFieldText;

/** @deprecated Import `wrapFieldSelection` instead */
export const wrapSelection = wrapFieldSelection;

/** @deprecated Import `getFieldSelection` instead */
export const getSelection = getFieldSelection;

// Note: Don't reuse deprecated constant from above
const textFieldEdit = {
	insert: insertTextIntoField,
	set: setFieldText,
	replace: replaceFieldText,
	wrapSelection: wrapFieldSelection,
	getSelection: getFieldSelection,
} as const;
export default textFieldEdit;
