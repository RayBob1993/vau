import { isUndefined } from '../utils';
import { type MaybeRefOrGetter, onUnmounted, toValue, watch } from 'vue';

export interface UseEscapeKeyOptions {
  /**
   * Когда истинно — вешается слушатель `keydown` на `window` (фаза capture).
   */
  when: MaybeRefOrGetter<boolean>;
  /**
   * Дополнительное условие вызова `onEscape`; по умолчанию считается включённым.
   */
  enabled?: MaybeRefOrGetter<boolean>;
  /**
   * Обработчик нажатия Escape (после проверок `when` и `enabled`).
   */
  onEscape: (event: KeyboardEvent) => void;
  /**
   * Вызывать `preventDefault` для события; по умолчанию `true`.
   */
  preventDefault?: MaybeRefOrGetter<boolean>;
}

/**
 * Подписка на клавишу Escape на `window` в фазе capture, пока `when` истинно.
 * При нескольких одновременно активных подписках порядок обработки не нормируется.
 */
export function useEscapeKey (options: UseEscapeKeyOptions) {
  function handleKeydown (event: KeyboardEvent) {
    if (event.key !== 'Escape') {
      return;
    }

    if (!toValue(options.when)) {
      return;
    }

    if (!isUndefined(options.enabled) && !toValue(options.enabled)) {
      return;
    }

    const shouldPreventDefault = options.preventDefault === undefined ? true : toValue(options.preventDefault);

    if (shouldPreventDefault) {
      event.preventDefault();
    }

    options.onEscape(event);
  }

  watch(
    () => toValue(options.when),
    isActive => {
      if (isActive) {
        window.addEventListener('keydown', handleKeydown, true);

        return;
      }

      window.removeEventListener('keydown', handleKeydown, true);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown, true);
  });
}
