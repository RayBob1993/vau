import { Grid } from '../index';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Grid', () => {
  describe('Row', () => {
    it('рендерит обёртку с классами row и flex', () => {
      const wrapper = mount(() => (
        <Grid.Row>
          <span>Ячейка</span>
        </Grid.Row>
      ));

      const el = wrapper.get('div.row.flex');

      expect(el.find('span').text()).toBe('Ячейка');
    });

    it('по умолчанию включает gutters по горизонтали', () => {
      const wrapper = mount(() => (
        <Grid.Row/>
      ));

      expect(wrapper.get('div').classes()).toContain('row--gutters-x');
    });

    it('добавляет gutters по вертикали при guttersY', () => {
      const wrapper = mount(() => (
        <Grid.Row guttersY/>
      ));

      expect(wrapper.get('div').classes()).toContain('row--gutters-y');
    });

    it('отключает gutters по X при guttersX={false}', () => {
      const wrapper = mount(() => (
        <Grid.Row guttersX={false}/>
      ));

      expect(wrapper.get('div').classes()).not.toContain('row--gutters-x');
    });
  });
});
