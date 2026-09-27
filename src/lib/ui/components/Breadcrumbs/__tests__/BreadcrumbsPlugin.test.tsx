import { BreadcrumbsPlugin } from '../plugin';
import VBreadcrumbs from '../VBreadcrumbs.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('BreadcrumbsPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(BreadcrumbsPlugin);

    const breadcrumbsComponent = app.component('VBreadcrumbs');

    expect(breadcrumbsComponent).toBeDefined();
    expect(breadcrumbsComponent).toBe(VBreadcrumbs);
  });

  it('Плагин имеет функцию install', () => {
    expect(BreadcrumbsPlugin.install).toBeDefined();
    expect(typeof BreadcrumbsPlugin.install).toBe('function');
  });
});
