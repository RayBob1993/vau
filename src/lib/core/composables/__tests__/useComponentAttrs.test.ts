import { useComponentAttrs } from '../useComponentAttrs';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

describe('useComponentAttrs', () => {
  it('делит source на attrs и listeners', () => {
    const source = ref({
      id: 'field',
      class: 'demo',
      'data-test': '1',
      onClick: vi.fn(),
      onFocusin: vi.fn()
    });

    let api: ReturnType<typeof useComponentAttrs>;

    mount(defineComponent({
      setup () {
        api = useComponentAttrs(source);

        return () => null;
      }
    }));

    expect(api!.attrs.value).toEqual({
      id: 'field',
      class: 'demo',
      'data-test': '1'
    });
    expect(Object.keys(api!.listeners.value).sort()).toEqual(['onClick', 'onFocusin']);
  });

  it('реагирует на изменение source', () => {
    const source = ref<Record<string, unknown>>({
      id: 'a',
      onClick: vi.fn()
    });

    let api: ReturnType<typeof useComponentAttrs>;

    mount(defineComponent({
      setup () {
        api = useComponentAttrs(source);

        return () => null;
      }
    }));

    expect(api!.attrs.value).toEqual({ id: 'a' });
    expect(Object.keys(api!.listeners.value)).toEqual(['onClick']);

    source.value = {
      class: 'b',
      onFocus: vi.fn()
    };

    expect(api!.attrs.value).toEqual({ class: 'b' });
    expect(Object.keys(api!.listeners.value)).toEqual(['onFocus']);
  });
});
