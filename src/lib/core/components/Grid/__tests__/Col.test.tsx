import { Grid } from '../index';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Grid', () => {
  describe('Col', () => {
    it('рендерит div с базовым классом и слотом', () => {
      const wrapper = mount(() => (
        <Grid.Col>
          <p>Колонка</p>
        </Grid.Col>
      ));

      const el = wrapper.get('div.col');

      expect(el.find('p').text()).toBe('Колонка');
    });

    it('добавляет классы размера и breakpoint', () => {
      const wrapper = mount(() => (
        <Grid.Col size={6} sizeMd={12} sizeXs="auto"/>
      ));

      const el = wrapper.get('div');

      expect(el.classes()).toContain('col--size-6');
      expect(el.classes()).toContain('col--size-md-12');
      expect(el.classes()).toContain('col--size-xs-auto');
    });

    it('добавляет классы offset и order', () => {
      const wrapper = mount(() => (
        <Grid.Col offset={2} orderLg={1}/>
      ));

      const el = wrapper.get('div');

      expect(el.classes()).toContain('col--offset-2');
      expect(el.classes()).toContain('col--order-lg-1');
    });
  });
});
