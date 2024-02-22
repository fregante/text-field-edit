// Extracted from: https://github.com/fregante/zip-text-nodes

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
