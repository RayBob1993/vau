import { PaginationPlugin } from '../plugin';
import VPagination from '../VPagination.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('PaginationPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(PaginationPlugin);

    const paginationComponent = app.component('VPagination');

    expect(paginationComponent).toBeDefined();
    expect(paginationComponent).toBe(VPagination);
  });

  it('Плагин имеет функцию install', () => {
    expect(PaginationPlugin.install).toBeDefined();
    expect(typeof PaginationPlugin.install).toBe('function');
  });
});
