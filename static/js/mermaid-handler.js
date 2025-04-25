// Mermaid diagram handler for page transitions
document.addEventListener('pageTransitionComplete', async () => {
  // Check if the page has Mermaid diagrams
  const mermaidElements = document.querySelectorAll('.mermaid');
  if (mermaidElements.length === 0) return;
  
  // Try to get the mermaid script element with theme data
  const scriptElement = document.getElementById('mermaid_script');
  
  // If mermaid script is found, we need to dynamically load mermaid
  if (scriptElement) {
    try {
      // Import mermaid dynamically
      const mermaid = await import('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs');
      
      // Get theme settings
      const lightTheme = scriptElement.getAttribute('data-light-theme') || 'default';
      const darkTheme = scriptElement.getAttribute('data-dark-theme') || 'dark';
      const theme = (document.body.classList.contains('dark') ? darkTheme : lightTheme);
      
      // Initialize mermaid
      mermaid.default.initialize({ 
        startOnLoad: false, 
        theme: theme 
      });
      
      // Render all diagrams
      let counter = 0;
      for (const item of mermaidElements) {
        const id = "mermaid-transition-" + counter++;
        
        // Store original code if not already stored
        if (!item.originalCode) {
          item.originalCode = item.textContent.trim();
        }
        
        // Render the diagram
        try {
          const { svg } = await mermaid.default.render(id, item.originalCode);
          item.innerHTML = svg;
        } catch (err) {
          console.error("Error rendering mermaid diagram:", err);
          item.innerHTML = `<div class="mermaid-error">Error rendering diagram</div>`;
        }
      }
    } catch (error) {
      console.error("Failed to load mermaid:", error);
    }
  }
});