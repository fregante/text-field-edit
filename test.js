import test from 'tape';
import {insert, set, getSelection, wrapSelection} from '.';

const getField = (value = '', start = undefined, end = undefined, type = 'textarea') => {
	const field = document.createElement(type);
	field.value = value;
	document.body.append(field);
	if (end !== undefined) {
		field.selectionStart = start;
		field.selectionEnd = end;
	}

	return field;
};

test('insert() preserves focused item, if focusable', t => {
	t.equal(document.activeElement, document.body);
	const field = getField();
	insert(field, 'A');
	t.equal(document.activeElement, document.body);
	t.end();
});

test('insert() inserts text in empty field', t => {
	const field = getField();
	t.equal(field.value, '');
	insert(field, 'a');
	t.equal(field.value, 'a');
	t.equal(field.selectionStart, 1);
	t.equal(field.selectionEnd, 1);
	t.end();
});

test('insert() inserts text in empty input element', t => {
	const field = getField('', undefined, undefined, 'input');
	t.equal(field.value, '');
	insert(field, 'a');
	t.equal(field.value, 'a');
	t.equal(field.selectionStart, 1);
	t.equal(field.selectionEnd, 1);
	t.end();
});

test('insert() appends text to unselected field', t => {
	const field = getField('W');
	t.equal(field.value, 'W');
	insert(field, 'O');
	t.equal(field.value, 'WO');
	t.equal(field.selectionStart, 2);
	t.equal(field.selectionEnd, 2);
	t.end();
});

test('insert() inserts text in the middle', t => {
	const field = getField('WO', 1, 1);
	t.equal(field.value, 'WO');
	insert(field, 'A');
	t.equal(field.value, 'WAO');
	t.equal(field.selectionStart, 2);
	t.equal(field.selectionEnd, 2);
	t.end();
});

test('insert() replaces selected text', t => {
	const field = getField('WO', 0, 1);
	t.equal(field.value, 'WO');
	insert(field, 'A');
	t.equal(field.value, 'AO');
	t.equal(field.selectionStart, 1);
	t.equal(field.selectionEnd, 1);
	t.end();
});

test('insert() fires input event', t => {
	const field = getField();
	field.addEventListener('input', event => {
		t.equal(event.type, 'input');
		// TODO: t.equal(event.inputType, 'insert');
		t.end();
	});
	insert(field, 'A');
});

test('set() replaces the whole content', t => {
	const field = getField('WO', 0, 1);
	t.equal(field.value, 'WO');
	set(field, 'ABC');
	t.equal(field.value, 'ABC');
	t.equal(field.selectionStart, 3);
	t.equal(field.selectionEnd, 3);
	t.end();
});

test('getSelection()', t => {
	const field = getField('WOA', 1, 2);
	t.equal(field.value, 'WOA');
	t.equal(getSelection(field), 'O');
	t.end();
});

test('getSelection() without selection', t => {
	const field = getField('WOA', 3, 3);
	t.equal(getSelection(field), '');
	t.end();
});

test('wrapSelection() wraps selected text', t => {
	const field = getField('WOA', 1, 2);
	wrapSelection(field, '*');
	t.equal(field.value, 'W*O*A');
	t.equal(field.selectionStart, 2);
	t.equal(field.selectionEnd, 3);
	t.end();
});

test('wrapSelection() wraps selected text with different characters', t => {
	const field = getField('WOA', 1, 2);
	wrapSelection(field, '[', ']');
	t.equal(field.value, 'W[O]A');
	t.equal(field.selectionStart, 2);
	t.equal(field.selectionEnd, 3);
	t.end();
});

test('wrapSelection() adds wrapping characters even without selection', t => {
	const field = getField('OA', 1, 1);
	wrapSelection(field, '[', ']');
	t.equal(field.value, 'O[]A');
	t.equal(field.selectionStart, 2);
	t.equal(field.selectionEnd, 2);
	t.end();
});
