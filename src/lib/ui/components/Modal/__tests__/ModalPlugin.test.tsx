import { ModalPlugin } from '../plugin';
import VModal from '../VModal.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('ModalPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(ModalPlugin);

    const modalComponent = app.component('VModal');

    expect(modalComponent).toBeDefined();
    expect(modalComponent).toBe(VModal);
  });

  it('Плагин имеет функцию install', () => {
    expect(ModalPlugin.install).toBeDefined();
    expect(typeof ModalPlugin.install).toBe('function');
  });
});
