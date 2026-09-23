import { default as Root } from './FormRoot.vue';
import { default as Item } from './FormItem.vue';
import { default as ItemTitle } from './FormItemTitle.vue';
import { default as ItemRequired } from './FormItemRequired.vue';
import { default as ItemErrors } from './FormItemErrors.vue';

export const Form = {
  Root,
  Item,
  ItemTitle,
  ItemRequired,
  ItemErrors
};

export * from './types';
export * from './composables';
export * from './constants';
