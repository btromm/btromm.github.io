// Render ```mermaid code blocks with Pele (https://pele.run).
// Colors come from CSS variables in custom.css, so light/dark switches need no re-render.
import { mount } from 'https://cdn.jsdelivr.net/npm/pele@1.12.0/dist/pele.js';

for (const el of document.querySelectorAll('pre.mermaid')) {
  mount(el, el.textContent.trim());
}
