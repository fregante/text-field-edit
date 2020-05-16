import test from 'tape';
import * as textFieldEdit from '.';

function getField(state = '|', type = 'textarea') {
	const field = document.createElement(type);
	const cursor = state.indexOf('|');
	const selectionStart = state.indexOf('{');
	const selectionEnd = state.indexOf('}') - 1;
	field.value = state.replace(/[{|}]/g, '');
	field.selectionStart = cursor >= 0 ? cursor : selectionStart;
	field.selectionEnd = cursor >= 0 ? cursor : selectionEnd;
	document.body.append(field);
	return field;
}

function getState({value, selectionStart, selectionEnd}) {
	if (selectionStart === selectionEnd) {
		return value.slice(0, selectionStart) + '|' + value.slice(selectionStart);
	}

	return value.slice(0, selectionStart) + '{' + value.slice(selectionStart, selectionEnd) + '}' + value.slice(selectionEnd);
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
	textFieldEdit.insert(field, 'A');
	t.equal(document.activeElement, document.body);
	t.end();
});

test('insert() inserts text in empty field', t => {
	const field = getField();
	textFieldEdit.insert(field, 'a');
	t.equal(getState(field), 'a|');
	t.end();
});

test('insert() inserts text in empty input element', t => {
	const field = getField('|', 'input');
	textFieldEdit.insert(field, 'a');
	t.equal(getState(field), 'a|');
	t.end();
});

test('insert() appends text to unselected field', t => {
	const field = getField('W|');
	textFieldEdit.insert(field, 'O');
	t.equal(getState(field), 'WO|');
	t.end();
});

test('insert() inserts text in the middle', t => {
	const field = getField('W|O');
	textFieldEdit.insert(field, 'A');
	t.equal(getState(field), 'WA|O');
	t.end();
});

test('insert() replaces selected text', t => {
	const field = getField('{W}O');
	textFieldEdit.insert(field, 'A');
	t.equal(getState(field), 'A|O');
	t.end();
});

test('insert() fires input event', t => {
	const field = getField();
	field.addEventListener('input', event => {
		t.equal(event.type, 'input');
		// TODO: t.equal(event.inputType, 'insert');
		t.end();
	});
	textFieldEdit.insert(field, 'A');
});

test('set() replaces the whole content', t => {
	const field = getField('{W}O');
	textFieldEdit.set(field, 'ABC');
	t.equal(getState(field), 'ABC|');
	t.end();
});

test('getSelection()', t => {
	const field = getField('W{O}A');
	t.equal(textFieldEdit.getSelection(field), 'O');
	t.end();
});

test('getSelection() without selection', t => {
	const field = getField('WOA|');
	t.equal(textFieldEdit.getSelection(field), '');
	t.end();
});

test('wrapSelection() wraps selected text', t => {
	const field = getField('W{O}A');
	textFieldEdit.wrapSelection(field, '*');
	t.equal(getState(field), 'W*{O}*A');
	t.end();
});

test('wrapSelection() wraps selected text with different characters', t => {
	const field = getField('W{O}A');
	textFieldEdit.wrapSelection(field, '[', ']');
	t.equal(getState(field), 'W[{O}]A');
	t.end();
});

test('wrapSelection() adds wrapping characters even without selection', t => {
	const field = getField('O|A');
	textFieldEdit.wrapSelection(field, '[', ']');
	t.equal(getState(field), 'O[|]A');
	t.end();
});
