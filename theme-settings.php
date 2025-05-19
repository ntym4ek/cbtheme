<?php

function cbtheme_form_system_theme_settings_alter(&$form, &$form_state)
{
  $form['other'] = array(
    '#type' => 'fieldset',
    '#title' => 'Дополнительные настройки',
    '#weight' => 5,
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
  );

  $form['other']['nav-mobile-position'] = array(
    '#type' => 'select',
    '#title' => 'Позиция мобильного меню',
    '#default_value' => theme_get_setting('nav-mobile-position') ?? 'left',
    '#options' => [
      'left' => 'Слева',
      'right' => 'Справа',
    ],
  );
  $form['other']['nav-mobile-hide-width'] = array(
    '#type' => 'textfield',
    '#title' => 'Breakpoint меню мобильной версии',
    '#description' => 'Ширина экрана, начиная с которой мобильное меню заменяется на десктопное',
    '#default_value' => theme_get_setting('nav-mobile-hide-width') ?? '1024',
    '#options' => [
      'left' => 'Слева',
      'right' => 'Справа',
    ],
  );
}
