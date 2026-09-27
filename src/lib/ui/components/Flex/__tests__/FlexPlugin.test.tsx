import { FlexPlugin } from '../plugin';
import VFlex from '../VFlex.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('FlexPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(FlexPlugin);

    const flexComponent = app.component('VFlex');

    expect(flexComponent).toBeDefined();
    expect(flexComponent).toBe(VFlex);
  });

  it('Плагин имеет функцию install', () => {
    expect(FlexPlugin.install).toBeDefined();
    expect(typeof FlexPlugin.install).toBe('function');
  });
});
