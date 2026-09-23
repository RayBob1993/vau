/**
 * @description `isBeforeInDocument` — стоит ли `candidate` в DOM раньше `current`
 * (порядок обхода документа, `Node.compareDocumentPosition`).
 * Один и тот же узел — `false`.
 *
 * @example
 * const first = items.reduce((acc, el) => (isBeforeInDocument(el, acc) ? el : acc));
 */
export function isBeforeInDocument (candidate: Node, current: Node): boolean {
  return Boolean(current.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_PRECEDING);
}
