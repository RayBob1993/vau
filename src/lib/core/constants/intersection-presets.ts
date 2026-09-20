import { defineEnum } from '../utils';

export const IntersectionPresets = defineEnum({
  LAZY_IMAGE: {
    threshold: 0,
    rootMargin: '50px 0px 50px 0px'
  },

  /** Для бесконечного скролла */
  INFINITE_SCROLL: {
    threshold: 0,
    rootMargin: '100px 0px 100px 0px'
  },

  /** Для отслеживания видимости 50% элемента */
  HALF_VISIBLE: {
    threshold: 0.5
  },

  /** Для точного определения полной видимости */
  FULL_VISIBLE: {
    threshold: 1.0
  },

  /** Для пошагового отслеживания видимости */
  STEPPED: {
    threshold: [0, 0.25, 0.5, 0.75, 1]
  }
});
