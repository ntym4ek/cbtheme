<?php

function project_preprocess_mimemail_message(&$vars)
{
  // переменные для шаблона письма
  // logo для писем (берём лого из текущей темы, если существует)
  $path = path_to_theme() . '/images/logo/logo_mail.png';
  $vars['logo_mail'] = file_exists($path) ? file_create_url($path) : theme_get_setting('logo');
  $site_name  = (theme_get_setting('toggle_name') ? filter_xss_admin(variable_get('site_name', 'Drupal')) : '');
  $vars['site_name'] = $site_name;
  // подпись на языке письма
  $vars['sign']   = empty($vars['message']['params']['context']['sign']) ? t('Postal robot') . ' ' . t($site_name) : $vars['message']['params']['context']['sign'];
  // notice - текст сообщения о том, что письмо сформировано автоматически
  $vars['notice'] = !isset($vars['message']['params']['context']['auto']) ? t('This message was generated automatically and does not require a response') : $vars['message'] ['params']['context']['auto'];
}
