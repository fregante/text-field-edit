const test = require('tape');
const insertText = require('.');

const getField = (value = '', start, end) => {
	const field = document.createElement('textarea');
	field.value = value;
	document.body.append(field);
	if (end !== undefined) {
		field.selectionStart = start;
		field.selectionEnd = end;
	}

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
	const textarea = getField('WO', 1, 1);
	t.equal(textarea.value, 'WO');
	insertText(textarea, 'A');
	t.equal(textarea.value, 'WAO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
});

test('replace selected text', t => {
	t.plan(4);
	const textarea = getField('WO', 0, 1);
	t.equal(textarea.value, 'WO');
	insertText(textarea, 'A');
	t.equal(textarea.value, 'AO');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
});

test('fire input event', t => {
	const textarea = getField();
	textarea.addEventListener('input', event => {
		t.equal(event.type, 'input');
		t.equal(event.inputType, 'insertText');
		t.end();
	});
	insertText(textarea, 'A');
});