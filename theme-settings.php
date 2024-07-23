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
}
