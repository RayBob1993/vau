import { ContainerPlugin } from '../plugin';
import VContainer from '../VContainer.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ContainerPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ContainerPlugin);

    const containerComponent = app.component('VContainer');

    expect(containerComponent).toBeDefined();
    expect(containerComponent).toBe(VContainer);
  });

  it('Плагин имеет функцию install', () => {
    expect(ContainerPlugin.install).toBeDefined();
    expect(typeof ContainerPlugin.install).toBe('function');
  });
});
