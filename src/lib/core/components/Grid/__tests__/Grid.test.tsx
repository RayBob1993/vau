import { Grid } from '../index';
import { Sizes } from '../../../constants/sizes';
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Grid', () => {
  it('вкладывает Container, Row и Col', () => {
    const wrapper = mount(() => (
      <Grid.Container size={Sizes.SMALL}>
        <Grid.Row>
          <Grid.Col size={12}>Полная ширина</Grid.Col>
        </Grid.Row>
      </Grid.Container>
    ));

    const container = wrapper.get('div.container');

    expect(container.classes()).toContain(`container--size-${Sizes.SMALL}`);
    expect(container.find('div.row div.col').text()).toBe('Полная ширина');
  });
});
