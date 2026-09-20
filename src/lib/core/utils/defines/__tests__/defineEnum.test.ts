import { defineEnum } from '../defineEnum';
import { describe, expect, it } from 'vitest';

describe('defineEnum', () => {
  it('Замораживает объект и сохраняет значения', () => {
    const Sizes = defineEnum({
      SMALL: 'small',
      LARGE: 'large'
    });

    expect(Object.isFrozen(Sizes)).toBe(true);
    expect(Sizes.SMALL).toBe('small');
    expect(Sizes.LARGE).toBe('large');
  });

  it('Не позволяет изменять свойства', () => {
    const Direction = defineEnum({
      HORIZONTAL: 'horizontal',
      VERTICAL: 'vertical'
    });

    expect(() => {
      // @ts-expect-error проверка runtime-заморозки
      Direction.HORIZONTAL = 'diagonal';
    }).toThrow();

    expect(Direction.HORIZONTAL).toBe('horizontal');
  });
});
