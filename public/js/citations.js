// Function to fetch citation counts from Crossref API
async function fetchCitationCount(doi) {
  try {
    // Using Crossref API to fetch citation data
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    
    if (!response.ok) {
      console.error(`Error fetching citation data: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    // Crossref provides citation count in the is-referenced-by-count field
    const citationCount = data.message && data.message['is-referenced-by-count'] || 0;
    return citationCount;
  } 
  catch (error) {
        console.error('Failed to fetch citation count:', error);        
        return null;
  }
}

// Function to update citation counts on the page
async function updateCitationCounts() {
  const publicationEntries = document.querySelectorAll('.publication-entry'); // finds all elements with the class .publication-entry
  
  for (const entry of publicationEntries) {
    const citationElement = entry.querySelector('.publication-citations');
    if (!citationElement) continue;
    
    const doiLink = entry.querySelector('.publication-title').getAttribute('href');
    // Extract DOI from the URL (for https://doi.org/10.1002/hbm.70209)
    const doi = doiLink.startsWith('https://doi.org/') ? doiLink.substring(16) : doiLink;
    
    const count = await fetchCitationCount(doi);
    if (count !== null) {
      citationElement.textContent = `${count} ${count === 1 ? 'citation' : 'citations'}`;
    } else {
      citationElement.textContent = 'Citation data unavailable';
    }
  }
}

// Run the update function when the page is fully loaded
document.addEventListener('DOMContentLoaded', updateCitationCounts);