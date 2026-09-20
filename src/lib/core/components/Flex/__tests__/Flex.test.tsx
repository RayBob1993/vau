import { Flex } from '../index';
import { Direction } from '../../../constants/direction';
import { FlexAlign } from '../../../constants/flex-align';
import { FlexJustify } from '../../../constants/flex-justify';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

describe('Flex', () => {
  it('Проверка отрисовки', () => {
    const wrapper = mount(() => (
      <Flex.Root>
        <span class="flex-content">Контент</span>
      </Flex.Root>
    ));

    expect(wrapper.exists()).toBeTruthy();
    expect(wrapper.get('div.flex').find('.flex-content').text()).toBe('Контент');
  });

  it('по умолчанию включает wrap', () => {
    const wrapper = mount(() => (
      <Flex.Root/>
    ));

    expect(wrapper.get('div.flex').classes()).toContain('flex--wrap');
    expect(wrapper.get('div.flex').classes()).not.toContain('flex--no-wrap');
  });

  it('отключает wrap при wrap={false}', () => {
    const wrapper = mount(() => (
      <Flex.Root wrap={false}/>
    ));

    expect(wrapper.get('div.flex').classes()).toContain('flex--no-wrap');
    expect(wrapper.get('div.flex').classes()).not.toContain('flex--wrap');
  });

  it('добавляет класс направления', () => {
    const wrapper = mount(() => (
      <Flex.Root direction={Direction.VERTICAL}/>
    ));

    expect(wrapper.get('div.flex').classes()).toContain(`flex--direction-${Direction.VERTICAL}`);
  });

  it('добавляет классы justify и align', () => {
    const wrapper = mount(() => (
      <Flex.Root
        justify={FlexJustify.BETWEEN}
        align={FlexAlign.CENTER}
      />
    ));

    const el = wrapper.get('div.flex');

    expect(el.classes()).toContain(`flex--justify-${FlexJustify.BETWEEN}`);
    expect(el.classes()).toContain(`flex--align-${FlexAlign.CENTER}`);
  });

  it('добавляет классы justify и align для breakpoint', () => {
    const wrapper = mount(() => (
      <Flex.Root
        justifyMd={FlexJustify.END}
        alignXs={FlexAlign.STRETCH}
      />
    ));

    const el = wrapper.get('div.flex');

    expect(el.classes()).toContain(`flex--justify-md-${FlexJustify.END}`);
    expect(el.classes()).toContain(`flex--align-xs-${FlexAlign.STRETCH}`);
  });

  it('вкладывает Flex.Item', () => {
    const wrapper = mount(() => (
      <Flex.Root>
        <Flex.Item flex="grow">Элемент</Flex.Item>
      </Flex.Root>
    ));

    const item = wrapper.get('div.flex div.flex-item');

    expect(item.text()).toBe('Элемент');
    expect(item.classes()).toContain('flex-item--flex-grow');
  });
});
