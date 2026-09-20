import { Spinner } from '../index';
import { Sizes } from '../../../constants/sizes';
import { Themes } from '../../../constants/themes';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Spinner', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mount(() => (
      <Spinner.Root/>
    ));

    const el = wrapper.get('div.spinner');

    expect(wrapper.exists()).toBeTruthy();
    expect(el.attributes('aria-label')).toBe('Loading');
    expect(el.classes().some(className => className.startsWith('spinner--theme-'))).toBe(false);
    expect(el.classes().some(className => className.startsWith('spinner--size-'))).toBe(false);
  });

  it('добавляет класс theme', () => {
    const wrapper = mount(() => (
      <Spinner.Root theme={Themes.PRIMARY}/>
    ));

    expect(wrapper.get('div.spinner').classes()).toContain(`spinner--theme-${Themes.PRIMARY}`);
  });

  it('добавляет класс size', () => {
    const wrapper = mount(() => (
      <Spinner.Root size={Sizes.MEDIUM}/>
    ));

    expect(wrapper.get('div.spinner').classes()).toContain(`spinner--size-${Sizes.MEDIUM}`);
  });
});
