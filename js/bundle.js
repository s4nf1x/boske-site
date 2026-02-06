const header = document.querySelector('header');

if (header) {
  const toggleScrolledClass = () => {
    if (window.scrollY > 0) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', toggleScrolledClass);
  toggleScrolledClass();
}

document.addEventListener('DOMContentLoaded', function() {
  const menuItems = document.querySelectorAll('.menu-item-has-children');

  function setupMenu() {
    const isDesktop = window.innerWidth >= 1025;

    menuItems.forEach(item => {
      const subMenu = item.querySelector('.sub-menu');

      item.classList.remove('hover-active', 'accordion-active');
      item.onmouseenter = item.onmouseleave = item.onclick = null;

      if (subMenu) {
        subMenu.style.cssText = '';
      }

      const link = item.querySelector('a');
      if (link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();

          if (isDesktop) {
            const wasActive = item.classList.contains('hover-active');

            menuItems.forEach(otherItem => {
              otherItem.classList.remove('hover-active');
              const otherSubMenu = otherItem.querySelector('.sub-menu');
              if (otherSubMenu) otherSubMenu.style.cssText = '';
            });

            if (!wasActive) {
              item.classList.add('hover-active');
            }
          } else {
            const wasActive = item.classList.contains('accordion-active');

            menuItems.forEach(other => {
              if (other !== item) {
                other.classList.remove('accordion-active');
                const otherSub = other.querySelector('.sub-menu');
                if (otherSub) otherSub.style.maxHeight = '0';
              }
            });

            item.classList.toggle('accordion-active');

            if (subMenu) {
              subMenu.style.maxHeight = item.classList.contains('accordion-active')
                  ? subMenu.scrollHeight + 'px'
                  : '0';
            }
          }
        });
      }

      if (!isDesktop && subMenu) {
        subMenu.style.overflow = 'hidden';
        subMenu.style.transition = 'max-height 0.3s ease';
        subMenu.style.maxHeight = '0';
      }
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('.menu-item-has-children')) {
        menuItems.forEach(item => {
          item.classList.remove('hover-active', 'accordion-active');
          const subMenu = item.querySelector('.sub-menu');
          if (subMenu) {
            subMenu.style.cssText = '';
            if (!isDesktop) {
              subMenu.style.maxHeight = '0';
            }
          }
        });
      }
    });
  }

  setupMenu();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupMenu, 250);
  });
});

