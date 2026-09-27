import { SpinnerPlugin } from '../plugin';
import VSpinner from '../VSpinner.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('SpinnerPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(SpinnerPlugin);

    const spinnerComponent = app.component('VSpinner');

    expect(spinnerComponent).toBeDefined();
    expect(spinnerComponent).toBe(VSpinner);
  });

  it('Плагин имеет функцию install', () => {
    expect(SpinnerPlugin.install).toBeDefined();
    expect(typeof SpinnerPlugin.install).toBe('function');
  });
});
