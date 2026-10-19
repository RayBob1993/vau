import { isListenerAttr } from '../utils';
import { computed, toValue, type MaybeRefOrGetter, type SetupContext } from 'vue';

type ComponentAttrs = SetupContext['attrs'];

/**
 * Делит переданные attrs на атрибуты и события.
 */
export function useComponentAttrs (
  source: MaybeRefOrGetter<ComponentAttrs>
) {
  const attrs = computed<ComponentAttrs>(() =>
    Object.fromEntries(
      Object.entries(toValue(source)).filter(([key]) => !isListenerAttr(key))
    )
  );

  const listeners = computed<ComponentAttrs>(() =>
    Object.fromEntries(
      Object.entries(toValue(source)).filter(([key]) => isListenerAttr(key))
    )
  );

  return {
    attrs,
    listeners
  };
}
