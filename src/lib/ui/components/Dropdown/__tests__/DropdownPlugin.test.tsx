import { DropdownPlugin } from '../plugin';
import VDropdown from '../VDropdown.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('DropdownPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(DropdownPlugin);

    const dropdownComponent = app.component('VDropdown');

    expect(dropdownComponent).toBeDefined();
    expect(dropdownComponent).toBe(VDropdown);
  });

  it('Плагин имеет функцию install', () => {
    expect(DropdownPlugin.install).toBeDefined();
    expect(typeof DropdownPlugin.install).toBe('function');
  });
});
