// Track Mermaid loading state
let mermaidLoading = false;
let mermaidInstance = null;

// Function to load Mermaid if not already loaded
async function loadMermaid() {
  if (mermaidLoading) return; // Prevent multiple simultaneous loads
  if (mermaidInstance) return mermaidInstance;

  mermaidLoading = true;
  try {
    const mermaid = await import('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs');
    mermaidInstance = mermaid;
    return mermaid;
  } catch (error) {
    console.error("Failed to load Mermaid library:", error);
    throw error;
  } finally {
    mermaidLoading = false;
  }
}

// Mermaid diagram handler for page transitions
document.addEventListener('pageTransitionComplete', async () => {
  // Check if the page has Mermaid diagrams
  const mermaidElements = document.querySelectorAll('.mermaid');
  if (mermaidElements.length === 0) return;

  // Give the DOM more time to settle and ensure proper initialization
  setTimeout(async () => {
    try {
      // Load or get existing Mermaid instance
      const mermaid = await loadMermaid();
      
      // Try to get the mermaid script element with theme data
      const scriptElement = document.getElementById('mermaid_script');
      
      // Get theme settings with fallbacks
      let lightTheme = 'default';
      let darkTheme = 'dark';
      
      if (scriptElement) {
        lightTheme = scriptElement.getAttribute('data-light-theme') || lightTheme;
        darkTheme = scriptElement.getAttribute('data-dark-theme') || darkTheme;
      }
      
      const theme = (document.body.classList.contains('dark') ? darkTheme : lightTheme);
      
      // Initialize mermaid with more robust error handling
      try {
        await mermaid.default.initialize({ 
          startOnLoad: false, 
          theme: theme,
          securityLevel: 'strict'
        });
      } catch (initError) {
        console.error("Failed to initialize Mermaid:", initError);
        throw initError;
      }
      
      // Add loading indicator class
      mermaidElements.forEach(el => el.classList.add('mermaid-loading'));

      // Render all diagrams
      let counter = 0;
      for (const item of mermaidElements) {
        const id = "mermaid-transition-" + counter++;
        
        // Store original code if not already stored
        let diagramCode;
        if (item.originalCode) {
          diagramCode = item.originalCode;
        } else {
          diagramCode = item.textContent.trim();
          item.originalCode = diagramCode;
        }
        
        if (!diagramCode) {
          console.error("Empty Mermaid diagram code detected");
          item.classList.remove('mermaid-loading');
          item.classList.add('mermaid-error');
          continue;
        }
        
        // Render the diagram with detailed error handling
        try {
          const { svg } = await mermaid.default.render(id, diagramCode);
          item.innerHTML = svg;
          item.classList.remove('mermaid-loading');
          item.classList.add('mermaid-rendered');
        } catch (err) {
          console.error("Error rendering mermaid diagram:", err);
          console.debug("Diagram code that caused error:", diagramCode);
          item.innerHTML = `<div class="mermaid-error">Error rendering diagram</div>`;
          item.classList.remove('mermaid-loading');
          item.classList.add('mermaid-error');
        }
      }
    } catch (error) {
      console.error("Failed to process Mermaid diagrams:", error);
      mermaidElements.forEach(el => {
        el.classList.remove('mermaid-loading');
        el.classList.add('mermaid-error');
        el.innerHTML = `<div class="mermaid-error">Failed to load Mermaid</div>`;
      });
    }
  }, 300); // Increased delay to ensure DOM and resources are ready
});
