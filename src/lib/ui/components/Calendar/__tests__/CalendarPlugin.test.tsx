import { CalendarPlugin } from '../plugin';
import VCalendar from '../VCalendar.vue';
import { createApp } from 'vue';
import { describe, expect, it } from 'vitest';

describe('CalendarPlugin', () => {
  it('Корректно регистрирует плагин', () => {
    const app = createApp({});

    app.use(CalendarPlugin);

    const calendarComponent = app.component('VCalendar');

    expect(calendarComponent).toBeDefined();
    expect(calendarComponent).toBe(VCalendar);
  });

  it('Плагин имеет функцию install', () => {
    expect(CalendarPlugin.install).toBeDefined();
    expect(typeof CalendarPlugin.install).toBe('function');
  });
});
