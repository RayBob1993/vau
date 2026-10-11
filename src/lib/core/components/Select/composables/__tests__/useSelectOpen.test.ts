import { useSelectOpen } from '../useSelectOpen';
import { describe, expect, it, vi } from 'vitest';

function setupUseSelectOpen (overrides: {
  disabled?: boolean;
  onBlurRoot?: VoidFunction;
  onFocusRoot?: VoidFunction;
  getRootElement?: () => HTMLElement | null;
  onOpen?: VoidFunction;
  onClose?: VoidFunction;
} = {}) {
  return useSelectOpen({
    isDisabled: () => Boolean(overrides.disabled),
    onBlurRoot: overrides.onBlurRoot,
    onFocusRoot: overrides.onFocusRoot,
    getRootElement: overrides.getRootElement,
    onOpen: overrides.onOpen,
    onClose: overrides.onClose
  });
}

describe('useSelectOpen', () => {
  it('open не выставляет focus', () => {
    const onOpen = vi.fn();
    const api = setupUseSelectOpen({ onOpen });

    api.open();

    expect(api.isOpen.value).toBe(true);
    expect(api.isFocus.value).toBe(false);
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('setFocus(true) открывает (инвариант focus ⇒ open)', () => {
    const api = setupUseSelectOpen();

    api.setFocus(true);

    expect(api.isFocus.value).toBe(true);
    expect(api.isOpen.value).toBe(true);
  });

  it('close снимает focus и вызывает onBlurRoot', () => {
    const onBlurRoot = vi.fn();
    const onClose = vi.fn();
    const api = setupUseSelectOpen({ onBlurRoot, onClose });

    api.setFocus(true);
    api.close();

    expect(api.isOpen.value).toBe(false);
    expect(api.isFocus.value).toBe(false);
    expect(onBlurRoot).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('focusout внутри Root не закрывает', () => {
    const root = document.createElement('div');
    const child = document.createElement('button');

    root.appendChild(child);

    const api = setupUseSelectOpen({
      getRootElement: () => root
    });

    api.setFocus(true);

    api.handleFocusOut({
      relatedTarget: child
    } as unknown as FocusEvent);

    expect(api.isOpen.value).toBe(true);
    expect(api.isFocus.value).toBe(true);
  });

  it('focusout за пределы Root закрывает', () => {
    const root = document.createElement('div');
    const outside = document.createElement('button');

    const api = setupUseSelectOpen({
      getRootElement: () => root,
      onBlurRoot: vi.fn()
    });

    api.setFocus(true);

    api.handleFocusOut({
      relatedTarget: outside
    } as unknown as FocusEvent);

    expect(api.isOpen.value).toBe(false);
    expect(api.isFocus.value).toBe(false);
  });

  it('disabled блокирует open и setFocus', () => {
    const api = setupUseSelectOpen({ disabled: true });

    api.open();
    api.setFocus(true);

    expect(api.isOpen.value).toBe(false);
    expect(api.isFocus.value).toBe(false);
  });

  it('pointerdown без focus подавляет close на следующем click', () => {
    const api = setupUseSelectOpen();

    api.handlePointerDown();

    expect(api.consumeClickCloseSuppression()).toBe(true);
    expect(api.consumeClickCloseSuppression()).toBe(false);
  });

  it('pointerdown при уже активном focus не подавляет close', () => {
    const api = setupUseSelectOpen();

    api.setFocus(true);
    api.handlePointerDown();

    expect(api.consumeClickCloseSuppression()).toBe(false);
  });

  it('focusRoot вызывает onFocusRoot', () => {
    const onFocusRoot = vi.fn();
    const api = setupUseSelectOpen({ onFocusRoot });

    api.focusRoot();

    expect(onFocusRoot).toHaveBeenCalledOnce();
  });
});
