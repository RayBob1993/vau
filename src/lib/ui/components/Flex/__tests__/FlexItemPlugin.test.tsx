import { FlexItemPlugin } from '../plugin';
import VFlexItem from '../VFlexItem.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('FlexItemPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(FlexItemPlugin);

    const flexItemComponent = app.component('VFlexItem');

    expect(flexItemComponent).toBeDefined();
    expect(flexItemComponent).toBe(VFlexItem);
  });

  it('Плагин имеет функцию install', () => {
    expect(FlexItemPlugin.install).toBeDefined();
    expect(typeof FlexItemPlugin.install).toBe('function');
  });
});
