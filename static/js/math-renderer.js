// Helper script to render math on page transitions
document.addEventListener('pageTransitionComplete', () => {
  // Check if current page has math enabled
  const hasAutonumber = document.querySelector('.autonumber');
  const mathEnabled = hasAutonumber && hasAutonumber.dataset.math === 'true';
  
  if (mathEnabled && typeof renderMathInElement === 'function') {
    renderMathInElement(document.body, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ]
    });
  }
});