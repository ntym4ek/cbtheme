(function ($) {

/**
 * Override Drupal's AJAX prototype beforeSend function so it can append the
 * throbber inside the pager links.
 */
if (Drupal.ajax !== undefined) {
  Drupal.ajax.prototype.beforeSend = function (xmlhttprequest, options) {
    // For forms without file inputs, the jQuery Form plugin serializes the form
    // values, and then calls jQuery's $.ajax() function, which invokes this
    // handler. In this circumstance, options.extraData is never used. For forms
    // with file inputs, the jQuery Form plugin uses the browser's normal form
    // submission mechanism, but captures the response in a hidden IFRAME. In this
    // circumstance, it calls this handler first, and then appends hidden fields
    // to the form to submit the values in options.extraData. There is no simple
    // way to know which submission mechanism will be used, so we add to extraData
    // regardless, and allow it to be ignored in the former case.
    if (this.form) {
      options.extraData = options.extraData || {};

      // Let the server know when the IFRAME submission mechanism is used. The
      // server can use this information to wrap the JSON response in a TEXTAREA,
      // as per http://jquery.malsup.com/form/#file-upload.
      options.extraData.ajax_iframe_upload = '1';

      // The triggering element is about to be disabled (see below), but if it
      // contains a value (e.g., a checkbox, textfield, select, etc.), ensure that
      // value is included in the submission. As per above, submissions that use
      // $.ajax() are already serialized prior to the element being disabled, so
      // this is only needed for IFRAME submissions.
      var v = $.fieldValue(this.element);
      if (v !== null) {
        options.extraData[this.element.name] = v;
      }
    }

    var $element = $(this.element);

    // Disable the element that received the change to prevent user interface
    // interaction while the Ajax request is in progress. ajax.ajaxing prevents
    // the element from triggering a new request, but does not prevent the user
    // from changing its value.
    $element.addClass('progress-disabled').attr('disabled', true);

    // Insert progressbar or throbber.
    if (this.progress.type == 'bar') {
      var progressBar = new Drupal.progressBar('ajax-progress-' + this.element.id, eval(this.progress.update_callback), this.progress.method, eval(this.progress.error_callback));
      if (this.progress.message) {
        progressBar.setProgress(-1, this.progress.message);
      }
      if (this.progress.url) {
        progressBar.startMonitoring(this.progress.url, this.progress.interval || 500);
      }
      this.progress.element = $(progressBar.element).addClass('ajax-progress ajax-progress-bar');
      this.progress.object = progressBar;
      if (!$element.closest('.file-widget,.form-item').length) {
        $element.before(this.progress.element);
      }
      else {
        $element.closest('.file-widget,.form-item').after(this.progress.element);
      }
    }
    else if (this.progress.type == 'throbber') {
      this.progress.element = $('<div class="ajax-progress ajax-progress-throbber"><div class="throbber-wrapper"><div class="throbber">&nbsp;</div></div></div>');
      if (this.progress.message) {
        $('.throbber', this.progress.element).after('<div class="message">' + this.progress.message + '</div>');
      }

      // If element is an input type, append after.
      if ($element.is('input') || $element.is('select')) {
        var $inputGroup = $element.closest('.form-item').find('.ajax-progress-throbber');
        if (!$inputGroup.length) {
          $element.wrap('<div class="ajax-wrapper">');
          // $inputGroup = $('<div class="ajax-throbber-wrapper">');
          // $element.after($inputGroup);
        }
        $element.after(this.progress.element);
        // $inputGroup.append(this.progress.element);
      }
      // Otherwise append the throbber inside the element.
      else {
        $element.append(this.progress.element);
      }
    }
  };

  /**
   * Override Drupal's AJAX prototype success function.
   */
  var success = Drupal.ajax.prototype.success;
  Drupal.ajax.prototype.success = function (response, status) {
    // If element is a select type, then unwrap.
    if ($(this.element).is('select') || $(this.element).is('input')) {
      // $(this.element).siblings('div.ajax-throbber-wrapper').remove();
      $(this.element).unwrap('div.ajax-wrapper');
    }

    // Invoke the original success handler.
    success.apply(this, arguments);
  };

  /**
   * Override Drupal's AJAX prototype error function.
   */
  var error = Drupal.ajax.prototype.error;
  Drupal.ajax.prototype.error = function (xmlhttprequest, uri, customMessage) {
    // If element is a select type, then unwrap.
    if ($(this.element).is('select') || $(this.element).is('input')) {
      // $(this.element).siblings('div.ajax-throbber-wrapper').remove();
      $(this.element).unwrap('div.ajax-wrapper');
    }

    // Invoke the original error handler.
    error.apply(this, arguments);
  };
}

})(jQuery);
