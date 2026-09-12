import { isString } from '../utils';
import { type MaybeRefOrGetter, toValue } from 'vue';

/**
 * @description `useScrollTo` — плавная прокрутка к элементу.
 * Элемент: `MaybeRefOrGetter` (`Element`, `ref`/`shallowRef`, getter) или CSS-селектор (`string`).
 *
 * @example
 * ```ts
 * const myElement = useTemplateRef<HTMLDivElement>('myElement');
 *
 * useScrollTo(myElement, { behavior: 'smooth' });
 * useScrollTo(() => target.el);
 * useScrollTo('.form-item--invalid');
 * ```
 */
export function useScrollTo (
  el: MaybeRefOrGetter<Element | string | null | undefined>,
  options?: ScrollIntoViewOptions
) {
  const resolved = toValue(el);
  const element = isString(resolved)
    ? document.querySelector(resolved)
    : resolved;

  element?.scrollIntoView({
    behavior: 'smooth',
    ...options
  });
}
