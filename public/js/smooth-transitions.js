document.addEventListener('DOMContentLoaded', () => {
  // Store the current page's content for transitions
  let currentPage = {
    url: window.location.href,
    title: document.title,
    content: document.querySelector('.content')
  };

  // Add transition class to the body
  document.body.classList.add('transition-enabled');
  
  // Cache objects we'll reuse
  const contentContainer = document.querySelector('.content');
  
  // Intercept all internal link clicks
  document.addEventListener('click', e => {
    // Only handle clicks on internal links
    const link = e.target.closest('a');
    if (!link) return;
    
    // Skip if it's an external link, has a modifier key, or has a special attribute
    if (
      link.hostname !== window.location.hostname || 
      e.metaKey || 
      e.ctrlKey || 
      e.shiftKey || 
      e.altKey ||
      link.target === '_blank' ||
      link.dataset.noTransition === 'true' ||
      link.getAttribute('href').startsWith('#')
    ) {
      return;
    }
    
    // Prevent default link navigation
    e.preventDefault();
    
    // Get the target URL
    const targetUrl = link.href;
    
    // Don't do anything if it's the current page
    if (targetUrl === window.location.href) {
      return;
    }
    
    navigateTo(targetUrl);
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', event => {
    if (event.state && event.state.url) {
      navigateTo(event.state.url, false); // Don't add to history since popstate handles this
    }
  });
  
  // Navigation function
  async function navigateTo(url, addToHistory = true) {
    try {
      // Add class to body but no delay needed for instantaneous change
      document.body.classList.add('page-transition');
      
      // Fetch the new page
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const html = await response.text();
      
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract the parts we need from the new page
      const newContent = doc.querySelector('.content');
      const newTitle = doc.querySelector('title').textContent;
      
      // Update the page
      document.title = newTitle;
      contentContainer.innerHTML = newContent.innerHTML;
      
      // Update browser history
      if (addToHistory) {
        window.history.pushState({ url: url }, newTitle, url);
      }
      
      // Load and execute any scripts in the new content
      executeScripts(contentContainer);
      
      // Check if math is enabled on the page and initialize KaTeX if needed
      initializeMath();
      
      // Initialize TOC if present
      initializeTOC();
      
      // Complete the transition immediately
      document.body.classList.remove('page-transition');
      
      // Scroll to top of page by default
      window.scrollTo(0, 0);
      
      // Update the current page reference
      currentPage = {
        url: url,
        title: newTitle,
        content: newContent
      };
      
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to normal navigation if fetch fails
      window.location.href = url;
    }
  }
  
  // Function to check if math is enabled and initialize KaTeX
  function initializeMath() {
    const hasAutonumber = document.querySelector('.autonumber');
    const mathEnabled = hasAutonumber && hasAutonumber.dataset.math === 'true';
    
    if (document.body.classList.contains('math-enabled') || mathEnabled) {
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false }
          ]
        });
      } else {
        // If KaTeX isn't loaded yet, load it dynamically
        const katexCSS = document.createElement('link');
        katexCSS.rel = 'stylesheet';
        katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css';
        document.head.appendChild(katexCSS);
        
        const katexJS = document.createElement('script');
        katexJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.js';
        katexJS.defer = true;
        document.head.appendChild(katexJS);
        
        const autoRenderJS = document.createElement('script');
        autoRenderJS.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/contrib/auto-render.min.js';
        autoRenderJS.defer = true;
        autoRenderJS.onload = function() {
          renderMathInElement(document.body, {
            delimiters: [
              { left: "$$", right: "$$", display: true },
              { left: "$", right: "$", display: false }
            ]
          });
        };
        document.head.appendChild(autoRenderJS);
      }
    }
  }
  
  // Function to initialize TOC
  function initializeTOC() {
    // Check for TOC elements
    const tocContainer = document.querySelector('.toc-container');
    const stickyToc = document.querySelector('.sticky-toc');
    
    // Initialize regular TOC
    if (tocContainer) {
      // Reset any existing TOC item visibility states
      document.querySelectorAll('.toc-container li').forEach(li => {
        li.classList.remove('is-visible');
      });
      
      // Re-initialize the TOC helper
      const script = document.createElement('script');
      script.src = '/js/tochelper.js';
      script.defer = true;
      document.body.appendChild(script);
    }
    
    // Initialize sticky TOC if present
    if (stickyToc) {
      const stickyScript = document.createElement('script');
      stickyScript.src = '/js/sticky-toc.js';
      stickyScript.defer = true;
      document.body.appendChild(stickyScript);
    }
  }
  
  // Function to execute scripts loaded in the new content
  function executeScripts(element) {
    // Find all script tags
    const scripts = element.querySelectorAll('script');
    
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      
      // Copy all attributes from the old script
      Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });
      
      // Copy the script content
      newScript.textContent = oldScript.textContent;
      
      // Replace the old script with the new one to trigger execution
      if (oldScript.parentNode) {
        oldScript.parentNode.replaceChild(newScript, oldScript);
      } else {
        document.body.appendChild(newScript);
      }
    });
    
    // Re-initialize any components that rely on DOM ready events
    // For example: mermaid, copy-code, etc.
    if (window.runmermaid) runmermaid();
    
    // Dispatch a custom event that your components can listen for
    document.dispatchEvent(new CustomEvent('pageTransitionComplete'));
  }
});