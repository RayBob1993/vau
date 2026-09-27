import { AffixPlugin } from '../plugin';
import VAffix from '../VAffix.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('AffixPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(AffixPlugin);

    const affixComponent = app.component('VAffix');

    expect(affixComponent).toBeDefined();
    expect(affixComponent).toBe(VAffix);
  });

  it('Плагин имеет функцию install', () => {
    expect(AffixPlugin.install).toBeDefined();
    expect(typeof AffixPlugin.install).toBe('function');
  });
});
