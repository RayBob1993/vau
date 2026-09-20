import { SelectPlugin } from '../plugin';
import VSelect from '../VSelect.vue';
import VOption from '../VOption.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('SelectPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(SelectPlugin);

    const selectComponent = app.component('VSelect');
    const optionComponent = app.component('VOption');

    expect(selectComponent).toBeDefined();
    expect(optionComponent).toBeDefined();
    expect(selectComponent).toBe(VSelect);
    expect(optionComponent).toBe(VOption);
  });

  it('Плагин имеет функцию install', () => {
    expect(SelectPlugin.install).toBeDefined();
    expect(typeof SelectPlugin.install).toBe('function');
  });
});
