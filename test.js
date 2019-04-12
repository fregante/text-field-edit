const test = require('tape');
const insertText = require('.');

const getField = (value = '') => {
	const field = document.createElement('textarea');
	field.value = value;
	document.body.append(field);
	return field;
};

// TODO: test input fields and the fallback
test('insert text in empty field', t => {
	t.plan(4);
	const textarea = getField();
	t.equal(textarea.value, '');
	insertText(textarea, 'a');
	t.equal(textarea.value, 'a');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
});

test('append text to unselected field', t => {
	t.plan(4);
	const textarea = getField('W');
	t.equal(textarea.value, 'W');
	insertText(textarea, 'O');
	t.equal(textarea.value, 'WO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
});

test('insert text in the middle', t => {
	t.plan(4);
	const textarea = getField('WO');
	t.equal(textarea.value, 'WO');
	textarea.selectionStart = 1;
	textarea.selectionEnd = 1;
	insertText(textarea, 'A');
	t.equal(textarea.value, 'WAO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
});

test('replace selected text', t => {
	t.plan(4);
	const textarea = getField('WO');
	t.equal(textarea.value, 'WO');
	textarea.selectionStart = 0;
	textarea.selectionEnd = 1;
	insertText(textarea, 'A');
	t.equal(textarea.value, 'AO');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
});

test('replace inverted selected text', t => {
	t.plan(4);
	const textarea = getField('WO');
	t.equal(textarea.value, 'WO');
	textarea.selectionStart = 1;
	textarea.selectionEnd = 0;
	insertText(textarea, 'A');
	t.equal(textarea.value, 'AO');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
});
