import type { DefaultTheme } from 'vitepress';
import type { DocLocaleConfig } from './types';

/**
 * Базовая (root) русская документация: контент в `docs/`.
 */
const ruThemeConfig: DefaultTheme.Config = {
  nav: [
    {
      text: 'Начало работы',
      link: '/getting-started',
      activeMatch: '^/getting-started'
    },
    { text: 'Core', link: '/core', activeMatch: '^/core' },
    { text: 'UI', link: '/ui', activeMatch: '^/ui' }
  ],
  sidebar: {
    '/getting-started': [
      {
        text: 'Введение',
        items: [{ text: 'Начало работы', link: '/getting-started' }]
      }
    ],
    '/core': [
      {
        text: 'Core',
        items: [
          { text: 'Обзор', link: '/core' },
          {
            text: 'Компоненты',
            collapsed: false,
            items: [
              { text: 'Обзор', link: '/core/components' },
              { text: 'Button', link: '/core/components/button' },
              { text: 'Drawer', link: '/core/components/drawer' },
              { text: 'Spinner', link: '/core/components/spinner' }
            ]
          },
          {
            text: 'Composables',
            collapsed: true,
            items: [{ text: 'Обзор', link: '/core/composables' }]
          },
          {
            text: 'Утилиты',
            collapsed: true,
            items: [{ text: 'Обзор', link: '/core/utils' }]
          },
          {
            text: 'Директивы',
            collapsed: true,
            items: [{ text: 'Обзор', link: '/core/directives' }]
          },
          {
            text: 'Константы',
            collapsed: true,
            items: [{ text: 'Обзор', link: '/core/constants' }]
          },
          {
            text: 'Типы',
            collapsed: true,
            items: [{ text: 'Обзор', link: '/core/types' }]
          }
        ]
      }
    ],
    '/ui': [
      {
        text: 'UI',
        items: [{ text: 'Обзор', link: '/ui' }]
      }
    ]
  },
  socialLinks: [
    { icon: 'github', link: 'https://github.com/RayBob1993/vau' }
  ],
  footer: {
    message: 'Выпущено под лицензией MIT'
  },
  outline: {
    label: 'На этой странице'
  },
  docPreview: {
    copy: 'Копировать',
    exampleNotFound: 'Пример не найден: {path}',
    loadSourceFailed: 'Не удалось загрузить исходник: {path}'
  },
  docFooter: {
    prev: 'Предыдущая страница',
    next: 'Следующая страница'
  },
  lastUpdated: {
    text: 'Обновлено'
  },
  editLink: {
    pattern: 'https://github.com/RayBob1993/vau-ui/edit/main/docs/:path',
    text: 'Редактировать страницу на GitHub'
  },
  search: {
    provider: 'local',
    options: {
      locales: {
        root: {
          translations: {
            button: {
              buttonText: 'Поиск',
              buttonAriaLabel: 'Поиск по документации'
            },
            modal: {
              displayDetails: 'Показать подробный список',
              resetButtonTitle: 'Сбросить поиск',
              backButtonTitle: 'Закрыть поиск',
              noResultsText: 'Ничего не найдено',
              footer: {
                selectText: 'Выбрать',
                selectKeyAriaLabel: 'ввод',
                navigateText: 'Навигация',
                navigateUpKeyAriaLabel: 'стрелка вверх',
                navigateDownKeyAriaLabel: 'стрелка вниз',
                closeText: 'Закрыть',
                closeKeyAriaLabel: 'Escape'
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Root-локаль русской документации (`docs/`).
 */
export const ruLocale: DocLocaleConfig = {
  label: 'Русский',
  lang: 'ru-RU',
  title: 'Vau',
  description: 'Компонентная UI-библиотека для Vue 3',
  themeConfig: ruThemeConfig
};
