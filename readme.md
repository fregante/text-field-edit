# insert-text-textarea [![(size)][badge-gzip]](#no-link) [![(status)][badge-travis]][link-travis]

  [badge-gzip]: https://img.shields.io/bundlephobia/minzip/insert-text-textarea.svg?label=gzipped
  [badge-travis]: https://api.travis-ci.com/bfred-it/insert-text-textarea.svg
  [link-travis]: https://travis-ci.com/bfred-it/insert-text-textarea

<img align="right" width="360" src="https://user-images.githubusercontent.com/1402241/55075820-e3645800-50ce-11e9-8591-9195c3cdfc8a.gif">

> Insert text in a textarea (supports Firefox and Undo, where possible)

The text will be inserted after the cursor and it will replace any text that's selected, acting like a `paste` would.

This is useful when creating "editor" buttons, to add text or wrap the selected text. For example, this module is used by [indent-textarea](https://github.com/bfred-it/indent-textarea).

An `input` event will also be dispatched, with `event.inputType === 'insertText'`.

It uses `document.execCommand('insertText')` in Chrome (which has **Undo** support) and it replicates its behavior in Firefox (without Undo support until [this bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1220696) is solved).

If you need IE support, use [insert-text-at-cursor](https://github.com/grassator/insert-text-at-cursor).

## Install

```
npm install insert-text-textarea
```

## Setup

```js
const insertText = require('insert-text-textarea');
```

```js
import insertText from 'insert-text-textarea';
```

## Usage

```js
const textarea = document.querySelector('textarea');
const button = document.querySelector('.js-add-signature');
button.addEventListener(event => {
	// It will add this text at the cursor, replacing any possible selected text
	insertText(textarea, 'Made by 🐝 with pollen.');
});
```

```js
const textarea = document.querySelector('textarea');
const button = document.querySelector('.js-markdown-make-text-bold');
button.addEventListener(event => {
	// This will replace the selected text (if any) with **selected text**
        // Don't use `getSelection()` if you want Firefox support
	const selectedText = value.slice(
		textarea.selectionStart,
		textarea.selectionEnd
	);
	insertText(textarea, '**' + selectedText + '**');
});
```

# Related

- [indent-textarea](https://github.com/bfred-it/indent-textarea) - Add editor-like tab-to-indent functionality to <textarea>, in a few bytes. Uses this module.
- [fit-textarea](https://github.com/bfred-it/fit-textarea) - Automatically expand a `<textarea>` to fit its content, in a few bytes.
- [Refined GitHub](https://github.com/sindresorhus/refined-github) - Uses this module.
