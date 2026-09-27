import type { ZodError, ZodType } from 'zod';
import type { ComputedRef, MaybeRefOrGetter, Ref, VNode } from 'vue';
import type { Maybe, MaybeNull } from '../../types';

export type FormModelValues = unknown;

/**
 * Базовое ограничение модели формы. `any` в значениях — намеренно: `Record<string, unknown>`
 * не принимает `interface Model {}` (нет implicit index signature), а модели пользователей — интерфейсы.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormModel = Record<string, any>;

export type FormRules <MODEL> = {
  [K in keyof MODEL]?: ZodType<MODEL[K], MODEL[K]>;
};

export type FormFieldName<MODEL extends FormModel = FormModel> = keyof MODEL & string;

export interface FormProps<MODEL extends FormModel = FormModel> {
  /** Контроллер из `useForm()`: model, rules, состояние и действия формы. */
  form: FormController<MODEL>;
}

export interface FormSubmitEvent {
  isValid: boolean;
  /** Вернуть model к initial. */
  reset: VoidFunction;
  /** Принять текущую model как новый initial (после успешного сохранения). */
  commit: VoidFunction;
}

export interface FormItemEmits {
  valid: [];
  invalid: [];
}

/** Метаданные «касаемости» и отличия от initial (поле или форма). */
export interface FormMetaFlags {
  /** Значение менялось хотя бы раз (липкий флаг до reset формы). */
  isDirty: boolean;
  /** Значение никогда не меняли. */
  isPristine: boolean;
  /** Текущее значение отличается от снимка initial. */
  isChanged: boolean;
}

export interface FormValidityFlags {
  isValid: boolean;
}

export interface FormSlots {
  default?: () => Array<VNode>;
}

export type FormValidationResult = Promise<boolean>;

/**
 * Результат validate на уровне формы.
 * `isValid` — честный результат этого прогона; `isLatest === false` — прогон устарел
 * (takeLatest: пришёл более новый validate), события и скролл не применялись.
 */
export interface FormRootValidationResult {
  isValid: boolean;
  isLatest: boolean;
}

/** Результат проверки всей model по схеме `rules` — независимо от смонтированных полей. */
export interface FormModelValidationResult<MODEL extends FormModel = FormModel> {
  isValid: boolean;
  /** Ошибки по имени поля (в т.ч. для полей, которых сейчас нет в DOM). */
  errors: Partial<Record<FormFieldName<MODEL>, Array<FormItemError>>>;
}

/**
 * Типизированная ссылка на поле контроллера: `<Form.Item :field="form.field('email')">`.
 * Геттеры читают смонтированный FormItem с этим именем; пока его нет — нейтральные значения.
 */
export interface FormField<MODEL extends FormModel = FormModel, NAME extends FormFieldName<MODEL> = FormFieldName<MODEL>> extends FormValidityFlags, FormMetaFlags {
  readonly name: NAME;
  /** FormItem с этим именем сейчас смонтирован. */
  readonly isMounted: boolean;
  /** Участвует в валидации: есть rule и поле не disabled. */
  readonly isValidatable: boolean;
  /** Результат последнего parse (в т.ч. silent), без учёта `isValidatable`. */
  readonly isFieldValid: boolean;
  readonly isRequired: boolean;
  readonly validationStatus: FormItemValidationStatus;
  /** Валидация поля; не смонтировано или невалидируемое — `true`. */
  validate: (silent?: boolean) => FormValidationResult;
  clearValidateErrors: VoidFunction;
}

/**
 * Контроллер формы (`useForm()`): model, rules, состояние и действия — единая точка
 * работы с формой из script и шаблона, в т.ч. вне `<Form.Root>` (кнопка в футере модалки).
 * Реактивен: геттеры читают внутренние ref.
 */
export interface FormController<MODEL extends FormModel = FormModel> extends FormValidityFlags, FormMetaFlags {
  model: MODEL;
  readonly rules: Maybe<FormRules<MODEL>>;
  /** Смонтирован `Form.Root` (скролл к ошибке, классы хоста). На `isValid` / `canSubmit` не влияет. */
  readonly isBound: boolean;
  /** Форма disabled (опция `useForm`). */
  readonly isDisabled: boolean;
  /** Хоть одно валидируемое поле показывает ошибку. */
  readonly hasErrors: boolean;
  /** Хоть одно поле в процессе validate. */
  readonly isValidating: boolean;
  /** `!isDisabled && isValid && isChanged && !isValidating`. */
  readonly canSubmit: boolean;
  field: <NAME extends FormFieldName<MODEL>>(name: NAME) => FormField<MODEL, NAME>;
  /**
   * Валидировать всю model по `rules`. Смонтированные FormItem обновляют UI.
   * `silent: true` — без показа ошибок. Результат — схема, не набор смонтированных полей.
   */
  validate: (silent?: boolean) => FormValidationResult;
  /**
   * То же, что `validate`, плюс словарь ошибок по ключам (в т.ч. без UI).
   */
  validateModel: (silent?: boolean) => Promise<FormModelValidationResult<MODEL>>;
  /** Submit: громкая валидация и `onSubmit` — как нативный submit формы. */
  submit: () => Promise<void>;
  /** Скрыть статусы и ошибки всех полей; `isValid` пересчитывается тихо. */
  clearValidate: VoidFunction;
  /** Восстановить model к `initial`, очистить валидацию и meta. */
  reset: VoidFunction;
  /** Принять текущую model как новый `initial`, очистить валидацию и meta. */
  commit: VoidFunction;
}

