# text-field-edit [![][badge-gzip]](#link-npm)

[badge-gzip]: https://img.shields.io/bundlephobia/minzip/text-field-edit.svg?label=gzipped
[link-npm]: https://www.npmjs.com/package/text-field-edit

<img align="right" width="360" src="https://user-images.githubusercontent.com/1402241/55075820-e3645800-50ce-11e9-8591-9195c3cdfc8a.gif">

> Insert text in a `<textarea>` and `<input>` (supports Firefox and Undo, where possible)

You should use this instead of setting the `field.value` directly because:

- it doesn't break the undo history (in supported browsers)
- it fires an `input` event (with `event.inputType === 'insertText'`)
- it's the most efficient way of adding/replacing selected text in a field
- it's cross-browser (modern browsers)

It uses `document.execCommand('insertText')` in Chrome (which has **Undo** support) and it replicates its behavior in Firefox (without Undo support until [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1220696) is solved).

If you need IE support, use [insert-text-at-cursor](https://github.com/grassator/insert-text-at-cursor).

## Install

You can just download the [standalone bundle](https://packd.fregante.now.sh/text-field-edit)

Or use `npm`:

```sh
npm install text-field-edit
```

```js
// This module is only offered as a ES Module
import * as textFieldEdit from 'text-field-edit';
```

## Usage

Insert text at the cursor, replacing any possible selected text, acting like a `paste` would:

```js
const input = document.querySelector('input');
const button = document.querySelector('.js-add-signature');
button.addEventListener(event => {
	textFieldEdit.insert(input, 'Made by 🐝 with pollen.');
});
```

This will act like `field.value = 'New value'` but with **undo** support and by firing the `input` event:

```js
const textarea = document.querySelector('textarea');
const resetButton = document.querySelector('.js-markdown-reset-field');
resetButton.addEventListener(event => {
	textFieldEdit.set(textarea, 'New value');
});
```

## API

### textFieldEdit.insert(field, text)

Inserts `text` at the cursor’s position, replacing any selection.

```js
const field = document.querySelector('input[type="text"]');
textFieldEdit.insert(field, '🥳');
// Changes field's value from 'Party|' to 'Party🥳|' (where | is the cursor)
```

#### field

Type: `HTMLTextAreaElement | HTMLInputElement`

#### text

Type: `string`

The text to insert at the cursor's position.

### textFieldEdit.set(field, text)

Replaces the entire content, equivalent to `field.value = 'New text!'` but with **undo** support and by firing the `input` event:

```js
const textarea = document.querySelector('textarea');
textFieldEdit.set(textarea, 'New text!');
```

#### field

Type: `HTMLTextAreaElement | HTMLInputElement`

#### text

Type: `string`

The new value that the field will have.

### textFieldEdit.replace(field, searchValue, replacement)

Finds and replaces strings and regular expressions in the field’s value, like `field.value = field.value.replace()` but leaves the last replacement selected like a text editor would.

Similar to [String#replace](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace)

```js
const textarea = document.querySelector('textarea');
textarea.value = 'Hello world';
textFieldEdit.replace(textarea, 'Hello', 'Ciao');
// Changes field's value from 'Hello world' to '|Ciao| world' (where | marks the selected text)
```

#### field

Type: `HTMLTextAreaElement | HTMLInputElement`

#### searchValue

Type: `string | RegExp`

The text to replace in the field’s value.

#### replacement

Type: `string | function`

The text that will replace `searchValue` or a callback function that matches [the signature in `String#replace`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter).

**Note**: replacement patterns (`replace(field, /hello (world)/, 'ciao $1')`) aren't supported.

### textFieldEdit.wrapSelection(field, wrappingText, endWrappingText?)

Adds the `wrappingText` before and after field’s selection (or cursor). If `endWrappingText` is provided, it will be used instead of `wrappingText` at on the right.

```js
const field = document.querySelector('textarea');
textFieldEdit.wrapSelection(field, '**');
// Changes the field's value from 'I |love| gudeg' to 'I **|love|** gudeg' (where | marks the selected text)
```

```js
const field = document.querySelector('textarea');
textFieldEdit.wrapSelection(field, '(', ')');
// Changes the field's value from '|almost| cool' to '(|almost|) cool' (where | marks the selected text)
```

### textFieldEdit.getSelection(field)

Utility method to get the selected text in a field or an empty string if nothing is selected.

```js
const field = document.querySelector('textarea');
textFieldEdit.getSelection(field);
// => 'almost'
// If the field's value is '|almost| cool' (where | marks the selected text)
```

#### field

Type: `HTMLTextAreaElement | HTMLInputElement`

# Related

- [indent-textarea](https://github.com/fregante/indent-textarea) - Add editor-like tab-to-indent functionality to `<textarea>`, in a few bytes. Uses this module.
- [fit-textarea](https://github.com/fregante/fit-textarea) - Automatically expand a `<textarea>` to fit its content, in a few bytes.
- [Refined GitHub](https://github.com/sindresorhus/refined-github) - Uses this module.
