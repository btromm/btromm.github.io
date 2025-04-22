// TOC initialization handler for both initial page load and transitions
(function() {
  // Initialize TOC on page load
  document.addEventListener('DOMContentLoaded', initializeTOC);
  
  // Re-initialize TOC during page transitions
  document.addEventListener('pageTransitionComplete', initializeTOC);
  
  function initializeTOC() {
    // Find TOC components
    const tocContainer = document.querySelector('.toc-container');
    const stickyToc = document.querySelector('.sticky-toc');
    
    // Handle regular TOC
    if (tocContainer) {
      // First make all TOC items visible
      document.querySelectorAll('.toc-container li').forEach(li => {
        li.style.opacity = '1';
        li.style.transform = 'translateX(0)';
        li.classList.add('is-visible');
      });
      
      // Get all headings that should be tracked
      const headings = document.querySelectorAll('.single-content h1, .single-content h2, .single-content h3, .single-content h4, .single-content h5, .single-content h6');
      const tocLinks = document.querySelectorAll('.toc-container a');
      
      if (headings.length > 0 && tocLinks.length > 0) {
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
          rootMargin: '-10% 0px -80% 0px',
          threshold: 0
        });
        
        // Observe all headings
        headings.forEach(heading => {
          headingObserver.observe(heading);
        });
      }
    }
    
    // Handle sticky TOC
    if (stickyToc) {
      const headings = document.querySelectorAll('.single-content h2, .single-content h3, .single-content h4');
      const tocLinks = document.querySelectorAll('.sticky-toc a');
      const tocElement = document.querySelector('.sticky-toc');
      
      if (headings.length > 0 && tocLinks.length > 0 && tocElement) {
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
        
        // Update TOC position based on scroll position
        let lastKnownScrollPosition = window.scrollY;
        let ticking = false;
        
        function updateTOC() {
          const scrollPosition = lastKnownScrollPosition;
          
          // Calculate new position based purely on pixel scroll amount
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
        
        // Initialize TOC position
        updateTOC();
        
        // Add scroll listener
        window.addEventListener('scroll', onScroll, { passive: true });
        
        // Update on window resize
        window.addEventListener('resize', () => {
          // Recalculate section positions on resize
          headings.forEach(heading => {
            sectionPositions[heading.id] = heading.getBoundingClientRect().top + window.pageYOffset - 100;
          });
          
          // Update TOC
          updateTOC();
        }, { passive: true });
      }
    }
  }
})();