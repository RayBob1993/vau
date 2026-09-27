import { ConfigProviderPlugin } from '../plugin';
import VConfigProvider from '../VConfigProvider.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ConfigProviderPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ConfigProviderPlugin);

    const configProviderComponent = app.component('VConfigProvider');

    expect(configProviderComponent).toBeDefined();
    expect(configProviderComponent).toBe(VConfigProvider);
  });

  it('Плагин имеет функцию install', () => {
    expect(ConfigProviderPlugin.install).toBeDefined();
    expect(typeof ConfigProviderPlugin.install).toBe('function');
  });
});
