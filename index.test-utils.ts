/*
 * `index` means the character-index of a node relative to its main element,
 * regardless of other HTML elements in between.
 * Example: "Hello <i>World<b>!</b></i>"
 * The tag `b` and the exclamation mark are at index 11
 */
export function getIndex(container: Node & ParentNode, target: Node): number {
	let index = 0;
	do {
		while (target.previousSibling) {
			index += target.previousSibling.textContent!.length;
			target = target.previousSibling;
		}

		target = target.parentElement!;
	} while (target && target !== container);

	return index;
}

// Get text node at an character index of an Element.
// Only needed because .setStart only accepts a character index relative to a single TextNode
export function getNodeAtIndex(container: Node, index: number): [Node, number] {
	let relativeIndex = index;
	let cursor = container;
	while (cursor?.firstChild) {
		cursor = cursor.firstChild;
		while (cursor && cursor.textContent!.length < relativeIndex) {
			relativeIndex -= cursor.textContent!.length;
			if (cursor.nextSibling) {
				cursor = cursor.nextSibling;
			}
		}
	}

	return [cursor, relativeIndex];
}

// Get Range that starts/ends across multiple/nested TextNodes of an Element.
// Only needed because .setStart only accepts a character index relative to a single TextNode
export function getSmartIndexRange(node: Node & ParentNode, start: number, end: number): Range {
	const range = document.createRange();
	range.setStart(...getNodeAtIndex(node, start));
	range.setEnd(...getNodeAtIndex(node, end));
	return range;
}
