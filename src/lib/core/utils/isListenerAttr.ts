/** Как `isOn` в Vue: `onClick`, `onUpdate:modelValue`; не `onclick`. */
const onRE = /^on[^a-z]/;

export function isListenerAttr (key: string): boolean {
  return onRE.test(key);
}
