import { InplacePlugin } from '../plugin';
import VInplace from '../VInplace.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('InplacePlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(InplacePlugin);

    const inplaceComponent = app.component('VInplace');

    expect(inplaceComponent).toBeDefined();
    expect(inplaceComponent).toBe(VInplace);
  });

  it('Плагин имеет функцию install', () => {
    expect(InplacePlugin.install).toBeDefined();
    expect(typeof InplacePlugin.install).toBe('function');
  });
});
