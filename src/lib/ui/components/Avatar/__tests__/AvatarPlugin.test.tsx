import { AvatarPlugin } from '../plugin';
import VAvatar from '../VAvatar.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('AvatarPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(AvatarPlugin);

    const avatarComponent = app.component('VAvatar');

    expect(avatarComponent).toBeDefined();
    expect(avatarComponent).toBe(VAvatar);
  });

  it('Плагин имеет функцию install', () => {
    expect(AvatarPlugin.install).toBeDefined();
    expect(typeof AvatarPlugin.install).toBe('function');
  });
});
