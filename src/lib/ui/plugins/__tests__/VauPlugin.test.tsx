import { Vau } from '../components';
import {
  AccordionPlugin,
  AlertPlugin,
  ButtonPlugin,
  CheckboxGroupPlugin,
  CheckboxPlugin,
  ColPlugin,
  ConfigProviderPlugin,
  ContainerPlugin,
  DividerPlugin,
  DrawerPlugin,
  FlexPlugin,
  FormItemPlugin,
  FormPlugin,
  InplacePlugin,
  InputCodePlugin,
  InputGroupPlugin,
  InputNumberPlugin,
  InputPasswordPlugin,
  InputPlugin,
  LayoutPlugin,
  MenuPlugin,
  ModalPlugin,
  RadioGroupPlugin,
  RadioPlugin,
  RowPlugin,
  ScrollbarPlugin,
  SectionPlugin,
  SelectPlugin,
  SpinnerPlugin,
  SwitchPlugin,
  TagPlugin,
  TextPlugin
} from '../../components';
import { ClickOutsidePlugin, LoadingPlugin, TooltipPlugin, VisiblePlugin } from '@vau/core';
import { createApp, type Plugin } from 'vue';
import { describe, expect, it, vi } from 'vitest';

const plugins: Array<Plugin> = [
  ClickOutsidePlugin,
  LoadingPlugin,
  TooltipPlugin,
  VisiblePlugin,
  AccordionPlugin,
  ButtonPlugin,
  ConfigProviderPlugin,
  ModalPlugin,
  InplacePlugin,
  DrawerPlugin,
  ScrollbarPlugin,
  SpinnerPlugin,
  TagPlugin,
  TextPlugin,
  SectionPlugin,
  ContainerPlugin,
  ColPlugin,
  RowPlugin,
  LayoutPlugin,
  FormPlugin,
  FormItemPlugin,
  InputPlugin,
  CheckboxPlugin,
  CheckboxGroupPlugin,
  InputPasswordPlugin,
  InputNumberPlugin,
  InputCodePlugin,
  RadioPlugin,
  RadioGroupPlugin,
  SwitchPlugin,
  SelectPlugin,
  AlertPlugin,
  DividerPlugin,
  FlexPlugin,
  InputGroupPlugin,
  MenuPlugin
];

describe('Vau', () => {
  it('Плагин имеет функцию install', () => {
    expect(Vau.install).toBeDefined();
    expect(typeof Vau.install).toBe('function');
  });

  it('install подключает готовые плагины', () => {
    const app = createApp({});
    const use = vi.spyOn(app, 'use');

    app.use(Vau);

    expect(use.mock.calls.map(([plugin]) => plugin)).toEqual([Vau, ...plugins]);
  });
});
