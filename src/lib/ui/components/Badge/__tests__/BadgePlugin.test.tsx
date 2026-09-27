import { BadgePlugin } from '../plugin';
import VBadge from '../VBadge.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('BadgePlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(BadgePlugin);

    const badgeComponent = app.component('VBadge');

    expect(badgeComponent).toBeDefined();
    expect(badgeComponent).toBe(VBadge);
  });

  it('Плагин имеет функцию install', () => {
    expect(BadgePlugin.install).toBeDefined();
    expect(typeof BadgePlugin.install).toBe('function');
  });
});
