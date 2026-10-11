import type { MaybeNull } from '../../../types';
import { useToggle } from '../../../composables';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';

export interface UseSelectOpenOptions {
  isDisabled: MaybeRefOrGetter<boolean>;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
  onBlurRoot?: VoidFunction;
  onFocusRoot?: VoidFunction;
  getRootElement?: () => MaybeNull<HTMLElement>;
}

export function useSelectOpen (options: UseSelectOpenOptions) {
  const isDisabled = computed<boolean>(() => toValue(options.isDisabled));

  const [isOpen, setOpen] = useToggle();
  const [isFocus, setFocus] = useToggle();

  /**
   * mousedown по потомку фокусирует Root до click: focusin открывает список,
   * а тот же click иначе сразу закрыл бы его. Флаг подавляет close на этом жесте.
   */
  let suppressClickClose = false;

  /**
   * Открывает dropdown без перевода фокуса.
   */
  function open () {
    if (isDisabled.value) {
      return;
    }

    if (isOpen.value) {
      return;
    }

    setOpen(true);
    options.onOpen?.();
  }

  /**
   * Закрывает dropdown; при активном фокусе снимает его (инвариант focus ⇒ open).
   */
  function close () {
    if (isDisabled.value) {
      return;
    }

    const wasOpen = isOpen.value;
    const wasFocus = isFocus.value;

    if (wasOpen) {
      setOpen(false);
      options.onClose?.();
    }

    if (wasFocus) {
      setFocus(false);
      suppressClickClose = false;
      options.onBlurRoot?.();
    }
  }

  function toggle () {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  /**
   * Управляет isFocus. `true` гарантирует open (инвариант focus ⇒ open).
   */
  function setFocusState (value: boolean) {
    if (isDisabled.value) {
      return;
    }

    setFocus(value);

    if (value) {
      open();
    }
  }

  function focusRoot () {
    if (isDisabled.value) {
      return;
    }

    options.onFocusRoot?.();
  }

  /**
   * Перед возможным focusin от mousedown: если Root ещё не в фокусе,
   * следующий click по Value не должен вызывать close.
   */
  function handlePointerDown () {
    if (isDisabled.value) {
      return;
    }

    if (!isFocus.value) {
      suppressClickClose = true;
    }
  }

  /**
   * @returns `true`, если текущий click завершает жест открытия через focus.
   */
  function consumeClickCloseSuppression (): boolean {
    if (!suppressClickClose) {
      return false;
    }

    suppressClickClose = false;

    return true;
  }

  function handleFocusIn () {
    if (isDisabled.value) {
      return;
    }

    setFocusState(true);
  }

  function handleFocusOut (event: FocusEvent) {
    if (isDisabled.value) {
      return;
    }

    const rootElement = options.getRootElement?.();

    if (!rootElement) {
      return;
    }

    const relatedTarget = event.relatedTarget;

    if (relatedTarget instanceof Node && rootElement.contains(relatedTarget)) {
      return;
    }

    close();
  }

  function handleKeydown (event: KeyboardEvent) {
    if (isDisabled.value) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    toggle();
  }

  return {
    isOpen,
    isFocus,
    setFocus: setFocusState,
    open,
    close,
    toggle,
    focusRoot,
    handlePointerDown,
    consumeClickCloseSuppression,
    handleFocusIn,
    handleFocusOut,
    handleKeydown
  };
}
