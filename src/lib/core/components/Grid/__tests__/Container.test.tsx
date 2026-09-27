import { Grid } from '../index';
import { Sizes } from '../../../constants/sizes';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Grid', () => {
  describe('Container', () => {
    it('рендерит div с базовым классом и слотом', () => {
      const wrapper = mount(() => (
        <Grid.Container>
          <span class="inner">Контент</span>
        </Grid.Container>
      ));

      const el = wrapper.get('div.container');

      expect(el.find('.inner').text()).toBe('Контент');
    });

    it('добавляет класс размера при передаче size', () => {
      const wrapper = mount(() => (
        <Grid.Container size={Sizes.MEDIUM}/>
      ));

      expect(wrapper.get('div').classes()).toContain(`container--size-${Sizes.MEDIUM}`);
    });
  });
});
