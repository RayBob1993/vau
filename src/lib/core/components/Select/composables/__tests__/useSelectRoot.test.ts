import type { SelectModelValue } from '../../types';
import { useSelectRoot } from '../useSelectRoot';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

function setupUseSelectRoot (overrides: {
  modelValue?: SelectModelValue;
  multiple?: boolean;
  disabled?: boolean;
} = {}) {
  const modelValue = ref<SelectModelValue>(overrides.modelValue ?? '');
  let api: ReturnType<typeof useSelectRoot>;

  mount(defineComponent({
    setup () {
      api = useSelectRoot({
        formRootContext: null,
        formItemContext: null,
        modelValue: () => modelValue.value,
        props: () => ({
          multiple: overrides.multiple,
          disabled: overrides.disabled
        }),
        onChangeModel: value => {
          modelValue.value = value;
        }
      });

      return () => null;
    }
  }));

  return {
    api: api!,
    modelValue
  };
}

describe('useSelectRoot', () => {
  it('removeValue убирает элемент из multiple без close', () => {
    const { api, modelValue } = setupUseSelectRoot({
      multiple: true,
      modelValue: ['a', 'b']
    });

    api.setFocus(true);
    api.removeValue('a');

    expect(modelValue.value).toEqual(['b']);
    expect(api.isOpen.value).toBe(true);
    expect(api.isFocus.value).toBe(true);
  });

  it('прокидывает isDisabled в open/focus', () => {
    const { api } = setupUseSelectRoot({ disabled: true });

    api.open();
    api.setFocus(true);

    expect(api.isOpen.value).toBe(false);
    expect(api.isFocus.value).toBe(false);
  });
});
