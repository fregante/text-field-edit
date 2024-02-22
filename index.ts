// Make sure that the global document is never used
declare const document: never;

function isNativeField(field: HTMLElement): field is HTMLInputElement | HTMLTextAreaElement {
	return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement;
}

/** Call a function after focusing a field and then restore the previous focus afterwards if necessary */
function withFocus<T>(field: HTMLElement, callback: () => T): T {
	const document = field.ownerDocument;
	const initialFocus = document.activeElement;

	if (initialFocus === field) {
		return callback();
	}

	try {
		field.focus();
		return callback();
	} finally {
		field.blur(); // Supports `intialFocus === body`
		if (initialFocus instanceof HTMLElement) {
			initialFocus.focus();
		}
	}
}

// This will insert into the focused field. It shouild always be called inside withFocus.
// Use this one locally if there are multiple `insertTextIntoField` or `document.execCommand` calls
function insertTextWhereverTheFocusIs(
	document: Document,
	text: string,
): void {
	if (text === '') {
		// https://github.com/fregante/text-field-edit/issues/16
		document.execCommand('delete');
	} else {
		document.execCommand('insertText', false, text);
	}
}

/** Inserts `text` at the cursor’s position, replacing any selection, with **undo** support and by firing the `input` event. */
export function insertTextIntoField(
	field: HTMLElement,
	text: string,
): void {
	withFocus(field, () => {
		insertTextWhereverTheFocusIs(field.ownerDocument, text);
	});
}

/** Replaces the entire content, equivalent to `field.value = text` but with **undo** support and by firing the `input` event. */
export function setFieldText(
	field: HTMLElement,
	text: string,
): void {
	if (isNativeField(field)) {
		field.select();
		insertTextIntoField(field, text);
	} else {
		const document = field.ownerDocument;
		withFocus(field, () => {
			document.execCommand('selectAll', false, text);
			insertTextWhereverTheFocusIs(document, text);
		});
	}
}

/** Get the selected text in a field or an empty string if nothing is selected. */
export function getFieldSelection(
	field: HTMLElement,
): string {
	if (isNativeField(field)) {
		return field.value.slice(field.selectionStart!, field.selectionEnd!);
	}

	const selection = field.ownerDocument.getSelection()!;
	if (selection && field.contains(selection.anchorNode)) {
		// The selection is inside the field
		return selection.toString();
	}

	return '';
}

function wrapFieldSelectionNative(
	field: HTMLInputElement | HTMLTextAreaElement,
	wrap: string,
	wrapEnd: string,
): void {
	const {selectionStart, selectionEnd} = field;
	const selection = getFieldSelection(field);
	insertTextIntoField(field, wrap + selection + wrapEnd);

	// Restore the selection around the previously-selected text
	field.selectionStart = selectionStart! + wrap.length;
	field.selectionEnd = selectionEnd! + wrapEnd.length;
}

function collapseCursor(selection: Selection, range: Range, toStart: boolean) {
	const alteredRange = range.cloneRange();
	alteredRange.collapse(toStart);

	selection.removeAllRanges();
	selection.addRange(alteredRange);
}

function wrapFieldSelectionContentEditable(
	field: HTMLElement,
	before: string,
	after: string,
) {
	const document = field.ownerDocument;
	const selection = document.getSelection()!;
	const selectionRange = selection.getRangeAt(0);

	if (after) {
		collapseCursor(selection, selectionRange, false);
		insertTextIntoField(field, after);
	}

	if (before) {
		collapseCursor(selection, selectionRange, true);
		insertTextIntoField(field, before);

		// The text added by at the beginning is included in the new selection, while wrapEnd isn't.
		// This nudges the selection after the newly-inserted text.
		selectionRange.setStart(
			selectionRange.startContainer,
			selectionRange.startOffset + before.length,
		);
	}

	if (after ?? before) {
		// Restore selection
		selection.removeAllRanges();
		selection.addRange(selectionRange);
	}
}

/** Adds the `wrappingText` before and after field’s selection (or cursor). If `endWrappingText` is provided, it will be used instead of `wrappingText` at on the right. */
export function wrapFieldSelection(
	field: HTMLElement,
	wrap: string,
	// TODO: Ensure that it works regardless of direction
	wrapEnd = wrap,
): void {
	if (isNativeField(field)) {
		wrapFieldSelectionNative(field, wrap, wrapEnd);
	} else {
		wrapFieldSelectionContentEditable(field, wrap, wrapEnd);
	}
}

type ReplacerCallback = (substring: string, ...arguments_: any[]) => string;

/** Finds and replaces strings and regex in the field’s value, like `field.value = field.value.replace()` but better */
export function replaceFieldText(
	field: HTMLInputElement | HTMLTextAreaElement,
	searchValue: string | RegExp,
	replacer: string | ReplacerCallback,
	cursor: 'select' | 'after-replacement' = 'select',
): void {
	if (!isNativeField(field)) {
		throw new TypeError('replaceFieldText only supports input and textarea fields');
	}

	/** Keeps track of how much each match offset should be adjusted */
	let drift = 0;

	withFocus(field, () => {
		field.value.replace(searchValue, (...arguments_): string => {
			// Select current match to replace it later
			const matchStart = drift + (arguments_.at(-2) as number);
			const matchLength = arguments_[0].length;
			field.selectionStart = matchStart;
			field.selectionEnd = matchStart + matchLength;

			const replacement = typeof replacer === 'string' ? replacer : replacer(...arguments_);
			insertTextWhereverTheFocusIs(field.ownerDocument, replacement);

			if (cursor === 'select') {
				// Select replacement. Without this, the cursor would be after the replacement
				field.selectionStart = matchStart;
			}

			drift += replacement.length - matchLength;
			return replacement;
		});
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

export {withFocus as _TEST_ONLY_withFocus};