document.addEventListener('DOMContentLoaded', function() {
  const accordionItems = document.querySelectorAll('.accordion-item');

  if (accordionItems) {

    accordionItems.forEach(item => {
      const trigger = item.querySelector('.accordion-item-header');
      const content = item.querySelector('.accordion-item-content');

      trigger.addEventListener('click', function() {
        const parent = this.parentNode;

        if (parent.classList.contains('active')) {
          parent.classList.remove('active');
          content.style.height = '0';
        } else {
          document.querySelectorAll('.accordion-item').forEach(child => {
            child.classList.remove('active');
            child.querySelector('.accordion-item-content').style.height = '0';
          });
          parent.classList.add('active');
          content.style.height = content.scrollHeight + 'px';
        }
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const fileInputs = document.querySelectorAll('.wpcf7-file');

  fileInputs.forEach(function(fileInput) {
    const fileWrap = fileInput.closest('.wpcf7-form-control-wrap');

    const customFile = document.createElement('div');
    customFile.className = 'custom-file-display';
    customFile.innerHTML = `
          <div class="file-text">Прикрепить проект</div>
          <div class="file-icon"></div>
      `;

    fileWrap.appendChild(customFile);

    fileInput.addEventListener('change', function(e) {
      const fileName = this.files[0] ? this.files[0].name : 'Прикрепить проект';
      customFile.querySelector('.file-text').textContent = fileName;

      if (this.files[0]) {
        customFile.classList.add('file-selected');
      } else {
        customFile.classList.remove('file-selected');
      }
    });
  });
});

document.addEventListener('DOMContentLoaded', function() {
  var modalButtons = document.querySelectorAll('.open-modal-dialog'),
      overlay = document.querySelector('body'),
      closeButtons = document.querySelectorAll('.modal-dialog .modal-close');

  var currentOpenModal = null;
  var enterModalTimer = null;
  var isExitModalShown = false;
  var hasEnterModalShownInSession = false;
  var mobileExitTimer = null;

  function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  function setCookie(name, value, options = {}) {
    options = {
      path: '/',
      ...options
    };

    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }

    document.cookie = updatedCookie;
  }

  function getSessionStorageItem(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn('sessionStorage недоступен:', e);
      return null;
    }
  }

  function setSessionStorageItem(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn('Ошибка записи в sessionStorage:', e);
    }
  }

  async function openModal(modalBtn) {
    return new Promise(resolve => {
      var modalId = modalBtn.getAttribute('data-src'),
          modalElem = document.querySelector('.modal-dialog.' + modalId);

      if (currentOpenModal && currentOpenModal !== modalElem) {
        closeModalDirectly(currentOpenModal);
      }

      overlay.classList.add('modal-open');
      modalElem.style.display = 'flex';

      setTimeout(function() {
        modalElem.classList.add('modal-opening');
        currentOpenModal = modalElem;
        resolve();
      }, 0);
    });
  }

  async function openModalById(modalId) {
    var modalElem = document.querySelector('.modal-dialog.' + modalId);

    if (!modalElem) return;

    if (modalId === 'modal-form-light-exit' && isExitModalShown) return;

    if (currentOpenModal && currentOpenModal !== modalElem) {
      closeModalDirectly(currentOpenModal);
    }

    overlay.classList.add('modal-open');
    modalElem.style.display = 'flex';

    setTimeout(function() {
      modalElem.classList.add('modal-opening');
      currentOpenModal = modalElem;

      if (modalId === 'modal-form-light-exit') {
        isExitModalShown = true;
      } else if (modalId === 'modal-form-light-enter') {
        setSessionStorageItem('enterModalShownInSession', 'true');
        hasEnterModalShownInSession = true;
      }
    }, 10);
  }

  async function closeModal(closeBtn) {
    var modal = closeBtn.closest('.modal-dialog');
    modal.classList.remove('modal-opening');
    modal.classList.add('modal-closing');

    setTimeout(function() {
      modal.classList.remove('modal-closing');
      modal.style.display = 'none';
      overlay.classList.remove('modal-open');
      if (currentOpenModal === modal) currentOpenModal = null;
    }, 500);
  }

  function closeModalDirectly(modalElem) {
    modalElem.classList.remove('modal-opening');
    modalElem.style.display = 'none';
    if (currentOpenModal === modalElem) currentOpenModal = null;
    if (!document.querySelector('.modal-dialog[style*="display: flex"]')) {
      overlay.classList.remove('modal-open');
    }
  }

  function scheduleEnterModal() {
    var wasShownInSession = getSessionStorageItem('enterModalShownInSession');

    if (wasShownInSession === 'true' || hasEnterModalShownInSession) {
      return;
    }

    enterModalTimer = setTimeout(function() {
      if (!hasEnterModalShownInSession && getSessionStorageItem('enterModalShownInSession') !== 'true') {
        openModalById('modal-form-light-enter');
      }
    }, 30000);
  }

  function setupExitModal() {
    if (window.innerWidth > 1024) {
      var showExitTimeout;

      document.addEventListener('mousemove', function(e) {
        if (e.clientY < 10 && !isExitModalShown) {
          if (!showExitTimeout) {
            showExitTimeout = setTimeout(function() {
              openModalById('modal-form-light-exit');
              showExitTimeout = null;
            }, 300);
          }
        } else {
          if (showExitTimeout) {
            clearTimeout(showExitTimeout);
            showExitTimeout = null;
          }
        }
      });
    } else {
      mobileExitTimer = setTimeout(function() {
        if (!isExitModalShown) {
          openModalById('modal-form-light-exit');
        }
      }, 15000);
    }
  }

  function initCookieModal() {
    const cookieAccepted = getCookie('cookieAccepted');
    const cookieModal = document.querySelector('.modal-dialog.modal-cookie');
    const acceptBtn = document.querySelector('.btn-accept');

    if (!cookieAccepted && cookieModal && acceptBtn) {
      setTimeout(() => {
        openModalById('modal-cookie');
      }, 1000);

      acceptBtn.addEventListener('click', function(e) {
        e.preventDefault();
        setCookie('cookieAccepted', 'true', {
          expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          secure: true,
          samesite: 'strict'
        });

        const closeBtn = cookieModal.querySelector('.modal-close');
        if (closeBtn) {
          closeModal(closeBtn);
        } else {
          closeModalDirectly(cookieModal);
        }
      });
    }
  }

  function init() {
    document.querySelectorAll('.modal-dialog').forEach(function(modal) {
      modal.classList.remove('modal-opening');
      modal.style.display = 'none';
    });

    hasEnterModalShownInSession = getSessionStorageItem('enterModalShownInSession') === 'true';

    scheduleEnterModal();
    setupExitModal();
    initCookieModal();
  }

  modalButtons.forEach(function(modalBtn) {
    modalBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      await openModal(modalBtn);
    });
  });

  closeButtons.forEach(function(closeBtn) {
    closeBtn.addEventListener('click', async function(e) {
      await closeModal(closeBtn);
    });
  });

  document.querySelectorAll('.modal-dialog').forEach(function(item) {
    item.addEventListener('click', async function(e) {
      if (e.target !== e.currentTarget) return;
      await closeModal(this);
    });
  });

  init();
});

