import { SwitchPlugin } from '../plugin';
import VSwitch from '../VSwitch.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('SwitchPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(SwitchPlugin);

    const switchComponent = app.component('VSwitch');

    expect(switchComponent).toBeDefined();
    expect(switchComponent).toBe(VSwitch);
  });

  it('Плагин имеет функцию install', () => {
    expect(SwitchPlugin.install).toBeDefined();
    expect(typeof SwitchPlugin.install).toBe('function');
  });
});
