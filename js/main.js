/**
 * Main
 */

'use strict';

let isRtl = window.Helpers.isRtl(),
  isDarkStyle = window.Helpers.isDarkStyle(),
  menu,
  animate,
  isHorizontalLayout = false;

if (document.getElementById('layout-menu')) {
  isHorizontalLayout = document.getElementById('layout-menu').classList.contains('menu-horizontal');
}

(function () {
  setTimeout(function () {
    window.Helpers.initCustomOptionCheck();
  }, 1000);

  if (typeof Waves !== 'undefined') {
    Waves.init();
    Waves.attach(".btn[class*='btn-']:not([class*='btn-outline-']):not([class*='btn-label-'])", ['waves-light']);
    Waves.attach("[class*='btn-outline-']");
    Waves.attach("[class*='btn-label-']");
    Waves.attach('.pagination .page-item .page-link');
  }

  // Initialize menu
  //-----------------

  let layoutMenuEl = document.querySelectorAll('#layout-menu');
  // 如果不存在教程导航则初始化，否则另行初始化
  if (!document.getElementById('bookNavHasExit')) {
    var windowWidth = $(window).outerWidth(true);
    layoutMenuEl.forEach(function (element) {
      menu = new Menu(element, {
        orientation: isHorizontalLayout ? 'horizontal' : 'vertical',
        closeChildren: isHorizontalLayout ? true : false,
        // ? This option only works with Horizontal menu
        showDropdownOnHover: localStorage.getItem('templateCustomizer-' + templateName + '--ShowDropdownOnHover') // If value(showDropdownOnHover) is set in local storage
          ? localStorage.getItem('templateCustomizer-' + templateName + '--ShowDropdownOnHover') === 'true' // Use the local storage value
          : window.templateCustomizer !== undefined // If value is set in config.js
            ? window.templateCustomizer.settings.defaultShowDropdownOnHover // Use the config.js value
            : true, // Use this if you are not using the config.js and want to set value directly from here
        onOpen: function(e, v) {
          // pc端添加hover延时显示子菜单
          if (windowWidth >= window.Helpers.LAYOUT_BREAKPOINT) {
            // 移除自动添加open类
            setTimeout(function() {
              $(v).removeClass('open');
            }, 0);
            // 延时添加open类
            var openTimeout = setTimeout(function() {
              $(v).addClass('open');
            }, 400);
            // 如果在演示期间鼠标离开则清空timeout，以免鼠标离开后还添加open类
            $(v).one("mouseleave", function(){
              clearTimeout(openTimeout);
            });
          }
        }
      });
      // Change parameter to true if you want scroll animation
      window.Helpers.scrollToActive((animate = false));
      window.Helpers.mainMenu = menu;
    });
  }


  // Initialize menu togglers and bind click on each
  let menuToggler = document.querySelectorAll('.layout-menu-toggle');
  menuToggler.forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      window.Helpers.toggleCollapsed();
      // Enable menu state with local storage support if enableMenuLocalStorage = true from config.js
      if (config.enableMenuLocalStorage && !window.Helpers.isSmallScreen()) {
        try {
          localStorage.setItem(
            'templateCustomizer-' + templateName + '--LayoutCollapsed',
            String(window.Helpers.isCollapsed())
          );
          // Update customizer checkbox state on click of menu toggler
          let layoutCollapsedCustomizerOptions = document.querySelector('.template-customizer-layouts-options');
          if (layoutCollapsedCustomizerOptions) {
            let layoutCollapsedVal = window.Helpers.isCollapsed() ? 'collapsed' : 'expanded';
            layoutCollapsedCustomizerOptions.querySelector(`input[value="${layoutCollapsedVal}"]`).click();
          }
        } catch (e) { }
      }
    });
  });

  // Menu swipe gesture

  // Detect swipe gesture on the target element and call swipe In
  window.Helpers.swipeIn('.drag-target', function (e) {
    window.Helpers.setCollapsed(false);
  });

  // Detect swipe gesture on the target element and call swipe Out
  window.Helpers.swipeOut('#layout-menu', function (e) {
    if (window.Helpers.isSmallScreen()) window.Helpers.setCollapsed(true);
  });

  // Display in main menu when menu scrolls
  let menuInnerContainer = document.getElementsByClassName('menu-inner'),
    menuInnerShadow = document.getElementsByClassName('menu-inner-shadow')[0];
  if (menuInnerContainer.length > 0 && menuInnerShadow) {
    menuInnerContainer[0].addEventListener('ps-scroll-y', function () {
      if (this.querySelector('.ps__thumb-y').offsetTop) {
        menuInnerShadow.style.display = 'block';
      } else {
        menuInnerShadow.style.display = 'none';
      }
    });
  }

  // Update light/dark image based on current style
  function switchImage(style) {
    if (style === 'system') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        style = 'dark';
      } else {
        style = 'light';
      }
    }
    const switchImagesList = [].slice.call(document.querySelectorAll('[data-app-' + style + '-img]'));
    switchImagesList.map(function (imageEl) {
      const setImage = imageEl.getAttribute('data-app-' + style + '-img');
      imageEl.src = assetsPath + 'img/' + setImage; // Using window.assetsPath to get the exact relative path
    });
  }

  //Style Switcher (Light/Dark/System Mode)
  let styleSwitcher = document.querySelector('.dropdown-style-switcher');

  // Get style from local storage or use 'system' as default
  let storedStyle =
    localStorage.getItem('templateCustomizer-' + templateName + '--Style') || //if no template style then use Customizer style
    (window.templateCustomizer?.settings?.defaultStyle ?? 'light'); //!if there is no Customizer then use default style as light
  
  // Set style on click of style switcher item if template customizer is enabled
  if (window.templateCustomizer && styleSwitcher) {
    let styleSwitcherItems = [].slice.call(styleSwitcher.children[1].querySelectorAll('.dropdown-item'));
    styleSwitcherItems.forEach(function (item) {
      item.addEventListener('click', function () {
        let currentStyle = this.getAttribute('data-theme');
        if (currentStyle === 'light') {
          window.templateCustomizer.setStyle('light');
        } else if (currentStyle === 'dark') {
          window.templateCustomizer.setStyle('dark');
        } else {
          window.templateCustomizer.setStyle('system');
        }
      });
    });

    // Update style switcher icon based on the stored style

    const styleSwitcherIcon = styleSwitcher.querySelector('i');

    if (storedStyle === 'light') {
      styleSwitcherIcon.classList.add('ti-sun');
      styleSwitcherIcon.classList.remove('ti-moon');
      styleSwitcherIcon.classList.remove('ti-device-desktop');
      new bootstrap.Tooltip(styleSwitcherIcon, {
        title: '浅色模式',
        fallbackPlacements: ['bottom']
      });
    } else if (storedStyle === 'dark') {
      styleSwitcherIcon.classList.add('ti-moon');
      styleSwitcherIcon.classList.remove('ti-sun');
      styleSwitcherIcon.classList.remove('ti-device-desktop');
      new bootstrap.Tooltip(styleSwitcherIcon, {
        title: '深色模式',
        fallbackPlacements: ['bottom']
      });
    } else {
      styleSwitcherIcon.classList.add('ti-device-desktop');
      styleSwitcherIcon.classList.remove('ti-sun');
      styleSwitcherIcon.classList.remove('ti-moon');
      new bootstrap.Tooltip(styleSwitcherIcon, {
        title: '系统',
        fallbackPlacements: ['bottom']
      });
    }
  }

  // Run switchImage function based on the stored style
  switchImage(storedStyle);


  // Init helpers & misc
  // --------------------

  // Init BS Tooltip
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Accordion active class
  const accordionActiveFunction = function (e) {
    if (e.type == 'show.bs.collapse' || e.type == 'show.bs.collapse') {
      e.target.closest('.accordion-item').classList.add('active');
    } else {
      e.target.closest('.accordion-item').classList.remove('active');
    }
  };

  const accordionTriggerList = [].slice.call(document.querySelectorAll('.accordion'));
  const accordionList = accordionTriggerList.map(function (accordionTriggerEl) {
    accordionTriggerEl.addEventListener('show.bs.collapse', accordionActiveFunction);
    accordionTriggerEl.addEventListener('hide.bs.collapse', accordionActiveFunction);
  });

  // If layout is RTL add .dropdown-menu-end class to .dropdown-menu
  // if (isRtl) {
  //   Helpers._addClass('dropdown-menu-end', document.querySelectorAll('#layout-navbar .dropdown-menu'));
  // }

  // Auto update layout based on screen size
  window.Helpers.setAutoUpdate(true);

  // Toggle Password Visibility
  window.Helpers.initPasswordToggle();

  // Speech To Text
  window.Helpers.initSpeechToText();

  // Init PerfectScrollbar in Navbar Dropdown (i.e notification)
  window.Helpers.initNavbarDropdownScrollbar();

  let horizontalMenuTemplate = document.querySelector("[data-template^='horizontal-menu']");
  if (horizontalMenuTemplate) {
    // if screen size is small then set navbar fixed
    if (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) {
      window.Helpers.setNavbarFixed('fixed');
    } else {
      window.Helpers.setNavbarFixed('');
    }
  }

  // On window resize listener
  // -------------------------
  window.addEventListener(
    'resize',
    function (event) {
      // Hide open search input and set value blank
      if (window.innerWidth >= window.Helpers.LAYOUT_BREAKPOINT) {
        if (document.querySelector('.search-input-wrapper')) {
          document.querySelector('.search-input-wrapper').classList.add('d-none');
          document.querySelector('.search-input').value = '';
        }
      }
      // Horizontal Layout : Update menu based on window size
      if (horizontalMenuTemplate) {
        // if screen size is small then set navbar fixed
        if (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) {
          window.Helpers.setNavbarFixed('fixed');
        } else {
          window.Helpers.setNavbarFixed('');
        }
        setTimeout(function () {
          if (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT) {
            if (document.getElementById('layout-menu')) {
              if (document.getElementById('layout-menu').classList.contains('menu-horizontal')) {
                menu.switchMenu('vertical');
              }
            }
          } else {
            if (document.getElementById('layout-menu')) {
              if (document.getElementById('layout-menu').classList.contains('menu-vertical')) {
                menu.switchMenu('horizontal');
              }
            }
          }
        }, 100);
      }
    },
    true
  );

  // 如果存在id accordionFaqCon则初始化faq
  // --------------------------------------------------------------------
  if (document.getElementById('accordionFaqCon')) {
    initFaq()
  }
  // 如果存在id commentArea则初始化comment
  // --------------------------------------------------------------------
  if (document.getElementById('commentArea')) {
    jsonComment.init();
  }

  // 登录初始化
  // --------------------------------------------------------------------
  initLogin();

  

  // 初始化教程右侧锚点滚动
  // --------------------------------------------------------------------
  // if (document.getElementById('anchorsContainer')) {
  //   new PerfectScrollbar(document.getElementById('anchorsContainer'), {
  //     wheelPropagation: false,
  //   });
  // }

  // Manage menu expanded/collapsed with templateCustomizer & local storage
  //------------------------------------------------------------------

  // If current layout is horizontal OR current window screen is small (overlay menu) than return from here
  if (isHorizontalLayout || window.Helpers.isSmallScreen()) {
    return;
  }

  // If current layout is vertical and current window screen is > small

  // Auto update menu collapsed/expanded based on the themeConfig
  // 关闭此处边栏收缩状态控制，只保留localstorage控制，否则会冲突
  // if (typeof TemplateCustomizer !== 'undefined') {
  //   if (window.templateCustomizer.settings.defaultMenuCollapsed) {
  //     window.Helpers.setCollapsed(true, false);
  //   } else {
  //     window.Helpers.setCollapsed(false, false);
  //   }
  // }

  // Manage menu expanded/collapsed state with local storage support If enableMenuLocalStorage = true in config.js
  // 此处判断左侧导航是否收缩，被我移动至config.js，因为如果放在这里，会等html渲染完毕再执行，如果记忆缩起则会出现
  // 先是expand状态然后collapse的交互，体验不好
  // if (typeof config !== 'undefined') {
  //   if (config.enableMenuLocalStorage) {
  //     try {
  //       if (localStorage.getItem('templateCustomizer-' + templateName + '--LayoutCollapsed') !== null)
  //         window.Helpers.setCollapsed(
  //           localStorage.getItem('templateCustomizer-' + templateName + '--LayoutCollapsed') === 'true',
  //           false
  //         );
  //     } catch (e) {}
  //   }
  // }
})();

