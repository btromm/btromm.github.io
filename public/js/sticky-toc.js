document.addEventListener('DOMContentLoaded', function() {
  const headings = document.querySelectorAll('.single-content h2, .single-content h3, .single-content h4');
  const tocLinks = document.querySelectorAll('.sticky-toc a');
  const tocElement = document.querySelector('.sticky-toc');
  
  if (headings.length === 0 || tocLinks.length === 0 || !tocElement) {
    return; // No headings, TOC, or TOC element, exit early
  }

  // Add IDs to headings if they don't have them
  headings.forEach(heading => {
    if (!heading.id) {
      heading.id = heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
    }
  });

  // Get all section positions
  const sectionPositions = {};
  headings.forEach(heading => {
    sectionPositions[heading.id] = heading.getBoundingClientRect().top + window.pageYOffset - 100;
  });

  // Initial position of TOC in viewport (middle)
  const startPosition = 50; // Middle of the viewport (50vh)
  const topPosition = 5;    // Final position at the top (5vh)
  
  // Define a fixed scroll distance where TOC should reach the top
  const scrollDistance = 500; // TOC will go from middle to top after scrolling 500px

  // Use requestAnimationFrame for smoother updates
  let ticking = false;
  let lastKnownScrollPosition = 0;

  // Highlight the current section in the TOC and adjust TOC position
  function updateTOC() {
    const scrollPosition = lastKnownScrollPosition;
    
    // Calculate new position based purely on pixel scroll amount
    // It will move from startPosition to topPosition over scrollDistance pixels
    let newTopPosition;
    
    if (scrollPosition <= scrollDistance) {
      // Linear interpolation based on pure scroll position
      const scrollRatio = scrollPosition / scrollDistance;
      newTopPosition = startPosition - ((startPosition - topPosition) * scrollRatio);
    } else {
      // Keep at top position once we've scrolled past threshold
      newTopPosition = topPosition;
    }
    
    // Apply the position
    tocElement.style.top = `${newTopPosition}vh`;
    
    // Find the appropriate section for highlighting
    let currentSection = '';
    Object.keys(sectionPositions).forEach(sectionId => {
      if (scrollPosition >= sectionPositions[sectionId]) {
        currentSection = sectionId;
      }
    });

    // Remove .active-toc from all links
    tocLinks.forEach(link => {
      link.classList.remove('active-toc');
    });

    // Add .active-toc to the current section link
    if (currentSection) {
      const activeLink = document.querySelector(`.sticky-toc a[href="#${currentSection}"]`);
      if (activeLink) {
        activeLink.classList.add('active-toc');
      }
    }
    
    ticking = false;
  }
  
  // Optimized scroll handler using requestAnimationFrame
  function onScroll() {
    lastKnownScrollPosition = window.pageYOffset;
    
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTOC();
      });
      
      ticking = true;
    }
  }
  
  // Call the function on load
  updateTOC();

  // Add optimized scroll event listener
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Update on window resize to recalculate positions
  window.addEventListener('resize', () => {
    // Recalculate section positions on resize
    headings.forEach(heading => {
      sectionPositions[heading.id] = heading.getBoundingClientRect().top + window.pageYOffset - 100;
    });
    updateTOC();
  }, { passive: true });
});