document.addEventListener('DOMContentLoaded', function() {
  const videoContainers = document.querySelectorAll('.custom-video');

  videoContainers.forEach(container => {
    const video = container.querySelector('video');
    const playButton = container.querySelector('.button-play-video');

    video.removeAttribute('controls');

    playButton.addEventListener('click', function() {
      if (video.paused) {
        video.play();
        playButton.style.display = 'none';
      }
    });

    video.addEventListener('pause', function() {
      playButton.style.display = 'block';
    });

    video.addEventListener('ended', function() {
      playButton.style.display = 'block';});

    video.addEventListener('click', function() {
      if (!video.paused) {
        playButton.style.display = 'none';
      }
    });
  });
});


document.addEventListener('DOMContentLoaded', function() {
  const filterItems = document.querySelectorAll('.filter-item');

  filterItems.forEach(item => {
    item.addEventListener('click', function() {
      filterItems.forEach(filter => {
        filter.classList.remove('active');
      });

      this.classList.add('active');
    });
  });
});


class TabsManager {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      return;
    }

    this.tabButtons = this.container.querySelectorAll('.nav-button');
    this.tabPanels = this.container.querySelectorAll('.tab-panel');
    this.isAnimating = false;
    this.animationDuration = 400;

    this.init();
  }

  init() {
    if (this.tabButtons.length === 0 || this.tabPanels.length === 0) {
      return;
    }

    this.tabPanels.forEach(panel => {
      panel.style.display = 'none';
      panel.style.opacity = '0';
      panel.style.visibility = 'hidden';
    });
    this.activateTab(1);
    this.tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (this.isAnimating) return;

        const button = e.currentTarget;
        const tabId = parseInt(button.dataset.tabId);

        if (!isNaN(tabId)) {
          this.switchTab(tabId);
        }
      });
    });
  }

  async switchTab(targetTabId) {
    if (this.isAnimating) return;

    const targetButton = this.container.querySelector(`.nav-button[data-tab-id="${targetTabId}"]`);
    const targetPanel = this.container.querySelector(`.tab-panel[data-tab-id="${targetTabId}"]`);

    if (!targetButton || !targetPanel) {
      return;
    }

    if (targetButton.classList.contains('active')) {
      return;
    }

    this.isAnimating = true;

    const activePanel = this.container.querySelector('.tab-panel.active');
    const activeButton = this.container.querySelector('.nav-button.active');

    if (activePanel) {
      activePanel.style.opacity = '0';

      await this.wait(this.animationDuration / 2);

      activePanel.classList.remove('active');
      activePanel.style.display = 'none';
      activePanel.style.visibility = 'hidden';
    }

    this.tabButtons.forEach(btn => btn.classList.remove('active'));

    targetButton.classList.add('active');

    targetPanel.style.display = 'block';
    targetPanel.style.visibility = 'visible';
    targetPanel.classList.add('active');

    await this.wait(10);

    targetPanel.style.opacity = '1';

    await this.wait(this.animationDuration);

    this.isAnimating = false;
  }

  activateTab(tabId) {
    const button = this.container.querySelector(`.nav-button[data-tab-id="${tabId}"]`);
    const panel = this.container.querySelector(`.tab-panel[data-tab-id="${tabId}"]`);

    if (button && panel) {
      this.tabButtons.forEach(btn => btn.classList.remove('active'));
      this.tabPanels.forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
        p.style.opacity = '0';
        p.style.visibility = 'hidden';
      });

      button.classList.add('active');
      panel.classList.add('active');
      panel.style.display = 'block';
      panel.style.opacity = '1';
      panel.style.visibility = 'visible';
    }
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const tabsManager = new TabsManager('.tabs-block');
});

