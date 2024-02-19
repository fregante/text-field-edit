import test from 'tape';
import {
	insertTextIntoField,
	setFieldText,
	replaceFieldText,
	wrapFieldSelection,
	getFieldSelection,
} from './index.js';

type NativeField = HTMLTextAreaElement | HTMLInputElement;

function getField(state = '|', type = 'textarea') {
	const field = document.createElement(type);
	const cursor = state.indexOf('|');
	const value = state.replaceAll(/[{|}]/g, '');
	const selectionStart = cursor >= 0 ? cursor : state.indexOf('{');
	const selectionEnd = cursor >= 0 ? cursor : state.indexOf('}') - 1;
	if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
		field.value = value;
		field.selectionStart = selectionStart;
		field.selectionEnd = selectionEnd;
	} else {
		throw new TypeError('Not implemented for this type of field.');
	}

	document.body.append(field);
	return field;
}

function getState({value, selectionStart, selectionEnd}: NativeField) {
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

test('test harness test', t => {
	t.equal(getState(getField()), '|');
	t.equal(getState(getField('|')), '|');
	t.equal(getState(getField('A|')), 'A|');
	t.equal(getState(getField('|A')), '|A');
	t.equal(getState(getField('{A}')), '{A}');
	t.equal(getState(getField('A{B}C')), 'A{B}C');
	t.end();
});

test('insert() preserves focused item, if focusable', t => {
	t.equal(document.activeElement, document.body);
	const field = getField();
	insertTextIntoField(field, 'A');
	t.equal(document.activeElement, document.body);
	t.end();
});

test('insert() inserts text in empty field', t => {
	const field = getField();
	insertTextIntoField(field, 'a');
	t.equal(getState(field), 'a|');
	t.end();
});

test('insert() inserts text in empty input element', t => {
	const field = getField('|', 'input');
	insertTextIntoField(field, 'a');
	t.equal(getState(field), 'a|');
	t.end();
});

test('insert() appends text to unselected field', t => {
	const field = getField('W|');
	insertTextIntoField(field, 'O');
	t.equal(getState(field), 'WO|');
	t.end();
});

test('insert() inserts text in the middle', t => {
	const field = getField('W|O');
	insertTextIntoField(field, 'A');
	t.equal(getState(field), 'WA|O');
	t.end();
});

test('insert() replaces selected text', t => {
	const field = getField('{W}O');
	insertTextIntoField(field, 'A');
	t.equal(getState(field), 'A|O');
	t.end();
});

test('insert() replaces selected text even if string is ""', t => {
	const field = getField('{W}O');
	insertTextIntoField(field, '');
	t.equal(getState(field), '|O');
	t.end();
});

test('insert() fires input event', t => {
	const field = getField();
	field.addEventListener('input', event => {
		t.equal(event.type, 'input');
		// TODO: t.equal(event.inputType, 'insert');
		t.end();
	});
	insertTextIntoField(field, 'A');
});

test('set() replaces the whole content', t => {
	const field = getField('{W}O');
	setFieldText(field, 'ABC');
	t.equal(getState(field), 'ABC|');
	t.end();
});

test('getSelection()', t => {
	const field = getField('W{O}A');
	t.equal(getFieldSelection(field), 'O');
	t.end();
});

test('getSelection() without selection', t => {
	const field = getField('WOA|');
	t.equal(getFieldSelection(field), '');
	t.end();
});

test('wrapSelection() wraps selected text', t => {
	const field = getField('W{O}A');
	wrapFieldSelection(field, '*');
	t.equal(getState(field), 'W*{O}*A');
	t.end();
});

test('wrapSelection() wraps selected text with different characters', t => {
	const field = getField('W{O}A');
	wrapFieldSelection(field, '[', ']');
	t.equal(getState(field), 'W[{O}]A');
	t.end();
});

test('wrapSelection() adds wrapping characters even without selection', t => {
	const field = getField('O|A');
	wrapFieldSelection(field, '[', ']');
	t.equal(getState(field), 'O[|]A');
	t.end();
});

test('replace() supports strings', t => {
	const field = getField('ABACUS');
	replaceFieldText(field, 'A', 'THE ');
	t.equal(getState(field), '{THE }BACUS');
	replaceFieldText(field, 'BA', 'AR');
	t.equal(getState(field), 'THE {AR}CUS');
	t.end();
});

test('replace() supports strings with cursor placed after replaced text', t => {
	const field = getField('ABACUS');
	replaceFieldText(field, 'A', 'THE ', 'after-replacement');
	t.equal(getState(field), 'THE |BACUS');
	replaceFieldText(field, 'BA', 'AR', 'after-replacement');
	t.equal(getState(field), 'THE AR|CUS');
	t.end();
});

test('replace() supports strings with a replacer function', t => {
	const field = getField('ABACUS');
	replaceFieldText(field, 'A', (match, index, string) => {
		t.equal(match, 'A');
		t.equal(index, 0);
		t.equal(string, 'ABACUS');
		return match.toLowerCase();
	});
	t.equal(getState(field), '{a}BACUS');
	t.end();
});

test('replace() supports regex', t => {
	const field = getField('ABACUS');
	replaceFieldText(field, /a/i, 'U');
	t.equal(getState(field), '{U}BACUS');
	replaceFieldText(field, /[ab]{2}/i, 'NI');
	t.equal(getState(field), 'U{NI}CUS');
	t.end();
});

test('replace() supports regex with a replacer function', t => {
	const field = getField('ABACUS');
	replaceFieldText(field, /a/i, (match, index, string) => {
		t.equal(match, 'A');
		t.equal(index, 0);
		t.equal(string, 'ABACUS');
		return match.toLowerCase();
	});
	t.equal(getState(field), '{a}BACUS');
	t.end();
});

test('replace() supports regex with groups with a replacer function', t => {
	const field = getField('ABACUS');
	replaceFieldText(field, /ba(c)us/i, (match, group1, index) => {
		t.equal(match, 'BACUS');
		t.equal(index, 1);
		t.equal(group1, 'C');
		return match.toLowerCase();
	});
	t.equal(getState(field), 'A{bacus}');
	t.end();
});

test('replace() supports regex with groups with replacement patterns (not supported)', t => {
	const field = getField('ABA');
	replaceFieldText(field, /(b)/i, '($1)');
	t.equal(getState(field), 'A{($1)}A'); // TODO: This should be A(B)A
	t.end();
});

test('replace() supports regex with global flag', t => {
	const field = getField('1a23cd456');
	replaceFieldText(field, /\d+/g, '**');
	t.equal(getState(field), '**a**cd{**}');
	t.end();
});

test('replace() supports regex with global flag with a replacer function', t => {
	const field = getField('Abacus');
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
