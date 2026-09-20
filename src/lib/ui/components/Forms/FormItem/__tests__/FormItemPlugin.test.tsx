import { FormItemPlugin } from '../plugin';
import VFormItem from '../VFormItem.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('FormItemPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(FormItemPlugin);

    const formItemComponent = app.component('VFormItem');

    expect(formItemComponent).toBeDefined();
    expect(formItemComponent).toBe(VFormItem);
  });

  it('Плагин имеет функцию install', () => {
    expect(FormItemPlugin.install).toBeDefined();
    expect(typeof FormItemPlugin.install).toBe('function');
  });
});
