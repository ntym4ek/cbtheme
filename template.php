<?php
/**
 * @file
 * The primary PHP file for this theme.
 */

/**
 * Implements hook_theme_registry_alter().
 */
function cbtheme_theme_registry_alter(&$theme_registry)
{
  // вставляем свою preprocess функцию после основной
  $preprocess_functions = $theme_registry['page']['preprocess functions'];
  $key = array_search('template_preprocess_page', $preprocess_functions);
  if ($key !== FALSE) {
    array_splice($preprocess_functions, ++$key, 0, ['cbtheme_preprocess_page']);
    $preprocess_functions = array_unique($preprocess_functions);
    $theme_registry['page']['preprocess functions'] = $preprocess_functions;
  }
}

/**
 * Implements hook_preprocess_html().
 */
function cbtheme_preprocess_html(&$vars)
{
  // -- настройки темы
    // сторона расположения меню (умолчанию слева)
  $vars['classes_array'][] = 'nav-mobile-' . (theme_get_setting('nav-mobile-position') ?? 'left');
    // ширина экрана при которой мобильное меню заменяется на десктопное
  drupal_add_js(['theme' => ['nav_mobile_hide_width' => theme_get_setting('nav-mobile-hide-width') ?? '1024']], ['type' => 'setting']);
}

/**
 * Implements hook_preprocess_page().
 */
function cbtheme_preprocess_page(&$vars)
{
  // ширина экрана, до которой выводится мобильная версия баннера
  $vars['banner_break'] = 767;

  // можно отключить шапку
  $vars['is_header_on'] = true;

  // можно отключить заголовок
  $vars['is_title_on'] = true;

  // выводить ли заголовок в виде широкого баннера
  $vars['is_banner_on'] = false;

  // сменить шаблон страницы на пустой
  //  if (arg(0) == 'card') {
  //    $vars['theme_hook_suggestions'][] = 'page__empty';
  //  }


  // Вывод баннера, если в папке page-banners есть изображение с именем, аналогичным пути.
  // Проверка наличия файла выполняется по всей цепочке пути, от самой длинной до короткой.
  // Для главной страницы проверяется наличие баннера с именем "front".
  $banner_uri = '';
  if (drupal_is_front_page()) {
    $paths = ['front'];
  } else {
    $paths = [$_GET['q']];
    if ($_GET['q'] !== drupal_get_path_alias($_GET['q'])) {
      $paths[] = drupal_get_path_alias($_GET['q']);
    }
  }
  foreach($paths as $path) {
    if ($chunks = explode('/', $path)) {
      do {
        $filename = implode('--', $chunks);
        foreach(['jpg', 'png'] as $ext) {
          $uri = 'public://images/page-banners/' . $filename . '.' . $ext;
          if (file_exists($uri)) {
            $banner_uri = $uri;
            break;
          }
        }
        array_pop($chunks);
      } while (count($chunks));
    }
  }
  if ($banner_uri) {
    $vars['is_banner_on'] = true;
    $vars['is_title_on'] = false;
    $vars['banner_title_prefix'] = '';
    $vars['banner_title'] = drupal_get_title();
    $vars['banner_title_suffix'] = '';
    $vars['banner_url'] = file_create_url($banner_uri);
    // если стиля для мобильного баннера не существует, создать его
    if (!image_style_load('banner_mobile')) {
      $style = image_style_save(['name' => 'banner_mobile']);
      $effect = array(
        'name' => 'image_scale',
        'data' => array(
          'width' => 1080,
          'height' => 1080,
          'upscale' => false,
        ),
        'isid' => $style['isid'],
      );
      image_effect_save($effect);
    }
    $vars['banner_mobile_url'] = image_style_url('banner_mobile', $banner_uri);
  }

  // вывод многоуровневого меню
  if ($menu_name = variable_get('menu_main_links_source', '')) {
    $main_menu = module_exists('i18n_menu') ? i18n_menu_translated_tree($menu_name) : menu_tree($menu_name);
    $main_menu['#attributes']['class'] = ['main-menu'];
    $vars['primary_nav'] = render($main_menu);
  }
  else {
    $vars['primary_nav'] = FALSE;
  }

  if ($menu_name = variable_get('menu_secondary_links_source', '')) {
    $sec_menu =  module_exists('i18n_menu') ? i18n_menu_translated_tree($menu_name) : menu_tree($menu_name);
    $sec_menu['#attributes']['class'] = ['secondary-menu'];
    $vars['secondary_nav'] = render($sec_menu);
  }
  else {
    $vars['secondary_nav'] = FALSE;
  }
}


