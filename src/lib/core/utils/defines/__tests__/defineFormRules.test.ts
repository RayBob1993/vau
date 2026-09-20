import { defineFormRules } from '../defineFormRules';
import { describe, expect, it } from 'vitest';
import { isReactive, reactive } from 'vue';
import { z } from 'zod';

describe('defineFormRules', () => {
  it('Возвращает тот же объект и не делает схемы реактивными', () => {
    const schema = {
      name: z.string().nonempty()
    };

    const rules = defineFormRules<{ name: string; }>(schema);

    expect(rules).toBe(schema);

    const state = reactive({
      rules
    });

    expect(isReactive(state.rules)).toBe(false);
    expect(state.rules).toBe(rules);
    expect(state.rules.name?.safeParse('').success).toBe(false);
    expect(state.rules.name?.safeParse('Иван').success).toBe(true);
  });
});
