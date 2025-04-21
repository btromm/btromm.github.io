document.addEventListener('DOMContentLoaded', () => {
  // Keep the existing code for revealing TOC items when they become visible
  document.querySelectorAll('.toc-container li').forEach(li => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    obs.observe(li);
  });

  // New code to highlight the active TOC item based on scroll position
  // Get all headings that should be tracked
  const headings = document.querySelectorAll('.single-content h1, .single-content h2, .single-content h3, .single-content h4, .single-content h5, .single-content h6');
  const tocLinks = document.querySelectorAll('.toc-container a');
  
  if (headings.length === 0 || tocLinks.length === 0) return;
  
  // Create a map of heading IDs to their corresponding TOC links
  const idToTocLinkMap = {};
  tocLinks.forEach(link => {
    const id = link.getAttribute('href').substring(1); // Remove the # from href
    idToTocLinkMap[id] = link;
  });

  // Set up intersection observer for headings
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Store information about which headings are currently visible
      if (entry.target.id) {
        entry.target.dataset.visible = entry.isIntersecting;
      }
    });
    
    // Find the first visible heading
    let activeHeading = null;
    
    // First try to find headings that are entering the viewport
    for (const heading of headings) {
      if (heading.id && heading.dataset.visible === 'true') {
        activeHeading = heading;
        // Prefer headings that are near the top of the viewport
        if (heading.getBoundingClientRect().top > 0 && 
            heading.getBoundingClientRect().top < window.innerHeight / 3) {
          break;
        }
      }
    }
    
    // If no active heading was found, try again but choose the last visible one
    if (!activeHeading) {
      for (let i = headings.length - 1; i >= 0; i--) {
        if (headings[i].id && headings[i].dataset.visible === 'true') {
          activeHeading = headings[i];
          break;
        }
      }
    }
    
    // Update active TOC link
    if (activeHeading && activeHeading.id) {
      // Remove active class from all links
      tocLinks.forEach(link => {
        link.classList.remove('toc-active');
      });
      
      // Add active class to the corresponding TOC link
      const activeLink = idToTocLinkMap[activeHeading.id];
      if (activeLink) {
        activeLink.classList.add('toc-active');
      }
    }
  }, {
    rootMargin: '-10% 0px -80% 0px',  // Adjust the margins to control when headings are considered "visible"
    threshold: 0
  });
  
  // Observe all headings
  headings.forEach(heading => {
    headingObserver.observe(heading);
  });
});