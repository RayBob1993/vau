import { vClickOutside } from '../directive';
import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

function mountClickOutside (onOutside: ReturnType<typeof vi.fn>) {
  const Harness = defineComponent({
    directives: {
      clickOutside: vClickOutside
    },
    setup () {
      return {
        onOutside
      };
    },
    template: `
      <div class="root">
        <div
          class="inside"
          v-click-outside="onOutside"
        >
          <span class="child">Внутри</span>
        </div>
        <button
          class="outside"
          type="button"
        >
          Снаружи
        </button>
      </div>
    `
  });

  return mount(Harness, {
    attachTo: document.body
  });
}

describe('vClickOutside', () => {
  it('вызывает обработчик при клике снаружи', async () => {
    const onOutside = vi.fn();
    const wrapper = mountClickOutside(onOutside);

    await wrapper.get('.outside').trigger('click');

    expect(onOutside).toHaveBeenCalledTimes(1);
    expect(onOutside.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
    expect(onOutside.mock.calls[0]?.[1]).toBe(wrapper.get('.inside').element);

    wrapper.unmount();
  });

  it('не вызывает обработчик при клике по элементу', async () => {
    const onOutside = vi.fn();
    const wrapper = mountClickOutside(onOutside);

    await wrapper.get('.inside').trigger('click');

    expect(onOutside).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it('не вызывает обработчик при клике по потомку', async () => {
    const onOutside = vi.fn();
    const wrapper = mountClickOutside(onOutside);

    await wrapper.get('.child').trigger('click');

    expect(onOutside).not.toHaveBeenCalled();

    wrapper.unmount();
  });

  it('снимает слушатель при unmount', async () => {
    const onOutside = vi.fn();
    const wrapper = mountClickOutside(onOutside);

    wrapper.unmount();

    document.body.dispatchEvent(new MouseEvent('click', {
      bubbles: true
    }));

    expect(onOutside).not.toHaveBeenCalled();
  });
});
