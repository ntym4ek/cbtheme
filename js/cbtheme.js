const menuHide = 1024; // ширина экрана (обычно lg), начиная с которой убираем мобильное меню

(function ($) {
  Drupal.behaviors.cbtheme = {
    attach: function (context, settings) {

      // --- Главное Меню ------------------------------------------------------
      $(".expanded > a").on("click", (e) => {
        // не переходить по ссылке на выпадающих меню
        e.preventDefault();
      });

      // --- Сообщения ---------------------------------------------------------
      function closeMessages() {
        $("div.messages").removeClass("visible");
        setTimeout(() => {
          $("div.messages").remove();
        }, 500);
      }
      function setTimer(ms = 8000) {
        return setTimeout(() => {
          closeMessages();
        }, ms);
      }

      // если есть всплывающее окно с сообщениями, показать его через .5 сек и убрать через 8 сек.
      // если наведён курсор, то убрать через 2 сек после смещения курсора за пределы окна
      $("div.messages").once( () => {
        var closeTimer = null;
        setTimeout(() => {
          $("div.messages").addClass("visible");
        }, 500);
        closeTimer = setTimer();
        $("div.messages .close").on("click", () => {
          closeMessages();
        });
        $("div.messages").mouseover(() => {
          clearTimeout(closeTimer);
        }).mouseleave(() => {
          closeTimer = setTimer(1000);
        });
      });

      // --- Плавный скролл к якорям -------------------------------------------
      $(document).on("click", 'a[href^="#"]', function (event) {
        event.preventDefault();
        this.blur();

        $('html, body').animate({
          scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);
      });

      // -- Аккордеон ----------------------------------------------------------
      class Accordion {
        constructor(target, config) {
          this._el = typeof target === "string" ? document.querySelector(target) : target;
          if (this._el ) {
            const defaultConfig = {
              alwaysOpen: true,
              duration: 350,
              linkSelector: ".acc-link",
              boxSelector: ".acc-box",
            };
            this._config = Object.assign(defaultConfig, config);
            this.addEventListener();
          }
        }
        addEventListener() {
          this._el.addEventListener("click", (e) => {
            const elHeader = e.target.closest(this._config.linkSelector);
            if (!elHeader) {
              return;
            }
            if (!this._config.alwaysOpen) {
              const elOpenItem = this._el.querySelector(".show");
              if (elOpenItem) {
                elOpenItem !== elHeader.parentElement ? this.toggle(elOpenItem) : null;
              }
            }
            this.toggle(elHeader.parentElement);
          });
        }
        show(el) {
          const elBody = el.querySelector(this._config.boxSelector);
          if (elBody.classList.contains("collapsing") || el.classList.contains("show")) {
            return;
          }
          elBody.style.display = "block";
          const height = elBody.offsetHeight;
          elBody.style.height = 0;
          elBody.style.overflow = "hidden";
          elBody.style.transition = `height ${this._config.duration}ms ease`;
          elBody.classList.add("collapsing");
          el.classList.add("slidedown");
          // elBody.offsetHeight;
          elBody.style.height = `${height}px`;
          window.setTimeout(() => {
            elBody.classList.remove("collapsing");
            el.classList.remove("slidedown");
            elBody.classList.add("collapse");
            el.classList.add("show");
            elBody.style.display = "";
            elBody.style.height = "";
            elBody.style.transition = "";
            elBody.style.overflow = "";
          }, this._config.duration);
        }
        hide(el) {
          const elBody = el.querySelector(this._config.boxSelector);
          if (elBody.classList.contains("collapsing") || !el.classList.contains("show")) {
            return;
          }
          elBody.style.height = `${elBody.offsetHeight}px`;
          // elBody.offsetHeight;
          elBody.style.display = "block";
          elBody.style.height = 0;
          elBody.style.overflow = "hidden";
          elBody.style.transition = `height ${this._config.duration}ms ease`;
          elBody.classList.remove("collapse");
          el.classList.remove("show");
          elBody.classList.add("collapsing");
          window.setTimeout(() => {
            elBody.classList.remove("collapsing");
            elBody.classList.add("collapse");
            elBody.style.display = "";
            elBody.style.height = "";
            elBody.style.transition = "";
            elBody.style.overflow = "";
          }, this._config.duration);
        }
        toggle(el) {
          el.classList.contains("show") ? this.hide(el) : this.show(el);
        }
      }
      document.querySelectorAll(".accordion").forEach(
        (el) => {
          new Accordion(el, {
            alwaysOpen: false,
          });
        }
      );


      // -- Блоки с подкатом ---------------------------------------------------
        // Высота элемента в закрытом состоянии задаётся атрибутом data-closed-height.
        // Обёрнуто в timeout, так как иначе неверно определяет высоту контейнеров
      // Параметры, которые можно задать в атрибутах data-:
      // - closed-height высота блока в закрытом состоянии (0)
      // - more-text - текст на кнопке открытия блока (unfold)
      // - less-text - текст на кнопке закрытия блока (fold)
      // - body-click - открывать ли блок по клику на самом блоке (false)
      setTimeout(() => {
        $(".readmore").each((i, el) => {
        var collEl = $(el);
        const fullHeight = collEl.height();
        const closedHeight = collEl.data("closed-height") ? collEl.data("closed-height") : 0;
        const moreText = collEl.data("more-text") ? collEl.data("more-text") : Drupal.t("unfold");
        const lessText = collEl.data("less-text") ? collEl.data("less-text") : Drupal.t("fold");
        const bodyClick = collEl.data("body-click") ? collEl.data("body-click") : false;
        // если высота с текстом больше заданной,
        // то скрыть подкатом лишнее и добавить ссылку для открытия
        if (fullHeight > closedHeight) {
          const duration = 250;
          collEl.addClass("closed").css("height", closedHeight);
          collEl.after("<div class='more'>" + moreText + "</div>");
          var collLink = collEl.next(".more");

          var openMore = function() {
            collEl.animate({"height": fullHeight}, {duration: duration }, "linear");
            collEl.addClass("open").removeClass("closed");
            collLink.text(lessText).addClass("open").removeClass("closed");
            if (bodyClick) {
              collEl.unbind("click", openMore).bind("click", closeMore);
            }
            collLink.unbind("click", openMore).bind("click", closeMore);
          };

          var closeMore = function() {
            collEl.animate({"height": closedHeight}, {duration: duration }, "linear");
            collEl.addClass("closed").removeClass("open");
            collLink.text(moreText).addClass("closed").removeClass("open");
            if (bodyClick) {
              collEl.unbind("click").bind("click", openMore);
            }
            collLink.unbind("click").bind("click", openMore);
          };

          if (bodyClick) {
            collEl.bind("click", openMore);
          }
          collLink.bind("click", openMore);
        }
      });
      }, 100);


      // -- Мобильное боковое меню ---------------------------------------------
        // если < menuHide, то вывести боковое меню
        // повесить обработчик свайпа
      function showMobileNav() {
        $("body").data("nav-mobile-opened", true).addClass("nav-mobile-opened");
      }
      function hideMobileNav() {
        $("body").data("nav-mobile-opened", false).removeClass("nav-mobile-opened");
      }
      function toggleMobileNav() {
        if ($("body").data("nav-mobile-opened")) {
          hideMobileNav();
        } else {
          showMobileNav();
        }
      }

      if ($(window).width() < menuHide) {
        // клик по иконке Меню
        $(".nav-mobile-label").on("click", (e) => {
          toggleMobileNav();
          e.stopPropagation();
        });

        $(".nav-mobile-left .page, .nav-mobile-left .nav-mobile-label").on("swiped-right", (e) => {
          // если свайп вправо на Свайпере или блоке с классом main-menu-disabled, то не показываем меню
          let is_prohibited = $(e.target).closest(".mobile-menu-disabled, .swiper").length > 0;
          if (!is_prohibited) { showMobileNav(); }
        });
        $(".nav-mobile-right .page, .nav-mobile-right .nav-mobile-label").on("swiped-left", (e) => {
          // если свайп вправо на Свайпере, то не показываем меню
          let is_prohibited = $(e.target).closest(".mobile-menu-disabled, .swiper").length > 0;
          if (!is_prohibited) { showMobileNav(); }
        });
        $(".nav-mobile-left .page, .nav-mobile-left .nav-mobile, .nav-mobile-left .nav-mobile-label").on("swiped-left", () => {
          hideMobileNav();
        });
        $(".nav-mobile-right .page, .nav-mobile-right .nav-mobile, .nav-mobile-right .nav-mobile-label").on("swiped-right", () => {
          hideMobileNav();
        });
        $(".page").on("click", () => {
          hideMobileNav();
        });
      }

      // -- Аккордеон пунктов в мобильном меню ---------------------------------
      new Accordion(document.querySelector(".nav-mobile .main-menu"), {
        alwaysOpen: false,
        linkSelector: ".expanded > a",
        boxSelector: ".expanded .sub-menu",
      });
      new Accordion(document.querySelector(".nav-mobile .secondary-menu"), {
        alwaysOpen: false,
        linkSelector: ".expanded > a",
        boxSelector: ".expanded .sub-menu",
      });

      // -- Кнопка Поделиться --------------------------------------------------
      $(".share .share-btn").click((e) => {
        $(e.target).closest(".share").toggleClass("open");
      });

      // -- Кнопка Печать ------------------------------------------------------
      $("#print-btn").on("click", function() {
        window.print();
      });

      // -- Кнопка Click-to-copy -----------------------------------------------
      $('body').once( () => {
        var options = {
          copy: Drupal.t("Copy to clipboard"),
          copied: Drupal.t("Copied"),
          failed: Drupal.t("Failed to copy"),
        };
        // добавить кнопку для элементов с классом "c0py"
        buildCopy(options);
      });

      // -- Кнопка Вернуться к началу страницы ---------------------------------
      $(window).scroll(function () {
        if ($(this).scrollTop() > 400) {
          $('#back-to-top').fadeIn();
        } else {
          $('#back-to-top').fadeOut();
        }
      });
      $("#back-to-top").click(function() {
        $("html, body").animate({ scrollTop: 0 }, 500);
      });
    }
  };
})(jQuery);
