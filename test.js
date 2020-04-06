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
	const textarea = getField();
	insert(textarea, 'A');
	t.equal(document.activeElement, document.body);
	t.end();
});

test('insert() inserts text in empty textarea', t => {
	const textarea = getField();
	t.equal(textarea.value, '');
	insert(textarea, 'a');
	t.equal(textarea.value, 'a');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
	t.end();
});

test('insert() inserts text in empty input[type=text]', t => {
	const textarea = getField('', undefined, undefined, 'input');
	t.equal(textarea.value, '');
	insert(textarea, 'a');
	t.equal(textarea.value, 'a');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
	t.end();
});

test('insert() appends text to unselected field', t => {
	const textarea = getField('W');
	t.equal(textarea.value, 'W');
	insert(textarea, 'O');
	t.equal(textarea.value, 'WO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
	t.end();
});

test('insert() inserts text in the middle', t => {
	const textarea = getField('WO', 1, 1);
	t.equal(textarea.value, 'WO');
	insert(textarea, 'A');
	t.equal(textarea.value, 'WAO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
	t.end();
});

test('insert() replaces selected text', t => {
	const textarea = getField('WO', 0, 1);
	t.equal(textarea.value, 'WO');
	insert(textarea, 'A');
	t.equal(textarea.value, 'AO');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
	t.end();
});

test('insert() fires input event', t => {
	const textarea = getField();
	textarea.addEventListener('input', event => {
		t.equal(event.type, 'input');
		// TODO: t.equal(event.inputType, 'insert');
		t.end();
	});
	insert(textarea, 'A');
});

test('set() replaces the whole content', t => {
	const textarea = getField('WO', 0, 1);
	t.equal(textarea.value, 'WO');
	set(textarea, 'ABC');
	t.equal(textarea.value, 'ABC');
	t.equal(textarea.selectionStart, 3);
	t.equal(textarea.selectionEnd, 3);
	t.end();
});

test('getSelection()', t => {
	const textarea = getField('WOA', 1, 2);
	t.equal(textarea.value, 'WOA');
	t.equal(getSelection(textarea), 'O');
	t.end();
});

test('getSelection() without selection', t => {
	const textarea = getField('WOA', 3, 3);
	t.equal(getSelection(textarea), '');
	t.end();
});

test('wrapSelection() wraps selected text', t => {
	const textarea = getField('WOA', 1, 2);
	wrapSelection(textarea, '*');
	t.equal(textarea.value, 'W*O*A');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 3);
	t.end();
});

test('wrapSelection() wraps selected text with different characters', t => {
	const textarea = getField('WOA', 1, 2);
	wrapSelection(textarea, '[', ']');
	t.equal(textarea.value, 'W[O]A');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 3);
	t.end();
});

test('wrapSelection() adds wrapping characters even without selection', t => {
	const textarea = getField('OA', 1, 1);
	wrapSelection(textarea, '[', ']');
	t.equal(textarea.value, 'O[]A');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
	t.end();
});
