// Reinitialize site components after page transitions
document.addEventListener('pageTransitionComplete', () => {
  // Reinitialize table of contents helpers
  if (document.querySelector('.toc-container')) {
    const tocScript = document.createElement('script');
    tocScript.src = '/js/tochelper.js';
    tocScript.defer = true;
    document.body.appendChild(tocScript);
  }
  
  // Reinitialize syntax highlighting and copy buttons
  if (document.querySelectorAll('pre').length > 0) {
    const copyScript = document.createElement('script');
    copyScript.src = '/js/copy-code.js';
    copyScript.defer = true;
    document.body.appendChild(copyScript);
  }
  
  // Reinitialize any sticky TOC elements
  if (document.querySelector('.sticky-toc')) {
    const stickyScript = document.createElement('script');
    stickyScript.src = '/js/sticky-toc.js';
    stickyScript.defer = true;
    document.body.appendChild(stickyScript);
  }
  
  // Handle any theme switching elements
  if (document.querySelector('body.auto')) {
    // Set theme based on system preference
    const themeScript = document.createElement('script');
    themeScript.src = '/js/theme-switch.js';
    document.body.appendChild(themeScript);
  }
  
  // If page has anchors or hash links, handle scrolling
  if (window.location.hash) {
    const element = document.querySelector(window.location.hash);
    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }, 100);
    }
  }
});