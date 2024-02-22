
import {_TEST_ONLY_withFocus} from './index.js';

// Extracted from: https://github.com/fregante/zip-text-nodes
// Get text node at an character index of an Element.
// Only needed because .setStart only accepts a character index relative to a single TextNode
export function getNodeAtIndex(container: Node, index: number): [Node, number] {
	let relativeIndex = index;
	let cursor = container;
	while (cursor?.firstChild) {
		cursor = cursor.firstChild;
		while (cursor && cursor.textContent!.length < relativeIndex) {
			relativeIndex -= cursor.textContent!.length;
			if (cursor.nextSibling) {
				cursor = cursor.nextSibling;
			}
		}
	}

	return [cursor, relativeIndex];
}

// Extracted from: https://github.com/fregante/zip-text-nodes
// Get Range that starts/ends across multiple/nested TextNodes of an Element.
// Only needed because .setStart only accepts a character index relative to a single TextNode
export function getSmartIndexRange(node: Node & ParentNode, start: number, end: number): Range {
	const range = document.createRange();
	range.setStart(...getNodeAtIndex(node, start));
	range.setEnd(...getNodeAtIndex(node, end));
	return range;
}

type NativeField = HTMLTextAreaElement | HTMLInputElement;

function isNativeField(field: HTMLElement): field is NativeField {
	return field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement;
}

function getField(type: 'textarea' | 'input', state?: string): NativeField;
function getField(type: string, state?: string): HTMLElement;
function getField(type: string, state = '|') {
	const field = document.createElement(type === 'contenteditable' ? 'div' : type);
	document.body.append(field);

	if (type === 'contenteditable') {
		field.setAttribute('contenteditable', 'true');
	}

	const cursor = state.indexOf('|');
	const value = state.replaceAll(/[{|}]/g, '');
	const selectionStart = cursor >= 0 ? cursor : state.indexOf('{');
	const selectionEnd = cursor >= 0 ? cursor : state.indexOf('}') - 1;
	if (isNativeField(field)) {
		field.value = value;
		field.selectionStart = selectionStart;
		field.selectionEnd = selectionEnd;
	} else {
		field.append(value);

		// This changes the focus of the whole document, so make sure to reset it afterwards to avoid side effects while testing
		_TEST_ONLY_withFocus(field, () => {
			const selection = window.getSelection()!;
			selection.removeAllRanges();
			selection.addRange(getSmartIndexRange(field, selectionStart, selectionEnd));
		});
	}

	return field;
}

function getSimplifiedFieldState(field: HTMLElement) {
	if (isNativeField(field)) {
		return field;
	}

	const selection = getSelection()!;
	return {
		value: field.textContent!,
		selectionStart: selection.anchorOffset,
		selectionEnd: selection.anchorOffset + selection.toString().length,
	};
}

export function getState(field: HTMLElement) {
	const {value, selectionStart, selectionEnd} = getSimplifiedFieldState(field);
	if (selectionStart === selectionEnd) {
		return value.slice(0, selectionStart!) + '|' + value.slice(selectionStart!);
	}

	return (
		value.slice(0, selectionStart!)
		+ '{'
		+ value.slice(selectionStart!, selectionEnd!)
		+ '}'
		+ value.slice(selectionEnd!)
	);
}

export {getField};
