import test from 'tape';
import insertText from '.';

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

test('preserve focused item, if focusable', t => {
	t.equal(document.activeElement, document.body);
	const textarea = getField();
	insertText(textarea, 'A');
	t.equal(document.activeElement, document.body);
	t.end();
});

test('insert text in empty textarea', t => {
	const textarea = getField();
	t.equal(textarea.value, '');
	insertText(textarea, 'a');
	t.equal(textarea.value, 'a');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
	t.end();
});

test('insert text in empty input[type=text]', t => {
	const textarea = getField('', undefined, undefined, 'input');
	t.equal(textarea.value, '');
	insertText(textarea, 'a');
	t.equal(textarea.value, 'a');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
	t.end();
});

test('append text to unselected field', t => {
	const textarea = getField('W');
	t.equal(textarea.value, 'W');
	insertText(textarea, 'O');
	t.equal(textarea.value, 'WO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
	t.end();
});

test('insert text in the middle', t => {
	const textarea = getField('WO', 1, 1);
	t.equal(textarea.value, 'WO');
	insertText(textarea, 'A');
	t.equal(textarea.value, 'WAO');
	t.equal(textarea.selectionStart, 2);
	t.equal(textarea.selectionEnd, 2);
	t.end();
});

test('replace selected text', t => {
	const textarea = getField('WO', 0, 1);
	t.equal(textarea.value, 'WO');
	insertText(textarea, 'A');
	t.equal(textarea.value, 'AO');
	t.equal(textarea.selectionStart, 1);
	t.equal(textarea.selectionEnd, 1);
	t.end();
});

test('fire input event', t => {
	const textarea = getField();
	textarea.addEventListener('input', event => {
		t.equal(event.type, 'input');
		// TODO: t.equal(event.inputType, 'insertText');
		t.end();
	});
	insertText(textarea, 'A');
});
