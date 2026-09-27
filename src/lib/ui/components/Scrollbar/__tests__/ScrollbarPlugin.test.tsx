import { ScrollbarPlugin } from '../plugin';
import VScrollbar from '../VScrollbar.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ScrollbarPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ScrollbarPlugin);

    const scrollbarComponent = app.component('VScrollbar');

    expect(scrollbarComponent).toBeDefined();
    expect(scrollbarComponent).toBe(VScrollbar);
  });

  it('Плагин имеет функцию install', () => {
    expect(ScrollbarPlugin.install).toBeDefined();
    expect(typeof ScrollbarPlugin.install).toBe('function');
  });
});
