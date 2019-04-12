const test = require('tape');
const insertText = require('.');

const getField = (repeat = 50) => {
	const field = document.createElement('textarea');
	field.textContent = 'Lorem ipsum dolor sit amet'.repeat(repeat);
	document.body.append(field);
	return field;
};

test('insert text in empty field', t => {
	t.plan(2);
	const textarea = getField(0);
	t.equal(textarea.value, '');
	insertText(textarea, 'hello world');
	t.equal(textarea.value, 'hello world');
});
