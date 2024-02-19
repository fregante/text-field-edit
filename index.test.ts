import test from 'tape';
import {getSmartIndexRange} from './index.test-utils.js';
import {
	insertTextIntoField,
	setFieldText,
	replaceFieldText,
	wrapFieldSelection,
	getFieldSelection,
	_TEST_ONLY_withFocus,
} from './index.js';

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

function getState(field: HTMLElement) {
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

for (const type of ['textarea', 'input', 'contenteditable'] as const) {
	test(`${type}: harness test`, async t => {
		// Reset the document focus
		(document.activeElement as HTMLElement)?.blur?.();
		document.body.focus();

		t.equal(getState(getField(type)), '|');
		t.equal(getState(getField(type, '|')), '|');
		t.equal(getState(getField(type, 'A|')), 'A|');
		t.equal(getState(getField(type, '|A')), '|A');
		t.equal(getState(getField(type, '{A}')), '{A}');
		t.equal(getState(getField(type, 'A{B}C')), 'A{B}C');
		t.end();
	});

	test(`${type}: insert() preserves focused item, if focusable`, t => {
		t.equal(document.activeElement, document.body);
		const field = getField(type);
		insertTextIntoField(field, 'A');
		t.equal(document.activeElement, document.body);
		t.end();
	});

	test(`${type}: insert() inserts text in empty field`, t => {
		const field = getField(type);
		insertTextIntoField(field, 'a');
		t.equal(getState(field), 'a|');
		t.end();
	});

	test(`${type}: insert() inserts text in empty input element`, t => {
		const field = getField(type, '|');
		insertTextIntoField(field, 'a');
		t.equal(getState(field), 'a|');
		t.end();
	});

	test(`${type}: insert() appends text to unselected field`, t => {
		const field = getField(type, 'W|');
		insertTextIntoField(field, 'O');
		t.equal(getState(field), 'WO|');
		t.end();
	});

	test(`${type}: insert() inserts text in the middle`, t => {
		const field = getField(type, 'W|O');
		insertTextIntoField(field, 'A');
		t.equal(getState(field), 'WA|O');
		t.end();
	});

	test(`${type}: insert() replaces selected text`, t => {
		const field = getField(type, '{W}O');
		insertTextIntoField(field, 'A');
		t.equal(getState(field), 'A|O');
		t.end();
	});

	test(`${type}: insert() replaces selected text even if string is ""`, t => {
		const field = getField(type, '{W}O');
		insertTextIntoField(field, '');
		t.equal(getState(field), '|O');
		t.end();
	});

	test(`${type}: insert() fires input event`, t => {
		const field = getField(type);
		field.addEventListener('input', event => {
			t.equal(event.type, 'input');
			// TODO: t.equal(event.inputType, 'insert');
			t.end();
		});
		insertTextIntoField(field, 'A');
	});

	test(`${type}: set() replaces the whole content`, t => {
		const field = getField(type, '{W}O');
		setFieldText(field, 'ABC');
		t.equal(getState(field), 'ABC|');
		t.end();
	});

	test(`${type}: getSelection()`, t => {
		const field = getField(type, 'W{O}A');
		t.equal(getFieldSelection(field), 'O');
		t.end();
	});

	test(`${type}: getSelection() without selection`, t => {
		const field = getField(type, 'WOA|');
		t.equal(getFieldSelection(field), '');
		t.end();
	});

	test(`${type}: wrapSelection() wraps selected text`, t => {
		const field = getField(type, 'W{O}A');
		wrapFieldSelection(field, '*');
		t.equal(getState(field), 'W*{O}*A');
		t.end();
	});

	test(`${type}: wrapSelection() wraps selected text with different characters`, t => {
		const field = getField(type, 'W{O}A');
		wrapFieldSelection(field, '[', ']');
		t.equal(getState(field), 'W[{O}]A');
		t.end();
	});

	test(`${type}: wrapSelection() adds wrapping characters even without selection`, t => {
		const field = getField(type, 'O|A');
		wrapFieldSelection(field, '[', ']');
		t.equal(getState(field), 'O[|]A');
		t.end();
	});

	if (type === 'contenteditable') {
		continue;
	}

	test(`${type}: replace() supports strings`, t => {
		const field = getField(type, 'ABACUS');
		replaceFieldText(field, 'A', 'THE ');
		t.equal(getState(field), '{THE }BACUS');
		replaceFieldText(field, 'BA', 'AR');
		t.equal(getState(field), 'THE {AR}CUS');
		t.end();
	});

	test(`${type}: replace() supports strings with cursor placed after replaced text`, t => {
		const field = getField(type, 'ABACUS');
		replaceFieldText(field, 'A', 'THE ', 'after-replacement');
		t.equal(getState(field), 'THE |BACUS');
		replaceFieldText(field, 'BA', 'AR', 'after-replacement');
		t.equal(getState(field), 'THE AR|CUS');
		t.end();
	});

	test(`${type}: replace() supports strings with a replacer function`, t => {
		const field = getField(type, 'ABACUS');
		replaceFieldText(field, 'A', (match, index, string) => {
			t.equal(match, 'A');
			t.equal(index, 0);
			t.equal(string, 'ABACUS');
			return match.toLowerCase();
		});
		t.equal(getState(field), '{a}BACUS');
		t.end();
	});

	test(`${type}: replace() supports regex`, t => {
		const field = getField(type, 'ABACUS');
		replaceFieldText(field, /a/i, 'U');
		t.equal(getState(field), '{U}BACUS');
		replaceFieldText(field, /[ab]{2}/i, 'NI');
		t.equal(getState(field), 'U{NI}CUS');
		t.end();
	});

	test(`${type}: replace() supports regex with a replacer function`, t => {
		const field = getField(type, 'ABACUS');
		replaceFieldText(field, /a/i, (match, index, string) => {
			t.equal(match, 'A');
			t.equal(index, 0);
			t.equal(string, 'ABACUS');
			return match.toLowerCase();
		});
		t.equal(getState(field), '{a}BACUS');
		t.end();
	});

	test(`${type}: replace() supports regex with groups with a replacer function`, t => {
		const field = getField(type, 'ABACUS');
		replaceFieldText(field, /ba(c)us/i, (match, group1, index) => {
			t.equal(match, 'BACUS');
			t.equal(index, 1);
			t.equal(group1, 'C');
			return match.toLowerCase();
		});
		t.equal(getState(field), 'A{bacus}');
		t.end();
	});

	test(`${type}: replace() supports regex with groups with replacement patterns (not supported)`, t => {
		const field = getField(type, 'ABA');
		replaceFieldText(field, /(b)/i, '($1)');
		t.equal(getState(field), 'A{($1)}A'); // TODO: This should be A(B)A
		t.end();
	});

	test(`${type}: replace() supports regex with global flag`, t => {
		const field = getField(type, '1a23cd456');
		replaceFieldText(field, /\d+/g, '**');
		t.equal(getState(field), '**a**cd{**}');
		t.end();
	});

	test(`${type}: replace() supports regex with global flag with a replacer function`, t => {
		const field = getField(type, 'Abacus');
		let i = 0;
		replaceFieldText(field, /a/gi, (match, index, string) => {
			if (i === 0) {
				t.equal(match, 'A');
				t.equal(index, 0);
				t.equal(string, 'Abacus');
			} else {
				t.equal(match, 'a');
				t.equal(index, 2);
				t.equal(string, 'Abacus');
			}

			i++;
			return '[' + match + ']';
		});
		t.equal(getState(field), '[A]b{[a]}cus');
		t.end();
	});
}