/**
 * Implements hook_theme().
 */
function cbtheme_theme()
{
  return [
    'button_icon' => array(             // кнопка с возможностью добавить иконку
      'render element' => 'element',
    ),
  ];
}


/**
 * Pre-processes variables for the "region" theme hook.
 */
function cbtheme_preprocess_region(array &$vars)
{
  $region = $vars['region'];

  // Content region.
  if (in_array($region, ['header', 'highlighted', 'sidebar_first', 'content', 'sidebar_second'])) {
    $vars['theme_hook_suggestions'][] = 'region__no_wrapper';
  }
}

/**
 * Returns HTML for a region.
 */
function cbtheme_region__no_wrapper($vars)
{
  return $vars['elements']['#children'];
}

/**
 * Pre-processes variables for the "block" theme hook.
 */
function cbtheme_preprocess_block(array &$vars)
{
  // Use a bare template for the page's main content.
  if ($vars['block_html_id'] == 'block-system-main') {
    $vars['theme_hook_suggestions'][] = 'block__no_wrapper';
  }
  $vars['title_attributes_array']['class'][] = 'block-title';
}

/**
 * Returns HTML for a block.
 */
function cbtheme_block__no_wrapper($vars)
{
  return $vars['elements']['#children'];
}

/**
 * Pre-processes variables for the "image" theme hook.
 */
function cbtheme_preprocess_image(&$vars)
{
  // удалить атрибуты размера для изображений
  unset($vars['width']);
  unset($vars['height']);
}

/**
 * Implements theme_menu_tree().
 * выводим многоуровневое меню с дополнительными классами
 */
function cbtheme_menu_tree($vars)
{
  $attributes = $vars['#tree']['#attributes'] ?? ['class' => []];

  // определить глубину уровня
  $depth = 0;
  foreach ($vars["#tree"] as $index => $item) {
    if (is_numeric($index)) {
      $depth = $item["#original_link"]["depth"] ?? $depth;
    }
  }
  $attributes['class'][] = $depth > 1 ? 'sub-menu' : 'menu';
  $attributes['class'][] = 'level-' . $depth;

  return '<ul' . drupal_attributes($attributes) . '>' . $vars['tree'] . '</ul>';
}

/**
 * Implements hook_preprocess_node().
 */
function cbtheme_preprocess_node(&$vars)
{
  // возможность создавать шаблоны
  $node_type_suggestion_key = array_search('node__' . $vars['type'], $vars['theme_hook_suggestions']);
  if ($node_type_suggestion_key !== FALSE) {
    $node_view_mode_suggestion = 'node__' . $vars['type'] . '__' . $vars['view_mode'];
    array_splice($vars['theme_hook_suggestions'], $node_type_suggestion_key + 1, 0, array($node_view_mode_suggestion));
    $node_view_mode_suggestion = 'node__' . $vars['view_mode'];
    array_splice($vars['theme_hook_suggestions'], $node_type_suggestion_key, 0, array($node_view_mode_suggestion));
  }
  if ($vars['view_mode'] == 'full') {
    $vars["classes_array"][] = 'node-full';
  }
}


/**
 * Implements hook_preprocess_button().
 */