// ! Removed following code if you do't wish to use jQuery. Remember that navbar search functionality will stop working on removal.
if (typeof $ !== 'undefined') {
  $(function () {
    // 更新功能浏览记录
    try {
      const historyTitleDom = document.getElementById('historyTitle');
      if (historyTitleDom) {
        const historyDataString = localStorage.getItem('history-cache-20');

        const currentHref = window.location.href;
        const currentData = {
          href: currentHref,
          title: $('#historyTitle').attr('data-title'),
          sub_title: $('#historyTitle').attr('data-subtitle'),
          icon: $('#historyTitle').attr('data-icon')
        }
        if (historyDataString) {
          const historyData = JSON.parse(historyDataString) || [];
          let historyExist = false;
          for (let i = 0; i < historyData.length; i++) {
            if (historyData[i].href === currentHref) {
              historyExist = true;
              break;
            }
          }
          if (!historyExist) {
            if (historyData.length > 20) {
              historyData.pop();
            }
            historyData.unshift(currentData);
            localStorage.setItem('history-cache-20', JSON.stringify(historyData));
          }
        } else {
          localStorage.setItem('history-cache-20', JSON.stringify([currentData]));
        }
      }


    } catch (error) {

    }
    // ! TODO: Required to load after DOM is ready, did this now with jQuery ready.
    window.Helpers.initSidebarToggle();
    // Toggle Universal Sidebar

    // Navbar Search with autosuggest (typeahead)
    // ? You can remove the following JS if you don't want to use search functionality.
    //----------------------------------------------------------------------------------

    var searchToggler = $('.search-toggler'),
      searchToggler2 = $('.search-toggler2'),
      searchInputWrapper = $('.search-input-wrapper'),
      searchInputWrapper2 = $('.search-input-wrapper2'),
      searchInput = $('.search-input'),
      contentBackdrop = $('.content-backdrop');

    // Open search input on click of search icon
    if (searchToggler.length) {
      searchToggler.on('click', function () {
        if (searchInputWrapper.length) {
          searchInputWrapper.toggleClass('d-none');
          searchInput.focus();
        }
      });
    }
    if (searchToggler2.length) {
      searchToggler2.on('click', function () {
        if (searchInputWrapper2.length) {
          searchInputWrapper2.toggleClass('active');
          $('#layout-navbar').toggleClass('active');
          searchInput.focus();
        }
      });
    }

    // 初始化收藏事件
    const collectNewModule = createNewObject(collectionModule);
    collectNewModule.isActiveUrl = '/JsonApi/user/usercenter/is_fava';

    collectNewModule.init()


    // Open search on 'CTRL+/'
    $(document).on('keydown', function (event) {
      let ctrlKey = event.ctrlKey,
        slashKey = event.which === 191;

      if (ctrlKey && slashKey) {
        if (searchInputWrapper.length) {
          searchInputWrapper.toggleClass('d-none');
          searchInput.focus();
        }
        if (searchInputWrapper2.length) {
          searchInputWrapper2.toggleClass('active');
          $('#layout-navbar').toggleClass('active');
          searchInput.focus();
        }
      }
    });
    // Note: Following code is required to update container class of typeahead dropdown width on focus of search input. setTimeout is required to allow time to initiate Typeahead UI.
    setTimeout(function () {
      var twitterTypeahead = $('.twitter-typeahead');
      searchInput.on('focus', function () {
        if (searchInputWrapper.hasClass('container-xxl')) {
          searchInputWrapper.find(twitterTypeahead).addClass('container-xxl');
          twitterTypeahead.removeClass('container-fluid');
        } else if (searchInputWrapper.hasClass('container-fluid')) {
          searchInputWrapper.find(twitterTypeahead).addClass('container-fluid');
          twitterTypeahead.removeClass('container-xxl');
        }
      });
    }, 10);

    // 高亮代码
    // --------------------------------------------------------------------
    // if (document.getElementById('markdownBody')) {

    //   //替换为 pre 标签
    //   // $('.example_code').unwrap().wrap('<pre/>');
    //   $('.example_code').find('br').remove()
    //   $('.example_code').replaceWith(function () {
    //     return $("<pre />").append($(this).contents());
    //   });

    //   $("pre").addClass("prettyprint");//如果其他地方也要用到pre，我们可以再加一个父标签的选择器来区分
    //   prettyPrint();//代替body上的onload事件加载该方法

    //   $('a.tryitbtn').text('运行代码').addClass('btn btn-primary');

    //   // hljs.highlightAll();
    // }

    if (searchInput.length) {
      // Filter config
      var filterConfig = function (data) {
        return function findMatches(q, cb) {
          let matches;
          matches = [];
          data.filter(function (i) {
            if (i.name.toLowerCase().startsWith(q.toLowerCase())) {
              matches.push(i);
            } else if (
              !i.name.toLowerCase().startsWith(q.toLowerCase()) &&
              i.name.toLowerCase().includes(q.toLowerCase())
            ) {
              matches.push(i);
              matches.sort(function (a, b) {
                return b.name < a.name ? 1 : -1;
              });
            } else {
              return [];
            }
          });
          cb(matches);
        };
      };

      // Search JSON
      // var searchJson = 'search-vertical.json'; // For vertical layout
      // if ($('#layout-menu').hasClass('menu-horizontal')) {
      //   var searchJson = 'search-horizontal.json'; // For vertical layout
      // }
      var searchJson = 'search_list.json'; // For vertical layout
      if ($('#layout-menu').hasClass('menu-horizontal')) {
        var searchJson = 'search_list.json'; // For vertical layout
      }
      // Search API AJAX call
      var searchData = $.ajax({
        url: assetsPath + 'json/' + searchJson, //? Use your own search api instead
        // url: '/JsonApi/Api/get_search_list', //? Use your own search api instead
        dataType: 'json',
        async: false
      }).responseJSON;
      // Init typeahead on searchInput
      searchInput.each(function () {
        var $this = $(this);
        searchInput
          .typeahead(
            {
              hint: false,
              classNames: {
                menu: 'tt-menu navbar-search-suggestion',
                cursor: 'active',
                suggestion: 'suggestion d-flex justify-content-between px-3 py-2 w-100'
              }
            },
            // ? Add/Update blocks as per need
            // Pages
              // tools
            {
              name: 'tools',
              display: 'name',
              limit: 100,
              source: filterConfig(searchData.tools),
              templates: {
                header: '<h6 class="suggestions-header text-primary mb-0 mx-3 mt-3 pb-2">工具</h6>',
                suggestion: function ({ url, icon, name }) {
                  return (
                      '<a href="' +
                      url +
                      '">' +
                      '<div>' +
                      '<i class="ti ' +
                      icon +
                      ' me-2"></i>' +
                      '<span class="align-middle">' +
                      name +
                      '</span>' +
                      '</div>' +
                      '</a>'
                  );
                },
                notFound:
                    '<div class="not-found px-3 py-2">' +
                    '<h6 class="suggestions-header text-primary mb-2">工具</h6>' +
                    '<p class="py-2 mb-0"><i class="ti ti-alert-circle ti-xs me-2"></i> 没有找到相应工具</p>' +
                    '</div>'
              }
            },
            {
              name: 'jiaocheng',
              display: 'name',
              limit: 100,
              source: filterConfig(searchData.jiaocheng),
              templates: {
                header: '<h6 class="suggestions-header text-primary mb-0 mx-3 mt-3 pb-2">教程</h6>',
                suggestion: function ({ url, icon, name }) {
                  return (
                    '<a href="' +
                    url +
                    '">' +
                    '<div>' +
                    '<i class="ti ' +
                    icon +
                    ' me-2"></i>' +
                    '<span class="align-middle">' +
                    name +
                    '</span>' +
                    '</div>' +
                    '</a>'
                  );
                },
                notFound:
                  '<div class="not-found px-3 py-2">' +
                  '<h6 class="suggestions-header text-primary mb-2">教程</h6>' +
                  '<p class="py-2 mb-0"><i class="ti ti-alert-circle ti-xs me-2"></i> 没有找到相应教程</p>' +
                  '</div>'
              }
            },
            // Members
            // {
            //   name: 'members',
            //   display: 'name',
            //   limit: 4,
            //   source: filterConfig(searchData.members),
            //   templates: {
            //     header: '<h6 class="suggestions-header text-primary mb-0 mx-3 mt-3 pb-2">Members</h6>',
            //     suggestion: function ({ name, src, subtitle }) {
            //       return (
            //         '<a href="app-user-view-account.html">' +
            //         '<div class="d-flex align-items-center">' +
            //         '<img class="rounded-circle me-3" src="' +
            //         assetsPath +
            //         src +
            //         '" alt="' +
            //         name +
            //         '" height="32">' +
            //         '<div class="user-info">' +
            //         '<h6 class="mb-0">' +
            //         name +
            //         '</h6>' +
            //         '<small class="text-muted">' +
            //         subtitle +
            //         '</small>' +
            //         '</div>' +
            //         '</div>' +
            //         '</a>'
            //       );
            //     },
            //     notFound:
            //       '<div class="not-found px-3 py-2">' +
            //       '<h6 class="suggestions-header text-primary mb-2">Members</h6>' +
            //       '<p class="py-2 mb-0"><i class="ti ti-alert-circle ti-xs me-2"></i> No Results Found</p>' +
            //       '</div>'
            //   }
            // }
          )
          //On typeahead result render.
          .bind('typeahead:render', function () {
            // Show content backdrop,
            contentBackdrop.addClass('show').removeClass('fade');
          })
          // On typeahead select
          .bind('typeahead:select', function (ev, suggestion) {
            // Open selected page
            if (suggestion.url) {
              window.location = suggestion.url;
            }
          })
          // On typeahead close
          .bind('typeahead:close', function () {
            // Clear search
            searchInput.val('');
            $this.typeahead('val', '');
            // Hide search input wrapper
            searchInputWrapper.addClass('d-none');
            searchInputWrapper2.removeClass('active');
            $('#layout-navbar').removeClass('active');
            // Fade content backdrop
            contentBackdrop.addClass('fade').removeClass('show');
          });

        // On searchInput keyup, Fade content backdrop if search input is blank
        searchInput.on('keyup', function () {
          if (searchInput.val() == '') {
            contentBackdrop.addClass('fade').removeClass('show');
          }
        });
      });

      // Init PerfectScrollbar in search result
      var psSearch;
      $('.navbar-search-suggestion').each(function () {
        psSearch = new PerfectScrollbar($(this)[0], {
          wheelPropagation: false,
          suppressScrollX: true
        });
      });

      searchInput.on('keyup', function () {
        psSearch.update();
      });
    }

    // 初始化搜索功能
    function searchAction (e) {
      const inputDom = $(e).parent().find('input.searchInput');
      if (inputDom.length === 0) {
        return;
      }
      const searchVal = $.trim(inputDom.eq(0).val());
      if (!searchVal || searchVal === "") {
        return
      }
      const btnDom = $(e).parent().find('.searchBtn').eq(0);
      if (btnDom.length === 0) {
        return;
      }
      const url = btnDom.attr('data-url') + '-' + searchVal + '/';
      const target = btnDom.attr('data-target');
      if (target === '_blank') {
        window.open(url);
      } else {
        window.location.href = url;
      }
    }
    $('.searchBtn').click(function(e) {
      searchAction(this)
    });
    $('input.searchInput').on('keypress', function(e) {
      // 如果按下的是 Enter 键
      if (e.keyCode === 13) {
        // 执行相应的操作
        searchAction(this);
      }
    });

    // 初始化教程的水平导航，左右滚动以及active停留
    // 如果存在swiperTap说明是教程导航，此时需要判断移动端和pc端，分别进行初始化

    if (document.getElementById('bookNavHasExit')) {
      var bookPcSwiperNav = null, bookMobileMenuNav = null;
      function initbookNav() {
        var windowWidth = $(window).outerWidth(true);

        if (windowWidth >= window.Helpers.LAYOUT_BREAKPOINT) {
          // if (!bookPcSwiperNav) {
          //   var initialSile = $('#swiperNavList li.active').index();
          //   // $("#swiperNavList li").each(function (index, item) {
          //   //   $(item).css('width', $(item).innerWidth(true))
          //   // });
          //   bookPcSwiperNav = new Swiper('.swiper-tab', {
          //     slidesPerView: "auto",
          //     spaceBetween: 0,
          //     initialSlide: initialSile,
          //     navigation: {
          //       nextEl: '.swiper-tab-next',
          //       prevEl: '.swiper-tab-prev',
          //     },
          //   });
          // }
        } else {
          var element = document.getElementById('layout-menu');
          if (!bookMobileMenuNav && element) {
            bookMobileMenuNav = new Menu(element, {
              orientation: 'horizontal',
            });
            // Change parameter to true if you want scroll animation
            window.Helpers.scrollToActive((animate = false));
            window.Helpers.mainMenu = menu;
            // console.log(bookMobileMenuNav)
          }
        }
      }
      initbookNav();
    }

    // 初始化教程左侧按钮点击收缩
    // --------------------------------------------------------------------
    $('#offcanvasNavCollapseBtn').click(function () {
      $('#offcanvasNav').toggleClass('hidden');
      $('.book-container').toggleClass('ps-0');
      $('.content-footer').toggleClass('ps-0');
    });

    // 锚点点击偏移
    // --------------------------------------------------------------------
    function anchorOffset(e) {
      var t;
      void 0 !== this
        ? location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
        location.hostname == this.hostname &&
        (t = (t = $(this.hash)).length
          ? t
          : $("[name=" + this.hash.slice(1) + "]")).length &&
        $("html, body").animate({ scrollTop: t.offset().top - 136 }, 10)
        : (t = (t = $(location.hash)).length
          ? t
          : $("[name=" + location.hash.slice(1) + "]")).length &&
        $("html, body").animate({ scrollTop: t.offset().top - 136 }, 10);
    }


    // 给code添加复制按钮
    if ($('.markdown-body pre').length > 0) {

      var preNode = $('.markdown-body pre');
      preNode.wrap('<div class="position-relative pre-parent-container"></div>');

      setTimeout(() => {
        $('.pre-parent-container').prepend(`<button type="button" class="btn-clipboard btn btn-xs" 
    data-bs-toggle="tooltip" data-bs-placement="top" data-bs-original-title="复制成功!" title="复制到剪贴板">
    <span>Copy</span>
  </button>`);
        setTimeout(() => {
          [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function(e){return new bootstrap.Tooltip(e)});
          let t = new ClipboardJS(".btn-clipboard", {
            target: function (e) {
              return e.nextElementSibling;
            }
          });
          t.on("success", function (e) {
            let t = $(e.trigger);
            e.trigger.setAttribute("title", "复制成功!"),
            e.trigger.setAttribute("data-bs-original-title", "复制成功!"),
              t.tooltip("dispose"),
              t.tooltip("show"),
              e.trigger.setAttribute("title", "复制到剪贴板"),
              e.trigger.setAttribute("data-bs-original-title", "复制到剪贴板"),
              e.clearSelection();
          }),
            t.on("error", function (e) {
              let t =
                "Press " +
                (/Mac/i.test(navigator.userAgent) ? "Command" : "Ctrl-") +
                "C to copy",
                o = $(e.trigger);
              e.trigger.setAttribute("title", t),
              e.trigger.setAttribute("data-bs-original-title", t),
                o.tooltip("dispose"),
                o.tooltip("show"),
                e.trigger.setAttribute("title", "复制到剪贴板"),
                e.trigger.setAttribute("tidata-bs-original-titletle", "复制到剪贴板"),
                e.clearSelection();
            });
        }, 0)
      })

    }
    // tooptip按钮点击过后移除tooltip效果
    removeAllTooltipAfterClick();

    // 初始bootstrap的spy并添加右侧锚点链接
    if (document.getElementById('markdownCon')) {
      // $('#markdownCon .bd-toc-sidebar').html("");
      // $('#markdownBody h2:not(.example)').each(function (index, item) {
      //   if (index > 0) {
      //     const childAnchor = $(item).prevUntil(`h2:not(.example):eq(${index - 1})`, 'h3');
      //     if (childAnchor.length > 0) {
      //       const ul = document.createElement('ul');
      //       childAnchor.each(function (key, value) {
      //         $(value).attr('id', `anchor-${index - 1}-${key}`);
      //         const li = document.createElement('li');
      //         const a = document.createElement('a');
      //         a.title = $(value).text();
      //         a.innerText = $(value).text();
      //         a.href = `#anchor-${index - 1}-${key}`;
      //         li.appendChild(a);
      //         ul.insertBefore(li, ul.firstChild);
      //       });
      //       $('#markdownCon .bd-toc-sidebar li:last').append(ul)
      //     }

      //   }
      //   $(item).attr('id', `anchor-${index}`);
      //   const li = document.createElement('li');
      //   const a = document.createElement('a');
      //   a.title = $(item).text();
      //   a.innerText = $(item).text();
      //   a.href = `#anchor-${index}`;
      //   li.appendChild(a);
      //   $('#markdownCon .bd-toc-sidebar').append(li);
      // });
      setTimeout(() => {
        var scrollSpy = new bootstrap.ScrollSpy(document.body, {
          target: '#markdownCon',
        });
        $('#markdownCon a[href*="#"]')
          .not('[href="#"]')
          .not('[href="#0"]')
          .click(anchorOffset),
          location.hash && anchorOffset();
      }, 0)
    }


  });
// pc端导航点击
  $('#layout-menu .menu-inner .menu-toggle').click(function(e) {
    const windowWidth = $(window).outerWidth(true);
    if (windowWidth >= 1200) {
      const href = $(this).prop('href');
      // console.log(href)
      if (href !== 'javascript:;' && href !== 'javascript:void(0);') {
        window.location.href = href;
      }
    }
  })
}