function checkVisibility() {
  const blocks = document.querySelectorAll('.animate-section');

  blocks.forEach(block => {
    if (block.hasAttribute('data-animated')) {
      return;
    }

    const rect = block.getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight && rect.bottom >= 0;

    if (isVisible) {
      setTimeout(() => {
        block.classList.add('animated');
        block.setAttribute('data-animated', 'true');
      }, 500);
    }
  });
}

window.addEventListener('load', checkVisibility);
window.addEventListener('scroll', checkVisibility);


const mobileMenuButton = document.querySelector('.mobile-menu-btn');
const closeMenuButton = document.querySelector('.close-menu-button');
const headerNav = document.querySelector('.header-nav');
let isMenuOpen = false;

function toggleMobileMenu() {
  isMenuOpen = !isMenuOpen;

  if (isMenuOpen) {
    headerNav.classList.add('show');
  } else {
    headerNav.classList.remove('show');
  }
}

function closeMobileMenu() {
  isMenuOpen = false;
  headerNav.classList.remove('show');
}

mobileMenuButton.addEventListener('click', toggleMobileMenu);
closeMenuButton.addEventListener('click', closeMobileMenu);

document.addEventListener('click', (e) => {
  if (isMenuOpen &&
      !headerNav.contains(e.target) &&
      !mobileMenuButton.contains(e.target)) {
    closeMobileMenu();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen) {
    closeMobileMenu();
  }
});

var swiper1 = new Swiper(".blog-slider", {
  observer: true,
  observeParents: true,
  observeSlideChildren: true,
  watchSlidesProgress: true,
  pagination: {
    el: ".blog-slider .swiper-pagination",
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    601: {
      slidesPerView: 1,
      spaceBetween: 20,
    },
    1025: {
      slidesPerView: 3,
      spaceBetween: 20,
    },
  }
});

var swiper2 = new Swiper(".gallery-slider", {
  observer: true,
  observeParents: true,
  observeSlideChildren: true,
  watchSlidesProgress: true,
  navigation: {
    nextEl: ".content-block-slider .swiper-button-next",
    prevEl: ".content-block-slider .swiper-button-prev",
  },
  breakpoints: {
    320: {
      slidesPerView: 1.4,
      spaceBetween: 20,
    },
    601: {
      slidesPerView: 1.75,
      spaceBetween: 20,
    },
    1025: {
      slidesPerView: 2.35,
      spaceBetween: 20,
    },
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const imageWrappers = document.querySelectorAll('.images-wrapper');

  imageWrappers.forEach(wrapper => {
    const images = wrapper.querySelectorAll('img');

    if (images.length === 1) {
      wrapper.classList.add('single-image');
    } else if (images.length === 2) {
      wrapper.classList.add('double-image');
    }
  });
});

var swiper4 = new Swiper(".gallery-slider-main", {
  spaceBetween: 10,
  slidesPerView: 1,
  effect: "fade",
  observer: true,
  observeParents: true,
  watchSlidesProgress: true,
  navigation: {
    nextEl: ".gallery-slider-main .swiper-button-next",
    prevEl: ".gallery-slider-main .swiper-button-prev",
  },
});

var swiper3 = new Swiper(".gallery-slider-thumbs", {
  spaceBetween: 20,
  slidesPerView: 10,
  watchSlidesProgress: true,
  observer: true,
  observeParents: true,
  breakpoints: {
    0: {
      slidesPerView: 5,
      spaceBetween: 10,
    },
    1025: {
      slidesPerView: 10,
      spaceBetween: 20,
    },
  },
  on: {
    click: function() {
      var clickedIndex = this.clickedIndex;

      swiper4.slideTo(clickedIndex);

      this.slideTo(clickedIndex);
    }
  }
});

swiper4.on('slideChange', function() {
  swiper3.slideTo(swiper4.activeIndex);
});

swiper3.on('slideChange', function() {
  swiper4.slideTo(swiper3.activeIndex);
});