export type FormItemError = ZodError['issues'][number];

export interface FormItemProps {
  disabled?: boolean;
  /** Поле контроллера: `form.field('email')`. Без `field` item не участвует в model / валидации. */
  field?: FormField;
}

export interface FormItemScopedSlot extends FormValidityFlags, FormMetaFlags {
  validationStatus: FormItemValidationStatus;
  isRequired: boolean;
  errors: Array<FormItemError>;
}

export interface FormItemSlots {
  default?: (props: FormItemScopedSlot) => Array<VNode>;
  header?: (props: FormItemScopedSlot) => Array<VNode>;
  footer?: (props: FormItemScopedSlot) => Array<VNode>;
}

export interface FormItemField {
  isDisabled?: MaybeRefOrGetter<boolean>;
}

export interface FormItemContext {
  props: FormItemProps;
  validationStatus: Ref<FormItemValidationStatus>;
  validationErrors: Ref<Array<FormItemError>>;
  /**
   * Регистрация контрола в поле. Несколько контролов (группа Radio/Checkbox) — несколько регистраций;
   * поле disabled, когда disabled все контролы.
   * @returns Функция отписки — вызвать в `onUnmounted` контрола.
   */
  registerField: (field: FormItemField) => VoidFunction;
  isRequired: ComputedRef<boolean>;
  isDisabled: ComputedRef<boolean>;
  validate: (silent?: boolean) => FormValidationResult;
  clearValidateErrors: VoidFunction;
}

export interface FormItemValidationStatus {
  isError: boolean;
  isValidating: boolean;
  isSuccess: boolean;
}

export interface FormItemInstance {
  readonly id: string;
  /** Имя поля из `field.name`. */
  readonly name: Maybe<string>;
  readonly isValidatable: boolean;
  /**
   * Результат последнего parse поля (в т.ч. silent).
   * Не зависит от показа ошибок в UI.
   */
  readonly isFieldValid: boolean;
  readonly isValid: boolean;
  readonly isRequired: boolean;
  readonly isDirty: boolean;
  readonly isPristine: boolean;
  readonly isChanged: boolean;
  readonly validationStatus: FormItemValidationStatus;
  readonly props: FormItemProps;
  readonly el: HTMLElement | null;
  /** Валидировать поле. Невалидируемое (disabled / без rule) — всегда `true`, согласованно с `isValid`. */
  validate: (silent?: boolean) => FormValidationResult;
  /** Очистить UI-статус и ошибки; логический `isFieldValid` пересчитывается silent-parse. */
  clearValidateErrors: VoidFunction;
  /** Сброс isDirty (после Form.reset / commit). */
  resetMeta: VoidFunction;
}

/**
 * Контекст формы для FormItem и контролов (provide из `Form.Root`).
 * Реализуется контроллером; геттеры реактивны.
 */
export interface FormRootContext<MODEL extends FormModel = FormModel> {
  model: MODEL;
  readonly rules: Maybe<FormRules<MODEL>>;
  readonly isDisabled: boolean;
  /** Снимок model для reset и isChanged. */
  readonly initialModel: Maybe<MODEL>;
  /** Идёт `Form.reset()`: смена value не считается вводом пользователя. */
  readonly isResetting: boolean;
  registerFormItem: (formItem: FormItemInstance) => void;
  unregisterFormItem: (id: string) => void;
}

/**
 * Полный объект контроллера для `Form.Root`: публичный API плюс реестр полей.
 * Пользователю достаточно `FormController`.
 */
export interface FormControllerInternal<MODEL extends FormModel = FormModel> extends FormController<MODEL>, FormRootContext<MODEL> {
  /** Хост смонтирован (после mount + nextTick). */
  registerForm: VoidFunction;
  /** Хост размонтирован. */
  unregisterForm: VoidFunction;
  /** Смонтированный FormItem по имени. */
  getFormItem: (name: string) => MaybeNull<FormItemInstance>;
}
