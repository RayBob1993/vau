import { defineEnum } from '../../../utils';

export const INPUT_NUMBER_STEP = 1;
export const INPUT_NUMBER_MIN = -Infinity;
export const INPUT_NUMBER_MAX = Infinity;
export const INPUT_NUMBER_WHEEL_DELAY = 100;
export const INPUT_NUMBER_VALUE_DEFAULT = 0;

export const INPUT_NUMBER_ACTIONS = defineEnum({
  DECREMENT: 'decrement',
  INCREMENT: 'increment'
});
