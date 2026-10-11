import type { SelectRootContext } from '../../types';
import { useSelectValue } from '../useSelectValue';
import { describe, expect, it, vi } from 'vitest';

function createContext (overrides: Partial<{
  isDisabled: boolean;
  isFocus: boolean;
  isOpen: boolean;
}> = {}): SelectRootContext {
  return {
    activeOption: () => undefined,
    activeOptions: () => [],
    isOpen: () => overrides.isOpen ?? false,
    isFocus: () => overrides.isFocus ?? false,
    hasValue: () => false,
    props: () => ({}),
    modelValue: () => '',
    isDisabled: () => overrides.isDisabled ?? false,
    setFocus: vi.fn(),
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    focusRoot: vi.fn(),
    consumeClickCloseSuppression: vi.fn(() => false),
    removeValue: vi.fn(),
    setModelValue: vi.fn(),
    registerOption: vi.fn(),
    unregisterOption: vi.fn()
  };
}

describe('useSelectValue handleClick', () => {
  it('при focus+open вызывает close', () => {
    const context = createContext({ isFocus: true, isOpen: true });
    const { handleClick } = useSelectValue({ selectRootContext: context });

    handleClick();

    expect(context.close).toHaveBeenCalledOnce();
    expect(context.focusRoot).not.toHaveBeenCalled();
  });

  it('без focus вызывает focusRoot', () => {
    const context = createContext({ isFocus: false, isOpen: false });
    const { handleClick } = useSelectValue({ selectRootContext: context });

    handleClick();

    expect(context.focusRoot).toHaveBeenCalledOnce();
    expect(context.close).not.toHaveBeenCalled();
  });

  it('не закрывает click жеста открытия через focus', () => {
    const context = createContext({ isFocus: true, isOpen: true });

    context.consumeClickCloseSuppression = vi.fn(() => true);

    const { handleClick } = useSelectValue({ selectRootContext: context });

    handleClick();

    expect(context.close).not.toHaveBeenCalled();
    expect(context.focusRoot).toHaveBeenCalledOnce();
  });
});
