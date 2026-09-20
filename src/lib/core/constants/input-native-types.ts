import { defineEnum } from '../utils';

export const InputNativeTypes = defineEnum({
  TEXT: 'text',
  EMAIL: 'email',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  PASSWORD: 'password'
});
