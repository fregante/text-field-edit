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

	return (
		value.slice(0, selectionStart)
		+ '{'
		+ value.slice(selectionStart, selectionEnd)
		+ '}'
		+ value.slice(selectionEnd)
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

test('insert() replaces selected text even if string is ""', t => {
	const field = getField('{W}O');
	textFieldEdit.insert(field, '');
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

test('replace() supports strings', t => {
	const field = getField('ABACUS');
	textFieldEdit.replace(field, 'A', 'THE ');
	t.equal(getState(field), '{THE }BACUS');
	textFieldEdit.replace(field, 'BA', 'AR');
	t.equal(getState(field), 'THE {AR}CUS');
	t.end();
});

test('replace() supports strings with cursor placed after replaced text', t => {
	const field = getField('ABACUS');
	textFieldEdit.replace(field, 'A', 'THE ', 'after-replacement');
	t.equal(getState(field), 'THE |BACUS');
	textFieldEdit.replace(field, 'BA', 'AR', 'after-replacement');
	t.equal(getState(field), 'THE AR|CUS');
	t.end();
});

test('replace() supports strings with a replacer function', t => {
	const field = getField('ABACUS');
	textFieldEdit.replace(field, 'A', (match, index, string) => {
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
	textFieldEdit.replace(field, /a/i, 'U');
	t.equal(getState(field), '{U}BACUS');
	textFieldEdit.replace(field, /[ab]{2}/i, 'NI');
	t.equal(getState(field), 'U{NI}CUS');
	t.end();
});

test('replace() supports regex with a replacer function', t => {
	const field = getField('ABACUS');
	textFieldEdit.replace(field, /a/i, (match, index, string) => {
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
	textFieldEdit.replace(field, /ba(c)us/i, (match, group1, index) => {
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
	textFieldEdit.replace(field, /(b)/i, '($1)');
	t.equal(getState(field), 'A{($1)}A'); // TODO: This should be A(B)A
	t.end();
});

test('replace() supports regex with global flag', t => {
	const field = getField('1a23cd456');
	textFieldEdit.replace(field, /\d+/g, '**');
	t.equal(getState(field), '**a**cd{**}');
	t.end();
});

test('replace() supports regex with global flag with a replacer function', t => {
	const field = getField('Abacus');
	let i = 0;
	textFieldEdit.replace(field, /a/gi, (match, index, string) => {
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
