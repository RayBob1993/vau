import { AvatarGroupPlugin } from '../plugin';
import VAvatarGroup from '../VAvatarGroup.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('AvatarGroupPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(AvatarGroupPlugin);

    const avatarGroupComponent = app.component('VAvatarGroup');

    expect(avatarGroupComponent).toBeDefined();
    expect(avatarGroupComponent).toBe(VAvatarGroup);
  });

  it('Плагин имеет функцию install', () => {
    expect(AvatarGroupPlugin.install).toBeDefined();
    expect(typeof AvatarGroupPlugin.install).toBe('function');
  });
});
