# insert-text-textarea [![][badge-gzip]](#link-npm)

  [badge-gzip]: https://img.shields.io/bundlephobia/minzip/insert-text-textarea.svg?label=gzipped
  [link-npm]: https://www.npmjs.com/package/insert-text-textarea

<img align="right" width="360" src="https://user-images.githubusercontent.com/1402241/55075820-e3645800-50ce-11e9-8591-9195c3cdfc8a.gif">

> Insert text in a `textarea` and `input[type=text]` (supports Firefox and Undo, where possible)

The text will be inserted **after the cursor** or it will replace any text that's selected, acting like a `paste` would.

You should use this instead of setting the `field.value` directly because:

- it doesn't break the undo history (in supported browsers)
- it fires an `input` event (with `event.inputType === 'insertText'`)
- it's the most efficient way of adding/replacing selected text in a field
- it's cross-browser (modern browsers)

It uses `document.execCommand('insertText')` in Chrome (which has **Undo** support) and it replicates its behavior in Firefox (without Undo support until [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1220696) is solved).

If you need IE support, use [insert-text-at-cursor](https://github.com/grassator/insert-text-at-cursor).

## Install

You can just download the [standalone bundle](https://packd.fregante.now.sh/insert-text-textarea@latest?name=insertText)

Or use `npm`:

```sh
npm install insert-text-textarea
```

```js
// This module is only offered as a ES Module
import insertText from 'insert-text-textarea';
```

## Usage

Insert text at the cursor, replacing any possible selected text:

```js
const textarea = document.querySelector('textarea');
const button = document.querySelector('.js-add-signature');
button.addEventListener(event => {
	insertText(textarea, 'Made by 🐝 with pollen.');
});
```

This will wrap the selected text (if any) with `**` on both sides:

```js
const textarea = document.querySelector('textarea');
const button = document.querySelector('.js-markdown-make-text-bold');
button.addEventListener(event => {
	// Don't use `getSelection()` if you want Firefox support
	const selectedText = value.slice(
		textarea.selectionStart,
		textarea.selectionEnd
	);
	insertText(textarea, '**' + selectedText + '**');
});
```

This will replace the entire content, equivalent to `field.value = 'New text!'` but with **undo** support:

```js
const textarea = document.querySelector('textarea');
textarea.select(); // The text needs to be selected so it will be replaced
insertText(textarea, 'New text!');
```

# Related

- [indent-textarea](https://github.com/fregante/indent-textarea) - Add editor-like tab-to-indent functionality to `<textarea>`, in a few bytes. Uses this module.
- [fit-textarea](https://github.com/fregante/fit-textarea) - Automatically expand a `<textarea>` to fit its content, in a few bytes.
- [Refined GitHub](https://github.com/sindresorhus/refined-github) - Uses this module.
