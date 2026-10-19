import { isListenerAttr } from '../isListenerAttr';
import { describe, expect, it } from 'vitest';

describe('isListenerAttr', () => {
  it('распознаёт onXxx слушатели', () => {
    expect(isListenerAttr('onClick')).toBe(true);
    expect(isListenerAttr('onFocusin')).toBe(true);
    expect(isListenerAttr('onKeydown')).toBe(true);
    expect(isListenerAttr('onUpdate:modelValue')).toBe(true);
  });

  it('не считает обычные attrs слушателями', () => {
    expect(isListenerAttr('class')).toBe(false);
    expect(isListenerAttr('id')).toBe(false);
    expect(isListenerAttr('data-test')).toBe(false);
    expect(isListenerAttr('onclick')).toBe(false);
  });
});
