<?php

/**
 * @file
 * Default theme implementation to display a single Drupal page while offline.
 *
 * All the available variables are mirrored in html.tpl.php and page.tpl.php.
 * Some may be blank but they are provided for consistency.
 *
 * @see template_preprocess()
 * @see template_preprocess_maintenance_page()
 *
 * @ingroup themeable
 */
?><!DOCTYPE html>
<html<?php print $html_attributes ?? '';?><?php print $rdf_namespaces ?? ''; ?>>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php print $head; ?>
    <title><?php print $head_title; ?></title>
    <?php print $styles; ?>
    <style>
      html, body { height: 100%; }
      body {
        display: flex; justify-content: center; align-items: center;
        background-color: #d9d9d9;
      }
      .maintenance {
        display: flex; flex-wrap: wrap;
        text-align: center;
      }
      .maintenance img { width: 200px; }
      .text {
        flex: auto;
        padding: 40px 30px;
      }
      .text h1 {
        border-bottom: 1px solid #999;
        line-height: 1.2;
        padding-bottom: 10px;
      }
      .logo {
        flex: auto; order: -1;
        text-align: center;
      }
      @media(min-width: 764px) {
        .maintenance {
          flex-wrap: nowrap;
          text-align: left;
          margin-top: -60px;
          width: 1000px; max-width: 100%;
        }
        .logo { flex: 0 1 350px; order: 1; }
        .text { flex: 1 0 500px; }
      }
    </style>
    <?php print $scripts; ?>
  </head>
  <body class="<?php print $classes; ?>" <?php print $attributes;?>>
    <div class="maintenance">
      <div class="text">
        <?php if (!empty($title)): ?>
          <h1 class="page-title"><?php print $title; ?></h1>
        <?php endif; ?>
        <?php if (!empty($content)): ?>
          <?php print $content; ?>
        <?php endif; ?>
      </div>
      <div class="logo">
        <img src="<?php print $logo; ?>" alt="<?php print $site_name; ?>" />
      </div>
    </div>
    <?php print $page_bottom; ?>
  </body>
</html>
