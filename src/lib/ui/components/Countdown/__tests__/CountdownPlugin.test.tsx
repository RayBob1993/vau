import { CountdownPlugin } from '../plugin';
import VCountdown from '../VCountdown.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('CountdownPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(CountdownPlugin);

    const countdownComponent = app.component('VCountdown');

    expect(countdownComponent).toBeDefined();
    expect(countdownComponent).toBe(VCountdown);
  });

  it('Плагин имеет функцию install', () => {
    expect(CountdownPlugin.install).toBeDefined();
    expect(typeof CountdownPlugin.install).toBe('function');
  });
});
