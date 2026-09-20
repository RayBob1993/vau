import { defineEnum } from '../utils';

export const InputModes = defineEnum({
  NUMERIC: 'numeric',
  TEL: 'tel',
  TEXT: 'text',
  DECIMAL: 'decimal',
  SEARCH: 'search',
  EMAIL: 'email',
  NONE: 'none',
  URL: 'url'
});
