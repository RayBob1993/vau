import { SectionPlugin } from '../plugin';
import VSection from '../VSection.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('SectionPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(SectionPlugin);

    const sectionComponent = app.component('VSection');

    expect(sectionComponent).toBeDefined();
    expect(sectionComponent).toBe(VSection);
  });

  it('Плагин имеет функцию install', () => {
    expect(SectionPlugin.install).toBeDefined();
    expect(typeof SectionPlugin.install).toBe('function');
  });
});
