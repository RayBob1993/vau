import { ProgressPlugin } from '../plugin';
import VProgress from '../VProgress.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ProgressPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ProgressPlugin);

    const progressComponent = app.component('VProgress');

    expect(progressComponent).toBeDefined();
    expect(progressComponent).toBe(VProgress);
  });

  it('Плагин имеет функцию install', () => {
    expect(ProgressPlugin.install).toBeDefined();
    expect(typeof ProgressPlugin.install).toBe('function');
  });
});
