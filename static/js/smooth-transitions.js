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
      // Start the page transition animation
      document.body.classList.add('page-transition');
      
      // Add a small delay to allow the animation to begin
      await new Promise(resolve => setTimeout(resolve, 300));
      
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
      
      // Complete the transition
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
    // For example: tochelper, copy-code, etc.
    if (window.runmermaid) runmermaid();
    
    // Dispatch a custom event that your components can listen for
    document.dispatchEvent(new CustomEvent('pageTransitionComplete'));
  }
});