function cbtheme_preprocess_button(&$vars)
{
  // добавим Кнопкам класс для темизации и цвета
  if (!isset($vars["element"]["#attributes"])) $vars["element"]["#attributes"] = [];
  if (!isset($vars["element"]["#attributes"]['class'])) $vars["element"]["#attributes"]['class'] = [];

  // добавляем только, если класс не был добавлен ранее (например в кастомных формах)
  if (!in_array('btn', $vars["element"]['#attributes']['class'])) {
    $vars["element"]['#attributes']['class'][] = 'btn';
    if (isset($vars["element"]["#id"])) {
      if (strpos($vars["element"]["#id"], 'delete') !== FALSE || strpos($vars["element"]["#id"], 'remove') !== FALSE) {
        $vars["element"]['#attributes']['class'][] = 'btn-danger';
//        $vars["element"]['#attributes']['class'][] = 'btn-sm';
        if (strpos($vars["element"]["#id"], 'file') !== FALSE) {
          $vars["element"]["#value"] = 'x';
          $vars["element"]['#attributes']['class'][] = 'btn-with-icon';
        }
      }
      elseif (strpos($vars["element"]["#id"], 'submit') !== FALSE) {
        $vars["element"]['#attributes']['class'][] = 'btn-primary';
      }
      elseif(!in_array('btn-link', $vars["element"]['#attributes']['class'])) {
        $vars["element"]['#attributes']['class'][] = 'btn-default';
      }
    }
  }
}


/**
 * Button theme function.
 * @see theme_button().
 */
function cbtheme_button_icon($vars)
{
  $element = $vars['element'];
  $element['#attributes']['type'] = 'submit';
  element_set_attributes($element, array('id', 'name', 'value'));

  $element['#attributes']['class'][] = 'form-' . $element['#button_type'];
  if (!empty($element['#attributes']['disabled'])) {
    $element['#attributes']['class'][] = 'form-button-disabled';
  }

  if (empty($element['#text'])) {
    $element['#text'] = $element['#value'];
  }

  return '<button' . drupal_attributes($element['#attributes']) . '>' . $element['#text'] . '</button>';
}

/**
 * Returns HTML for status and/or error messages, grouped by type.
 *
 * An invisible heading identifies the messages for assistive technology.
 * Sighted users see a colored box. See http://www.w3.org/TR/WCAG-TECHS/H69.html
 * for info.
 *
 * @param $variables
 *   An associative array containing:
 *   - display: (optional) Set to 'status' or 'error' to display only messages
 *     of that type.
 */
function cbtheme_status_messages($variables) {
  $display = $variables['display'];
  $output = '';

  $status_heading = array(
    'status' => t('Status message'),
    'error' => t('Error message'),
    'warning' => t('Warning message'),
  );
  foreach (drupal_get_messages($display) as $type => $messages) {
    $output .= "<div class=\"messages $type\">\n";
    $output .= "<div class=\"container\">\n";
    if (!empty($status_heading[$type])) {
      $output .= '<h2 class="element-invisible">' . $status_heading[$type] . "</h2>\n";
    }
    if (count($messages) > 1) {
      $output .= " <ul>\n";
      foreach ($messages as $message) {
        $output .= '  <li>' . $message . "</li>\n";
      }
      $output .= " </ul>\n";
    }
    else {
      $output .= reset($messages);
    }
    $output .= "</div>\n";
    $output .= "<div class='close'><span>x</span></div>\n";
    $output .= "</div>\n";
  }
  return $output;
}

/**
 * Добавляет хуки для препроцессинга enities из eck
 */
function cbtheme_preprocess(&$variables, $hook)
{
  // todo срабатывает на node_edit_form и бросает ошибку
  //  отследить, где применяется и определить точные условия
  //  (пока добавлено определение и исключение форм)
  if (isset($variables['elements']['#entity_type']) && isset($variables["elements"]["#type"]) && $variables["elements"]["#type"] != 'form') {
    $myhook = "preprocess_{$variables['elements']['#entity_type']}";
    $modules = module_implements($myhook);

    foreach ($modules as $module) {
      $function = "{$module}_{$myhook}";
      $function($variables);
    }
  }
}
