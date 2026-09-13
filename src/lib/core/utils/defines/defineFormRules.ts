import type { FormRules } from '../../components/Form/types';
import { markRaw } from 'vue';

/**
 * Объявляет словарь Zod-правил для `VForm`.
 *
 * Возвращает тот же объект `rules`, обёрнутый в `markRaw`: Vue не делает
 * схемы глубоко реактивными. Zod-схемы — деревья классов с внутренним
 * состоянием; Proxy ломает `instanceof`/парсинг и даёт лишние затраты на
 * трекинг. Реактивность нужна у значений модели формы, а не у самих rules.
 *
 * @example
 * const rules = computed(() =>
 *   defineFormRules({
 *     email: z.string().email(),
 *     name: z.string().min(1),
 *   }),
 * );
 */
export function defineFormRules<MODEL> (rules: FormRules<MODEL>): FormRules<MODEL> {
  return markRaw(rules);
}
